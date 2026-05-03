import crypto from "crypto";

export interface CameraConfig {
  id: string;
  name: string;
  port: number;
  rtspUrl: string;
}

export class Camera {
  readonly id: string;
  readonly name: string;
  readonly port: number;
  readonly rtspUrl: string;
  readonly deviceUuid: string;

  constructor(config: CameraConfig) {
    this.id = config.id;
    this.name = config.name;
    this.port = config.port;
    this.rtspUrl = config.rtspUrl;
    this.deviceUuid = crypto.randomUUID();

    console.log(`Camera initialized: ${this.name} (port ${this.port}, UUID: ${this.deviceUuid})`);
  }

  get profileToken() {
    return `profile_${this.id}`;
  }

  // Returns the MediaMTX restream URL that Protect connects to
  rtspUri(host: string, rtspPort: number) {
    return `rtsp://${host}:${rtspPort}/${this.id}`;
  }
}
