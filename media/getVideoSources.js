export function getVideoSources() {
  console.log("getVideoSources called");
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    <GetVideoSourcesResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
  <VideoSources token="vs1">
    <Framerate>25</Framerate>
    <Resolution>
      <Width>704</Width>
      <Height>576</Height>
    </Resolution>
  </VideoSources>
</GetVideoSourcesResponse>
  </s:Body>
</s:Envelope>`;
}
