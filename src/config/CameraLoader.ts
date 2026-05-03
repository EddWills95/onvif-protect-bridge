import { readFileSync } from "fs";
import { parse } from "yaml";
import { Camera } from "../domain/Camera";

interface RawCamera {
  id: string;
  name: string;
  rtsp_url: string;
}

export function loadCameras(configPath: string): Camera[] {
  let content: string;
  try {
    content = readFileSync(configPath, "utf-8");
  } catch {
    throw new Error(
      `Cannot read cameras config at "${configPath}". ` +
        `Copy cameras.yml.template to cameras.yml and configure your cameras.`
    );
  }

  const parsed = parse(content) as { cameras: RawCamera[] };

  if (!Array.isArray(parsed?.cameras) || parsed.cameras.length === 0) {
    throw new Error(`No cameras defined in ${configPath}`);
  }

  return parsed.cameras.map((raw, i) => {
    const label = `cameras[${i}]`;
    if (!raw.id?.trim()) throw new Error(`${label} is missing "id"`);
    if (!raw.name?.trim()) throw new Error(`${label} is missing "name"`);
    if (!raw.rtsp_url?.trim()) throw new Error(`${label} is missing "rtsp_url"`);

    return new Camera({
      id: raw.id,
      name: raw.name,
      rtspUrl: raw.rtsp_url,
    });
  });
}
