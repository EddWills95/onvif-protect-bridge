import http from "http";
import { getLocalIPv4 } from "./utils/getLocalIPv4";
import { soap } from "./utils/soap";
import { setupWSDiscovery } from "../ws-discovery";
import { Camera } from "./domain/Camera";

// Device services
import { getSystemDateAndTime } from "./services/device/getSystemDateAndTime";
import { getServices } from "./services/device/getServices";
import { getCapabilities } from "./services/device/getCapabilities";
import { getDeviceInformation } from "./services/device/getDeviceInformation";
import { getUsers } from "./services/device/getUsers";
import { getScopes } from "./services/device/getScopes";

// Media services
import { getProfiles } from "./services/media/getProfiles";
import { getVideoSources } from "./services/media/getVideoSources";
import { getStreamUri } from "./services/media/getStreamUri";
import { getSnapshotUri } from "./services/media/getSnapshotUri";

/* ----------------- Env ------------------ */

const cameraId = process.env.CAMERA_ID || "cam1";
const cameraName = process.env.CAMERA_NAME || "Camera 1";
const cameraRestreamPath = process.env.CAMERA_RESTREAM_PATH || "/cam1";

// Port listening for ONVIP requests
const PORT = process.env.ONVIF_PORT || 8000;
// Port for restreamed RTSP
const RTSP_PORT = process.env.RTSP_STREAM_PORT || 8554;

// Host IP (to declare in ONVIF responses)
const HOST = process.env.HOST_IP || getLocalIPv4();

/* ---------------- Camera ---------------- */

const camera = new Camera({
  id: cameraId,
  name: cameraName,
  restreamPath: cameraRestreamPath,
});

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

    // Ignore GET probes
    if (req.method !== "POST") {
      res.writeHead(200);
      return res.end("GET unsupported by ONVIF implementation");
    }

    /* ---- Device ---- */
    if (req.url === "/onvif/device_service") {
      if (body.includes("GetSystemDateAndTime")) {
        console.log("Handling: GetSystemDateAndTime");
        return soap(res, getSystemDateAndTime());
      }
      if (body.includes("GetServices")) {
        console.log("Handling: GetServices");
        return soap(res, getServices({ host: HOST, port: PORT }));
      }
      if (body.includes("GetCapabilities")) {
        console.log("Handling: GetCapabilities");
        return soap(res, getCapabilities({ host: HOST, port: PORT }));
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
        return soap(res, getProfiles({ camera }));
      }
      if (body.includes("GetVideoSources")) {
        console.log("Handling: GetVideoSources");
        return soap(res, getVideoSources());
      }
      if (body.includes("GetStreamUri")) {
        console.log("Handling: GetStreamUri");
        return soap(
          res,
          getStreamUri({ camera, host: HOST, rtspPort: RTSP_PORT })
        );
      }
      if (body.includes("GetSnapshotUri")) {
        console.log("Handling: GetSnapshotUri");
        return soap(
          res,
          getSnapshotUri({ camera, host: HOST, rtspPort: RTSP_PORT })
        );
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
