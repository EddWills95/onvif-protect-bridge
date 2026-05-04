import "dotenv/config";
import { spawn, type ChildProcess } from "node:child_process";
import { writeFileSync } from "node:fs";
import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { WSDiscoveryServer } from "../ws-discovery";
import { DeviceController } from "./controllers/DeviceController";
import { MediaController } from "./controllers/MediaController";
import { Config } from "./config/Config";
import { loadCameras, loadCameraFromEnv } from "./config/CameraLoader";
import type { Camera } from "./domain/Camera";
import { createDeviceRoutes } from "./routes/device.routes";
import { createMediaRoutes } from "./routes/media.routes";
import { addIpAliases, removeIpAliases } from "./utils/ipAliases";

const config = new Config();
const isDockerMode = !!process.env.CAMERA_ID;
const cameras = isDockerMode ? [loadCameraFromEnv()] : loadCameras(config.camerasConfigPath);

/* ---------------- IP aliases (local mode only) ---------------- */

const aliasedIps = isDockerMode
  ? []
  : cameras.map((c) => c.ip).filter((ip): ip is string => !!ip);
let activeAliases = new Set<string>();
if (aliasedIps.length > 0) {
  console.log(`\nSetting up ${aliasedIps.length} IP alias(es)...`);
  activeAliases = addIpAliases(aliasedIps);
}

/* ---------------- MediaMTX (local mode only) ---------------- */

function writeMediaMTXConfig(cams: Camera[]): void {
  const paths = cams
    .map((c) => `  ${c.id}:\n    source: ${c.rtspUrl}\n    sourceProtocol: tcp`)
    .join("\n");
  writeFileSync("mediamtx.yml", `paths:\n${paths}\n`, "utf-8");
  console.log(`Generated mediamtx.yml with ${cams.length} path(s)`);
}

function startMediaMTX(): ChildProcess {
  writeMediaMTXConfig(cameras);
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
    host: camera.ip ?? config.hostIp,
    port: camera.port,
    cameraId: camera.id,
    cameraName: camera.name,
  });

  const mediaController = new MediaController({
    cameras: [camera],
    host: config.rtspHost,
    rtspPort: config.rtspStreamPort,
  });

  app.route("/onvif/device_service", createDeviceRoutes(deviceController));
  app.route("/onvif/media_service", createMediaRoutes(mediaController));
  app.get("*", (c) => c.text("GET unsupported by ONVIF implementation", 200));

  const bindIp = camera.ip && activeAliases.has(camera.ip) ? camera.ip : "0.0.0.0";
  const server = serve({ fetch: app.fetch, port: camera.port, hostname: bindIp });

  const displayAddr = bindIp !== "0.0.0.0" ? `${bindIp}:${camera.port}` : `:${camera.port}`;
  console.log(`✅ [${camera.name}] ONVIF listening on ${displayAddr}`);
  console.log(`   http://${camera.ip ?? "localhost"}:${camera.port}/health`);

  return server;
});

/* ---------------- WS-Discovery ---------------- */

const wsDiscovery = new WSDiscoveryServer(cameras, config.hostIp);
wsDiscovery.start();

console.log(`\n✅ WS-Discovery running (${cameras.length} camera(s))\n`);

/* ---------------- Shutdown ---------------- */

const shutdown = () => {
  console.log("\n⚠️  Shutting down gracefully...");
  mtx?.kill("SIGTERM");
  wsDiscovery.stop();
  if (aliasedIps.length > 0) removeIpAliases(aliasedIps);
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
