import http from "http";

const HOST = "192.168.1.66";
const PORT = 8000;
const RTSP_URI = "rtsp://192.168.1.66:8554/cam7";

/* ---------------- helpers ---------------- */

function hasWSSecurity(xml) {
  return xml.includes("<Security");
}

function soap(res, xml) {
  res.writeHead(200, { "Content-Type": "application/soap+xml" });
  res.end(xml);
}

function challenge(res) {
  res.writeHead(401, {
    "WWW-Authenticate":
      'Digest realm="ONVIF", qop="auth", nonce="dummy", opaque="dummy"',
  });
  res.end();
}

function envelope(body) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    ${body}
  </s:Body>
</s:Envelope>`;
}

/* ---------------- device responses ---------------- */

function getSystemDateAndTime() {
  return envelope(`
<GetSystemDateAndTimeResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <SystemDateAndTime>
    <UTCDateTime>
      <Time><Hour>12</Hour><Minute>0</Minute><Second>0</Second></Time>
      <Date><Year>2024</Year><Month>1</Month><Day>1</Day></Date>
    </UTCDateTime>
  </SystemDateAndTime>
</GetSystemDateAndTimeResponse>`);
}

function getServices() {
  return envelope(`
<GetServicesResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <Service>
    <Namespace>http://www.onvif.org/ver10/media/wsdl</Namespace>
    <XAddr>http://${HOST}:${PORT}/onvif/media_service</XAddr>
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
    <XAddr>http://${HOST}:${PORT}/onvif/media_service</XAddr>
    <Version><Major>2</Major><Minor>0</Minor></Version>
  </Service>
</GetServicesResponse>`);
}

function getCapabilities() {
  return envelope(`
<GetCapabilitiesResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <Capabilities>
    <Device>
      <XAddr>http://${HOST}:${PORT}/onvif/device_service</XAddr>
      <UserManagement>true</UserManagement>
      <Security>
        <UsernameToken>true</UsernameToken>
      </Security>
    </Device>
    <Media>
      <XAddr>http://${HOST}:${PORT}/onvif/media_service</XAddr>
    </Media>
  </Capabilities>
</GetCapabilitiesResponse>`);
}

function getDeviceInformation() {
  return envelope(`
<GetDeviceInformationResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <Manufacturer>Generic</Manufacturer>
  <Model>RTSP Bridge</Model>
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

/* ---------------- media responses ---------------- */

function getProfiles() {
  return envelope(`
<GetProfilesResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
  <Profiles token="profile_1">
    <Name>MainStream</Name>

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

    // Auth challenge (allow unauthenticated time check)
    if (!hasWSSecurity(body) && !body.includes("GetSystemDateAndTime")) {
      return challenge(res);
    }

    /* ---- Device ---- */
    if (req.url === "/onvif/device_service") {
      if (body.includes("GetSystemDateAndTime"))
        return soap(res, getSystemDateAndTime());
      if (body.includes("GetServices")) return soap(res, getServices());
      if (body.includes("GetCapabilities")) return soap(res, getCapabilities());
      if (body.includes("GetDeviceInformation"))
        return soap(res, getDeviceInformation());
      if (body.includes("GetUsers")) return soap(res, getUsers());
    }

    /* ---- Media ---- */
    if (req.url === "/onvif/media_service") {
      if (body.includes("GetProfiles")) return soap(res, getProfiles());
      if (body.includes("GetVideoSources")) return soap(res, getVideoSources());
      if (body.includes("GetStreamUri")) return soap(res, getStreamUri());
      if (body.includes("GetSnapshotUri")) return soap(res, getSnapshotUri());
    }

    res.writeHead(500);
    res.end("Unsupported ONVIF call");
  });
});

server.listen(PORT, () => {
  console.log(`ONVIF server listening on :${PORT}`);
});
