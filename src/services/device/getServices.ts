import { envelope } from "../../utils/envelope";

export interface GetServicesParams {
  host: string;
  port: number;
  cameraId: string;
}

export function getServices({ host, port, cameraId }: GetServicesParams): string {
  return envelope(`
<GetServicesResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <Service>
    <Namespace>http://www.onvif.org/ver10/media/wsdl</Namespace>
    <XAddr>http://${host}:${port}/onvif/${cameraId}/media_service</XAddr>
    <Version>
      <Major>2</Major>
      <Minor>0</Minor>
    </Version>
    <Capabilities>
      <StreamingCapabilities>
        <RTPMulticast>false</RTPMulticast>
        <RTP_TCP>true</RTP_TCP>
        <RTP_RTSP_TCP>true</RTP_RTSP_TCP>
      </StreamingCapabilities>
    </Capabilities>
  </Service>

  <Service>
    <Namespace>http://www.onvif.org/ver10/media/wsdl</Namespace>
    <XAddr>http://${host}:${port}/onvif/${cameraId}/media_service</XAddr>
    <Version><Major>2</Major><Minor>0</Minor></Version>
  </Service>
</GetServicesResponse>`);
}
