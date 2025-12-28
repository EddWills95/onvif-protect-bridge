import http from "http";
import { getLocalIPv4 } from "./utils/getLocalIPv4";
import { setupWSDiscovery } from "../ws-discovery";
import { Camera } from "./domain/Camera";

// const HOST = "192.168.1.66";

/* ---------------- Camera ---------------- */

const camera = new Camera({
  id: "cam7",
  name: "Camera 7",
  restreamPath: "/cam7",
});

const PORT = 8000;
const RTSP_URI = camera.rtspUri(getLocalIPv4(), 8554);

/* ---------------- helpers ---------------- */

function soap(res: http.ServerResponse, xml: string): void {
  res.writeHead(200, { "Content-Type": "application/soap+xml" });
  res.end(xml);
}

// function challenge(res: http.ServerResponse): void {
//   res.writeHead(401, {
//     "WWW-Authenticate":
//       'Digest realm="ONVIF", qop="auth", nonce="dummy", opaque="dummy"',
//   });
//   res.end();
// }

function envelope(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    ${body}
  </s:Body>
</s:Envelope>`;
}

/* ---------------- device responses ---------------- */

function getSystemDateAndTime() {
  const now = new Date();

  return envelope(`
<GetSystemDateAndTimeResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <SystemDateAndTime>
    <UTCDateTime>
      <Time><Hour>${now.getUTCHours()}</Hour><Minute>${now.getUTCMinutes()}</Minute><Second>${now.getUTCSeconds()}</Second></Time>
      <Date><Year>${now.getUTCFullYear()}</Year><Month>${
    now.getUTCMonth() + 1
  }</Month><Day>${now.getUTCDate()}</Day></Date>
    </UTCDateTime>
  </SystemDateAndTime>
</GetSystemDateAndTimeResponse>`);
}

function getServices() {
  return envelope(`
<GetServicesResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <Service>
    <Namespace>http://www.onvif.org/ver10/media/wsdl</Namespace>
    <XAddr>http://${getLocalIPv4()}:${PORT}/onvif/media_service</XAddr>
    <Version>
      <Major>2</Major>
      <Minor>0</Minor>
    </Version>
    <Capabilities>
      <StreamingCapabilities>
        <RTPMulticast>false</RTPMulticast>
        <RTP_TCP>true</RTP_TCP>
        <RTP_RTSP_TCP>true</RTP_RTSP_TCP>
      </StreamingCapabilities>
    </Capabilities>
  </Service>

  <Service>
    <Namespace>http://www.onvif.org/ver10/media/wsdl</Namespace>
    <XAddr>http://${getLocalIPv4()}:${PORT}/onvif/media_service</XAddr>
    <Version><Major>2</Major><Minor>0</Minor></Version>
  </Service>
</GetServicesResponse>`);
}

function getCapabilities() {
  return envelope(`
<GetCapabilitiesResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <Capabilities>
    <Device>
      <XAddr>http://${getLocalIPv4()}:${PORT}/onvif/device_service</XAddr>
      <UserManagement>true</UserManagement>
      <Security>
        <UsernameToken>true</UsernameToken>
      </Security>
    </Device>
    <Media>
      <XAddr>http://${getLocalIPv4()}:${PORT}/onvif/media_service</XAddr>
    </Media>
  </Capabilities>
</GetCapabilitiesResponse>`);
}

function getDeviceInformation() {
  return envelope(`
<GetDeviceInformationResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <Manufacturer>RTSP Bridge</Manufacturer>
  <Model>Driveway</Model>
  <FirmwareVersion>1.0</FirmwareVersion>
  <SerialNumber>1234</SerialNumber>
  <HardwareId>bridge</HardwareId>
</GetDeviceInformationResponse>`);
}

function getUsers() {
  return envelope(`
<GetUsersResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <User>
    <Username>admin</Username>
    <UserLevel>Administrator</UserLevel>
  </User>
</GetUsersResponse>`);
}

function getScopes() {
  return `
    <tds:GetScopesResponse>
      <tds:Scopes>
        <tt:ScopeDef>Fixed</tt:ScopeDef>
        <tt:ScopeItem>onvif://www.onvif.org/type/video_encoder</tt:ScopeItem>
      </tds:Scopes>
      <tds:Scopes>
        <tt:ScopeDef>Fixed</tt:ScopeDef>
        <tt:ScopeItem>onvif://www.onvif.org/Profile/Streaming</tt:ScopeItem>
      </tds:Scopes>
      <tds:Scopes>
        <tt:ScopeDef>Fixed</tt:ScopeDef>
        <tt:ScopeItem>onvif://www.onvif.org/name/RTSP-Bridge</tt:ScopeItem>
      </tds:Scopes>
    </tds:GetScopesResponse>
  `;
}

/* ---------------- media responses ---------------- */

function getProfiles() {
  return envelope(`
<GetProfilesResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
  <Profiles token=${camera.profileToken}>
    <Name>${camera.name}</Name>

    <VideoSourceConfiguration token="vsc_1">
      <Name>VideoSource</Name>
      <SourceToken>vs_1</SourceToken>
      <Bounds x="0" y="0" width="704" height="576"/>
    </VideoSourceConfiguration>

    <VideoEncoderConfiguration token="vec_1">
      <Name>H264</Name>
      <Encoding>H264</Encoding>
      <Resolution>
        <Width>704</Width>
        <Height>576</Height>
      </Resolution>
      <RateControl>
        <FrameRateLimit>25</FrameRateLimit>
        <EncodingInterval>1</EncodingInterval>
        <BitrateLimit>2048</BitrateLimit>
      </RateControl>
      <H264>
        <GovLength>50</GovLength>
        <H264Profile>Baseline</H264Profile>
      </H264>
    </VideoEncoderConfiguration>
  </Profiles>
</GetProfilesResponse>`);
}

function getVideoSources() {
  return envelope(`
<GetVideoSourcesResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
  <VideoSources token="vs_1"/>
</GetVideoSourcesResponse>`);
}

function getStreamUri() {
  return envelope(`
<GetStreamUriResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
  <MediaUri>
    <Uri>${RTSP_URI}</Uri>
    <InvalidAfterConnect>false</InvalidAfterConnect>
    <InvalidAfterReboot>false</InvalidAfterReboot>
    <Timeout>PT60S</Timeout>
  </MediaUri>
</GetStreamUriResponse>`);
}

function getSnapshotUri() {
  return envelope(`
<GetSnapshotUriResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
  <MediaUri>
    <Uri>${RTSP_URI}</Uri>
  </MediaUri>
</GetSnapshotUriResponse>`);
}

/* ---------------- server ---------------- */

const server = http.createServer((req, res) => {
  let body = "";

  req.on("data", (c) => {
    body += c;
  });

  req.on("end", () => {
    console.log("---- ONVIF REQUEST ----");
    console.log(req.method, req.url);
    console.log(body);
    console.log(body.includes("<Security") ? "AUTH: yes" : "AUTH: no");
    console.log("-----------------------");

    // Allow GET probes
    if (req.method !== "POST") {
      res.writeHead(200);
      return res.end("ONVIF");
    }

    /* ---- Device ---- */
    if (req.url === "/onvif/device_service") {
      if (body.includes("GetSystemDateAndTime")) {
        console.log("Handling: GetSystemDateAndTime");
        return soap(res, getSystemDateAndTime());
      }
      if (body.includes("GetServices")) {
        console.log("Handling: GetServices");
        return soap(res, getServices());
      }
      if (body.includes("GetCapabilities")) {
        console.log("Handling: GetCapabilities");
        return soap(res, getCapabilities());
      }
      if (body.includes("GetDeviceInformation")) {
        console.log("Handling: GetDeviceInformation");
        return soap(res, getDeviceInformation());
      }
      if (body.includes("GetUsers")) {
        console.log("Handling: GetUsers");
        return soap(res, getUsers());
      }
      if (body.includes("GetScopes")) {
        console.log("Handling: GetScopes");
        return soap(res, getScopes());
      }
    }
    /* ---- Media ---- */
    if (req.url === "/onvif/media_service") {
      if (body.includes("GetProfiles")) {
        console.log("Handling: GetProfiles");
        return soap(res, getProfiles());
      }
      if (body.includes("GetVideoSources")) {
        console.log("Handling: GetVideoSources");
        return soap(res, getVideoSources());
      }
      if (body.includes("GetStreamUri")) {
        console.log("Handling: GetStreamUri");
        return soap(res, getStreamUri());
      }
      if (body.includes("GetSnapshotUri")) {
        console.log("Handling: GetSnapshotUri");
        return soap(res, getSnapshotUri());
      }
    }

    res.writeHead(500);
    res.end("Unsupported ONVIF call");
  });
});

setupWSDiscovery();

server.listen(PORT, "0.0.0.0", () => {
  console.log(`ONVIF server listening on :${PORT}`);
});
