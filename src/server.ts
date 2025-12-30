import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { getLocalIPv4 } from "./utils/getLocalIPv4";
import { extractSoapAction, hasSecurity } from "./utils/soapParser";
import { WSDiscoveryServer } from "../ws-discovery";
import { Camera } from "./domain/Camera";
import { DeviceController } from "./controllers/DeviceController";
import { MediaController } from "./controllers/MediaController";

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

// Initialize controllers
const deviceController = new DeviceController({ host: HOST, port: PORT });
const mediaController = new MediaController({
  camera,
  host: HOST,
  rtspPort: RTSP_PORT,
});

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
  console.log(hasSecurity(body) ? "AUTH: yes" : "AUTH: no");

  const action = extractSoapAction(body);
  if (!action) {
    return c.text("Invalid SOAP request - no action found", 400);
  }

  const response = deviceController.handle(action, c);
  if (!response) {
    return c.text(`Unsupported Device action: ${action}`, 500);
  }

  return response;
});

// Media Service endpoint
app.post("/onvif/media_service", async (c) => {
  const body = await c.req.text();
  console.log(body);
  console.log(hasSecurity(body) ? "AUTH: yes" : "AUTH: no");

  const action = extractSoapAction(body);
  if (!action) {
    return c.text("Invalid SOAP request - no action found", 400);
  }

  const response = mediaController.handle(action, c);
  if (!response) {
    return c.text(`Unsupported Media action: ${action}`, 500);
  }

  return response;
});

// Initialize and start WS-Discovery
const wsDiscovery = new WSDiscoveryServer(camera, PORT, HOST);
wsDiscovery.start();

serve({
  fetch: app.fetch,
  port: PORT,
  hostname: "0.0.0.0",
});

console.log(`ONVIF server listening on :${PORT}`);
