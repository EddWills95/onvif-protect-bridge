export function getVideoSources() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    <GetVideoSourcesResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
      <VideoSources token="video_source_1">
        <Framerate>25</Framerate>
        <Resolution>
          <Width>1920</Width>
          <Height>1080</Height>
        </Resolution>
      </VideoSources>
    </GetVideoSourcesResponse>
  </s:Body>
</s:Envelope>`;
}
