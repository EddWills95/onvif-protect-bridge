export function getProfiles() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    <GetProfilesResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
      <Profiles token="profile_1" fixed="true">
        <Name>MainStream</Name>
        <VideoEncoderConfiguration token="video_1">
          <Name>VideoEncoder</Name>
        </VideoEncoderConfiguration>
      </Profiles>
    </GetProfilesResponse>
  </s:Body>
</s:Envelope>`;
}
