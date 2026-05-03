import { envelope } from "../../utils/envelope";
import { Camera } from "../../domain/Camera";

export function getSnapshotUri(
  cameras: Camera[],
  profileToken: string,
  host: string,
  rtspPort: number
): string {
  const camera =
    cameras.find((c) => c.profileToken === profileToken) ?? cameras[0];
  const rtspUri = camera.rtspUri(host, rtspPort);

  return envelope(`
<GetSnapshotUriResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
  <MediaUri>
    <Uri>${rtspUri}</Uri>
  </MediaUri>
</GetSnapshotUriResponse>`);
}
