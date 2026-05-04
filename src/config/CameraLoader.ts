import { Camera } from "../domain/Camera";

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export function loadCameraFromEnv(): Camera {
  return new Camera({
    id: requireEnv("CAMERA_ID"),
    name: requireEnv("CAMERA_NAME"),
    rtspUrl: requireEnv("CAMERA_RTSP_URL"),
    port: parseInt(process.env.CAMERA_PORT ?? "8080"),
  });
}
