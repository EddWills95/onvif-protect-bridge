import { envelope } from "../../utils/envelope";
import { Camera } from "../../domain/Camera";

export interface GetStreamUriParams {
  camera: Camera;
  host: string;
  rtspPort: number;
}

export function getStreamUri({
  camera,
  host,
  rtspPort,
}: GetStreamUriParams): string {
  const rtspUri = camera.rtspUri(host, rtspPort);

  return envelope(`
<GetStreamUriResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
  <MediaUri>
    <Uri>${rtspUri}</Uri>
    <InvalidAfterConnect>false</InvalidAfterConnect>
    <InvalidAfterReboot>false</InvalidAfterReboot>
    <Timeout>PT60S</Timeout>
  </MediaUri>
</GetStreamUriResponse>`);
}
