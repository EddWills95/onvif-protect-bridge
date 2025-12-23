const HOST = "http://192.168.1.66:8000";

export function getServices() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    <GetServicesResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
      <Service>
        <Namespace>http://www.onvif.org/ver10/device/wsdl</Namespace>
        <XAddr>${HOST}/onvif/device_service</XAddr>
        <Version>
          <Major>2</Major>
          <Minor>0</Minor>
        </Version>
      </Service>
      <Service>
        <Namespace>http://www.onvif.org/ver10/media/wsdl</Namespace>
        <XAddr>${HOST}/onvif/media_service</XAddr>
        <Version>
          <Major>2</Major>
          <Minor>0</Minor>
        </Version>
      </Service>
      <Service>
        <Namespace>http://www.onvif.org/ver10/events/wsdl</Namespace>
        <XAddr>${HOST}/onvif/events_service</XAddr>
        <Version>
          <Major>2</Major>
          <Minor>0</Minor>
        </Version>
      </Service>
    </GetServicesResponse>
  </s:Body>
</s:Envelope>`;
}
