export function getDeviceInformation() {
  console.log("getDeviceInformation called");
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    <GetDeviceInformationResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
      <Manufacturer>RTSP2Protect</Manufacturer>
      <Model>VirtualCamera</Model>
      <FirmwareVersion>1.0.0</FirmwareVersion>
      <SerialNumber>rtsp-001</SerialNumber>
      <HardwareId>rtsp-virtual</HardwareId>
    </GetDeviceInformationResponse>
  </s:Body>
</s:Envelope>`;
}
