import crypto from "crypto";

export interface CameraConfig {
  id: string;
  name: string;
  rtspUrl: string;
}

export class Camera {
  readonly id: string;
  readonly name: string;
  readonly rtspUrl: string;
  readonly deviceUuid: string;

  constructor(config: CameraConfig) {
    this.id = config.id;
    this.name = config.name;
    this.rtspUrl = config.rtspUrl;
    this.deviceUuid = crypto.randomUUID();

    console.log(`Camera initialized: ${this.name} (UUID: ${this.deviceUuid})`);
  }

  get profileToken() {
    return `profile_${this.id}`;
  }

  get onvifName() {
    return this.name;
  }

  // Returns the MediaMTX restream URL that Protect connects to
  rtspUri(host: string, port: number) {
    return `rtsp://${host}:${port}/${this.id}`;
  }
}
