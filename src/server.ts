import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { WSDiscoveryServer } from "../ws-discovery";
import { Camera } from "./domain/Camera";
import { DeviceController } from "./controllers/DeviceController";
import { MediaController } from "./controllers/MediaController";
import { Config } from "./config/Config";
import { createDeviceRoutes } from "./routes/device.routes";
import { createMediaRoutes } from "./routes/media.routes";

/* ----------------- Config ------------------ */

const config = new Config();

/* ---------------- Camera ---------------- */

const camera = new Camera({
  id: config.cameraId,
  name: config.cameraName,
  restreamPath: config.cameraRestreamPath,
});

/* ---------------- server ---------------- */

const app = new Hono();

// Initialize controllers
const deviceController = new DeviceController({
  host: config.hostIp,
  port: config.onvifPort,
});
const mediaController = new MediaController({
  camera,
  host: config.hostIp,
  rtspPort: config.rtspStreamPort,
});

// Logging middleware
app.use("*", async (c, next) => {
  console.log("---- ONVIF REQUEST ----");
  console.log(c.req.method, c.req.path);
  await next();
  console.log("-----------------------");
});

// Health check endpoint for Docker
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    camera: {
      id: camera.id,
      name: camera.name,
    },
    config: {
      onvifPort: config.onvifPort,
      rtspPort: config.rtspStreamPort,
      host: config.hostIp,
    },
  });
});

// Mount ONVIF service routes
app.route("/onvif/device_service", createDeviceRoutes(deviceController));
app.route("/onvif/media_service", createMediaRoutes(mediaController));

// GET requests are not supported
app.get("*", (c) => {
  return c.text("GET unsupported by ONVIF implementation", 200);
});

// Initialize and start WS-Discovery
const wsDiscovery = new WSDiscoveryServer(
  camera,
  config.onvifPort,
  config.hostIp
);
wsDiscovery.start();

const server = serve({
  fetch: app.fetch,
  port: config.onvifPort,
  hostname: "0.0.0.0",
});

console.log(`\n✅ ONVIF server listening on :${config.onvifPort}`);
console.log(`✅ WS-Discovery running`);
console.log(`\n🔗 Health check: http://localhost:${config.onvifPort}/health\n`);

// Graceful shutdown handlers
const shutdown = () => {
  console.log("\n⚠️  Shutting down gracefully...");

  // Close WS-Discovery
  wsDiscovery.stop();

  // Close HTTP server
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
