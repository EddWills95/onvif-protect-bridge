export interface CameraConfig {
  id: string;
  name: string;
  restreamPath: string;
}

export class Camera {
  readonly id: string;
  readonly name: string;
  readonly restreamPath: string;

  constructor(config: CameraConfig) {
    this.id = config.id;
    this.name = config.name;
    this.restreamPath = config.restreamPath;
  }

  get profileToken() {
    return `profile_${this.id}`;
  }

  get onvifName() {
    return this.name;
  }

  rtspUri(host: string, port: number) {
    return `rtsp://${host}:${port}${this.restreamPath}`;
  }
}
