import "dotenv/config";
import process from "node:process";
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

  mtx.on("error", (err: NodeJS.ErrnoException) => {
    if (err.code === "ENOENT") {
      console.error("[mediamtx] binary not found — install with: brew install mediamtx");
    } else {
      console.error("[mediamtx] failed to start:", err.message);
    }
  });

  console.log("✅ MediaMTX started");
  return mtx;
}

const mtx = startMediaMTX();

/* ---------------- Per-camera ONVIF servers ---------------- */

const servers = cameras.map((camera) => {
  const app = new Hono();

  app.use("*", async (c, next) => {
    console.log(`[${camera.id}] ${c.req.method} ${c.req.path}`);
    await next();
  });

  app.get("/health", (c) =>
    c.json({
      status: "ok",
      camera: { id: camera.id, name: camera.name },
      config: { onvifPort: camera.port, rtspPort: config.rtspStreamPort, host: config.hostIp },
    })
  );

  const deviceController = new DeviceController({
    host: config.hostIp,
    port: camera.port,
  });

  const mediaController = new MediaController({
    cameras: [camera],
    host: config.hostIp,
    rtspPort: config.rtspStreamPort,
  });

  app.route("/onvif/device_service", createDeviceRoutes(deviceController));
  app.route("/onvif/media_service", createMediaRoutes(mediaController));
  app.get("*", (c) => c.text("GET unsupported by ONVIF implementation", 200));

  const server = serve({ fetch: app.fetch, port: camera.port, hostname: "0.0.0.0" });

  console.log(`✅ [${camera.name}] ONVIF listening on :${camera.port}`);
  console.log(`   http://localhost:${camera.port}/health`);

  return server;
});

/* ---------------- WS-Discovery ---------------- */

const wsDiscovery = new WSDiscoveryServer(cameras, config.hostIp);
wsDiscovery.start();

console.log(`\n✅ WS-Discovery running (${cameras.length} camera(s))\n`);

/* ---------------- Shutdown ---------------- */

const shutdown = () => {
  console.log("\n⚠️  Shutting down gracefully...");
  mtx.kill("SIGTERM");
  wsDiscovery.stop();
  let closed = 0;
  servers.forEach((server) =>
    server.close(() => {
      if (++closed === servers.length) {
        console.log("✅ All servers closed");
        process.exit(0);
      }
    })
  );
  setTimeout(() => {
    console.error("❌ Forced shutdown after timeout");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
