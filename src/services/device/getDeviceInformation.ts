import { envelope } from "../../utils/envelope";

export function getDeviceInformation(): string {
  return envelope(`
<GetDeviceInformationResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <Manufacturer>RTSP Bridge</Manufacturer>
  <Model>Driveway</Model>
  <FirmwareVersion>1.0</FirmwareVersion>
  <SerialNumber>1234</SerialNumber>
  <HardwareId>bridge</HardwareId>
</GetDeviceInformationResponse>`);
}
