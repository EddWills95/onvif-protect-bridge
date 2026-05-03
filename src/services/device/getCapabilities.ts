import { envelope } from "../../utils/envelope";

export interface GetCapabilitiesParams {
  host: string;
  port: number;
  cameraId: string;
}

export function getCapabilities({ host, port, cameraId }: GetCapabilitiesParams): string {
  return envelope(`
<GetCapabilitiesResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <Capabilities>
    <Device>
      <XAddr>http://${host}:${port}/onvif/${cameraId}/device_service</XAddr>
      <UserManagement>true</UserManagement>
      <Security>
        <UsernameToken>true</UsernameToken>
      </Security>
    </Device>
    <Media>
      <XAddr>http://${host}:${port}/onvif/${cameraId}/media_service</XAddr>
    </Media>
  </Capabilities>
</GetCapabilitiesResponse>`);
}
