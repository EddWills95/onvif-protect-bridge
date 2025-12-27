const HOST = "http://192.168.1.66:8000";

export function getCapabilities() {
  console.log("getCapabilities called");
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    <GetCapabilitiesResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
      <Capabilities>
        <Device>
          <XAddr>${HOST}/onvif/device_service</XAddr>
          <UserManagement>true</UserManagement>
          <Security>
            <UsernameToken>true</UsernameToken>
          </Security>
        </Device>
        <Media>
          <XAddr>${HOST}/onvif/media_service</XAddr>
        </Media>
        <Events>
          <XAddr>${HOST}/onvif/events_service</XAddr>
        </Events>
      </Capabilities>
    </GetCapabilitiesResponse>
  </s:Body>
</s:Envelope>`;
}
