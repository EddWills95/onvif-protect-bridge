import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { WSDiscoveryServer } from "../ws-discovery";
import { DeviceController } from "./controllers/DeviceController";
import { MediaController } from "./controllers/MediaController";
import { Config } from "./config/Config";
import { loadCameras } from "./config/CameraLoader";
import { createDeviceRoutes } from "./routes/device.routes";
import { createMediaRoutes } from "./routes/media.routes";

/* ----------------- Config ------------------ */

const config = new Config();
const cameras = loadCameras(config.camerasConfigPath);

/* ---------------- server ---------------- */

const app = new Hono();

// Logging middleware
app.use("*", async (c, next) => {
  console.log("---- ONVIF REQUEST ----");
  console.log(c.req.method, c.req.path);
  await next();
  console.log("-----------------------");
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    cameras: cameras.map((cam) => ({ id: cam.id, name: cam.name })),
    config: {
      onvifPort: config.onvifPort,
      rtspPort: config.rtspStreamPort,
      host: config.hostIp,
    },
  });
});

// Mount per-camera ONVIF routes
cameras.forEach((camera) => {
  const deviceController = new DeviceController({
    host: config.hostIp,
    port: config.onvifPort,
    cameraId: camera.id,
  });
  const mediaController = new MediaController({
    camera,
    host: config.hostIp,
    rtspPort: config.rtspStreamPort,
  });

  app.route(
    `/onvif/${camera.id}/device_service`,
    createDeviceRoutes(deviceController)
  );
  app.route(
    `/onvif/${camera.id}/media_service`,
    createMediaRoutes(mediaController)
  );
});

// GET requests are not supported
app.get("*", (c) => {
  return c.text("GET unsupported by ONVIF implementation", 200);
});

// Initialize and start WS-Discovery
const wsDiscovery = new WSDiscoveryServer(cameras, config.onvifPort, config.hostIp);
wsDiscovery.start();

const server = serve({
  fetch: app.fetch,
  port: config.onvifPort,
  hostname: "0.0.0.0",
});

console.log(`\n✅ ONVIF server listening on :${config.onvifPort}`);
cameras.forEach((cam) =>
  console.log(
    `   ${cam.name}: http://localhost:${config.onvifPort}/onvif/${cam.id}/device_service`
  )
);
console.log(`✅ WS-Discovery running`);
console.log(`\n🔗 Health check: http://localhost:${config.onvifPort}/health\n`);

// Graceful shutdown handlers
const shutdown = () => {
  console.log("\n⚠️  Shutting down gracefully...");

  wsDiscovery.stop();

  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
