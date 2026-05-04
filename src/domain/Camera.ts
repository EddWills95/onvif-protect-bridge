import crypto from "crypto";

export interface CameraConfig {
  id: string;
  name: string;
  port: number;
  rtspUrl: string;
  ip?: string;
}

export class Camera {
  readonly id: string;
  readonly name: string;
  readonly port: number;
  readonly rtspUrl: string;
  readonly ip: string | undefined;
  readonly deviceUuid: string;

  constructor(config: CameraConfig) {
    this.id = config.id;
    this.name = config.name;
    this.port = config.port;
    this.rtspUrl = config.rtspUrl;
    this.ip = config.ip;
    this.deviceUuid = crypto.randomUUID();

    console.log(`Camera initialized: ${this.name} (${this.ip ?? "shared IP"}:${this.port}, UUID: ${this.deviceUuid})`);
  }

  get profileToken() {
    return `profile_${this.id}`;
  }

  // Returns the MediaMTX restream URL that Protect connects to
  rtspUri(host: string, rtspPort: number) {
    return `rtsp://${host}:${rtspPort}/${this.id}`;
  }
}
