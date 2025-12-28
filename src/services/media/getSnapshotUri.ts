import { envelope } from "../../utils/envelope";
import { Camera } from "../../domain/Camera";

export interface GetSnapshotUriParams {
  camera: Camera;
  host: string;
  rtspPort: number;
}

export function getSnapshotUri({
  camera,
  host,
  rtspPort,
}: GetSnapshotUriParams): string {
  const rtspUri = camera.rtspUri(host, rtspPort);

  return envelope(`
<GetSnapshotUriResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
  <MediaUri>
    <Uri>${rtspUri}</Uri>
  </MediaUri>
</GetSnapshotUriResponse>`);
}
