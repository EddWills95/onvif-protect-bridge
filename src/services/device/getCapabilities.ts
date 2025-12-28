import { envelope } from "../../utils/envelope";

export interface GetCapabilitiesParams {
  host: string;
  port: number;
}

export function getCapabilities({ host, port }: GetCapabilitiesParams): string {
  return envelope(`
<GetCapabilitiesResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <Capabilities>
    <Device>
      <XAddr>http://${host}:${port}/onvif/device_service</XAddr>
      <UserManagement>true</UserManagement>
      <Security>
        <UsernameToken>true</UsernameToken>
      </Security>
    </Device>
    <Media>
      <XAddr>http://${host}:${port}/onvif/media_service</XAddr>
    </Media>
  </Capabilities>
</GetCapabilitiesResponse>`);
}
