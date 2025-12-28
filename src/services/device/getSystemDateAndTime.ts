import { envelope } from "../../utils/envelope";

export function getSystemDateAndTime(): string {
  const now = new Date();

  return envelope(`
<GetSystemDateAndTimeResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
  <SystemDateAndTime>
    <UTCDateTime>
      <Time><Hour>${now.getUTCHours()}</Hour><Minute>${now.getUTCMinutes()}</Minute><Second>${now.getUTCSeconds()}</Second></Time>
      <Date><Year>${now.getUTCFullYear()}</Year><Month>${
    now.getUTCMonth() + 1
  }</Month><Day>${now.getUTCDate()}</Day></Date>
    </UTCDateTime>
  </SystemDateAndTime>
</GetSystemDateAndTimeResponse>`);
}
