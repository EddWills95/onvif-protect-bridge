import { getLocalIPv4 } from "../utils/getLocalIPv4";

export interface ConfigParams {
  camerasConfigPath: string;
  onvifPort: number;
  rtspStreamPort: number;
  hostIp: string;
}

export class Config {
  public readonly camerasConfigPath: string;
  public readonly onvifPort: number;
  public readonly rtspStreamPort: number;
  public readonly hostIp: string;

  constructor(params?: Partial<ConfigParams>) {
    this.camerasConfigPath =
      params?.camerasConfigPath ??
      process.env.CAMERAS_CONFIG ??
      "./cameras.yml";
    this.onvifPort = params?.onvifPort ?? this.parsePort("ONVIF_PORT", 8000);
    this.rtspStreamPort =
      params?.rtspStreamPort ?? this.parsePort("RTSP_STREAM_PORT", 8554);
    this.hostIp = params?.hostIp ?? process.env.HOST_IP ?? getLocalIPv4();

    this.validate();
    this.logConfig();
  }

  private parsePort(envVar: string, defaultPort: number): number {
    const value = process.env[envVar];
    if (!value) return defaultPort;

    const port = Number(value);
    if (isNaN(port)) {
      throw new Error(
        `Invalid ${envVar}: "${value}" is not a valid port number`
      );
    }
    return port;
  }

  private validate(): void {
    const errors: string[] = [];

    if (this.onvifPort < 1 || this.onvifPort > 65535) {
      errors.push(`ONVIF_PORT must be between 1-65535 (got ${this.onvifPort})`);
    }

    if (this.rtspStreamPort < 1 || this.rtspStreamPort > 65535) {
      errors.push(
        `RTSP_STREAM_PORT must be between 1-65535 (got ${this.rtspStreamPort})`
      );
    }

    if (!this.hostIp || this.hostIp.trim() === "") {
      errors.push("HOST_IP cannot be empty or undetectable");
    }

    if (errors.length > 0) {
      throw new Error(
        `Configuration validation failed:\n${errors
          .map((e) => `  - ${e}`)
          .join("\n")}`
      );
    }
  }

  private logConfig(): void {
    console.log("=".repeat(50));
    console.log("📹 RTSP-2-Protect ONVIF Bridge Configuration");
    console.log("=".repeat(50));
    console.log(`Cameras config:     ${this.camerasConfigPath}`);
    console.log(`ONVIF Port:         ${this.onvifPort}`);
    console.log(`RTSP Stream Port:   ${this.rtspStreamPort}`);
    console.log(`Host IP:            ${this.hostIp}`);
    console.log("=".repeat(50));
  }

  public getOnvifUrl(): string {
    return `http://${this.hostIp}:${this.onvifPort}`;
  }
}
