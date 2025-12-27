export function getSystemDateAndTime() {
  console.log("getSystemDateAndTime called");
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    <GetSystemDateAndTimeResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
      <SystemDateAndTime>
        <DateTimeType>Manual</DateTimeType>
        <DaylightSavings>false</DaylightSavings>
        <TimeZone><TZ>UTC</TZ></TimeZone>
        <UTCDateTime>
          <Time><Hour>1</Hour><Minute>30</Minute><Second>0</Second></Time>
          <Date><Year>1970</Year><Month>1</Month><Day>1</Day></Date>
        </UTCDateTime>
      </SystemDateAndTime>
    </GetSystemDateAndTimeResponse>
  </s:Body>
</s:Envelope>`;
}
