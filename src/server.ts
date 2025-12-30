import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { getLocalIPv4 } from "./utils/getLocalIPv4";
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
const PORT = Number(process.env.ONVIF_PORT) || 8000;
// Port for restreamed RTSP
const RTSP_PORT = Number(process.env.RTSP_STREAM_PORT) || 8554;

// Host IP (to declare in ONVIF responses)
const HOST = process.env.HOST_IP || getLocalIPv4();

/* ---------------- Camera ---------------- */

const camera = new Camera({
  id: cameraId,
  name: cameraName,
  restreamPath: cameraRestreamPath,
});

/* ---------------- server ---------------- */

const app = new Hono();

// Logging middleware
app.use("*", async (c, next) => {
  console.log("---- ONVIF REQUEST ----");
  console.log(c.req.method, c.req.path);
  await next();
  console.log("-----------------------");
});

// GET requests are not supported
app.get("*", (c) => {
  return c.text("GET unsupported by ONVIF implementation", 200);
});

// Device Service endpoint
app.post("/onvif/device_service", async (c) => {
  const body = await c.req.text();
  console.log(body);
  console.log(body.includes("<Security") ? "AUTH: yes" : "AUTH: no");

  if (body.includes("GetSystemDateAndTime")) {
    console.log("Handling: GetSystemDateAndTime");
    return c.body(getSystemDateAndTime(), 200, {
      "Content-Type": "application/soap+xml",
    });
  }

  if (body.includes("GetServices")) {
    console.log("Handling: GetServices");
    return c.body(getServices({ host: HOST, port: PORT }), 200, {
      "Content-Type": "application/soap+xml",
    });
  }

  if (body.includes("GetCapabilities")) {
    console.log("Handling: GetCapabilities");
    return c.body(getCapabilities({ host: HOST, port: PORT }), 200, {
      "Content-Type": "application/soap+xml",
    });
  }

  if (body.includes("GetDeviceInformation")) {
    console.log("Handling: GetDeviceInformation");
    return c.body(getDeviceInformation(), 200, {
      "Content-Type": "application/soap+xml",
    });
  }

  if (body.includes("GetUsers")) {
    console.log("Handling: GetUsers");
    return c.body(getUsers(), 200, {
      "Content-Type": "application/soap+xml",
    });
  }

  if (body.includes("GetScopes")) {
    console.log("Handling: GetScopes");
    return c.body(getScopes(), 200, {
      "Content-Type": "application/soap+xml",
    });
  }

  return c.text("Unsupported ONVIF call", 500);
});

// Media Service endpoint
app.post("/onvif/media_service", async (c) => {
  const body = await c.req.text();
  console.log(body);
  console.log(body.includes("<Security") ? "AUTH: yes" : "AUTH: no");

  if (body.includes("GetProfiles")) {
    console.log("Handling: GetProfiles");
    return c.body(getProfiles({ camera }), 200, {
      "Content-Type": "application/soap+xml",
    });
  }

  if (body.includes("GetVideoSources")) {
    console.log("Handling: GetVideoSources");
    return c.body(getVideoSources(), 200, {
      "Content-Type": "application/soap+xml",
    });
  }

  if (body.includes("GetStreamUri")) {
    console.log("Handling: GetStreamUri");
    return c.body(
      getStreamUri({ camera, host: HOST, rtspPort: RTSP_PORT }),
      200,
      {
        "Content-Type": "application/soap+xml",
      }
    );
  }

  if (body.includes("GetSnapshotUri")) {
    console.log("Handling: GetSnapshotUri");
    return c.body(
      getSnapshotUri({ camera, host: HOST, rtspPort: RTSP_PORT }),
      200,
      {
        "Content-Type": "application/soap+xml",
      }
    );
  }

  return c.text("Unsupported ONVIF call", 500);
});

setupWSDiscovery();

serve({
  fetch: app.fetch,
  port: PORT,
  hostname: "0.0.0.0",
});

console.log(`ONVIF server listening on :${PORT}`);
