import { envelope } from "../../utils/envelope";

export function getVideoSources(): string {
  return envelope(`
<GetVideoSourcesResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
  <VideoSources token="vs_1"/>
</GetVideoSourcesResponse>`);
}
