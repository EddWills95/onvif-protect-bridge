export function getProfiles() {
  console.log("getProfiles called");
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    <GetProfilesResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
  <Profiles token="profile_1" fixed="true">
    <Name>MainStream</Name>

    <VideoSourceConfiguration token="vsc1">
      <SourceToken>vs1</SourceToken>
    </VideoSourceConfiguration>

    <VideoEncoderConfiguration token="vec1">
      <Name>H264</Name>
    </VideoEncoderConfiguration>
  </Profiles>
</GetProfilesResponse>
  </s:Body>
</s:Envelope>`;
}
