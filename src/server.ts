import "dotenv/config";
import { spawn, type ChildProcess } from "node:child_process";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { WSDiscoveryServer } from "../ws-discovery";
import { DeviceController } from "./controllers/DeviceController";
import { MediaController } from "./controllers/MediaController";
import { Config } from "./config/Config";
import { loadCameras } from "./config/CameraLoader";
import { createDeviceRoutes } from "./routes/device.routes";
import { createMediaRoutes } from "./routes/media.routes";

const config = new Config();
const cameras = loadCameras(config.camerasConfigPath);

/* ---------------- MediaMTX ---------------- */

function startMediaMTX(): ChildProcess {
  const mtx = spawn("mediamtx", ["mediamtx.yml"], { cwd: process.cwd() });

  mtx.stdout.on("data", (d) => process.stdout.write(`[mediamtx] ${d}`));
  mtx.stderr.on("data", (d) => process.stderr.write(`[mediamtx] ${d}`));

  mtx.on("exit", (code, signal) => {
    if (signal !== "SIGTERM" && signal !== "SIGKILL") {
      console.error(`[mediamtx] exited unexpectedly (code=${code})`);
    }
  });

  mtx.on("error", (err) => {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      console.error("[mediamtx] binary not found — install with: brew install mediamtx");
    } else {
      console.error("[mediamtx] failed to start:", err.message);
    }
  });

  console.log("✅ MediaMTX started");
  return mtx;
}

const mtx = startMediaMTX();

/* ---------------- ONVIF server ---------------- */

const app = new Hono();

app.use("*", async (c, next) => {
  console.log("---- ONVIF REQUEST ----");
  console.log(c.req.method, c.req.path);
  await next();
  console.log("-----------------------");
});

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

const deviceController = new DeviceController({
  host: config.hostIp,
  port: config.onvifPort,
});

const mediaController = new MediaController({
  cameras,
  host: config.hostIp,
  rtspPort: config.rtspStreamPort,
});

app.route("/onvif/device_service", createDeviceRoutes(deviceController));
app.route("/onvif/media_service", createMediaRoutes(mediaController));

app.get("*", (c) => c.text("GET unsupported by ONVIF implementation", 200));

const wsDiscovery = new WSDiscoveryServer(cameras, config.onvifPort, config.hostIp);
wsDiscovery.start();

const server = serve({
  fetch: app.fetch,
  port: config.onvifPort,
  hostname: "0.0.0.0",
});

console.log(`✅ ONVIF server listening on :${config.onvifPort}`);
console.log(`   Cameras: ${cameras.map((c) => c.name).join(", ")}`);
console.log(`✅ WS-Discovery running`);
console.log(`\n🔗 Health: http://localhost:${config.onvifPort}/health\n`);

const shutdown = () => {
  console.log("\n⚠️  Shutting down gracefully...");
  mtx.kill("SIGTERM");
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
