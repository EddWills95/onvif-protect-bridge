const RTSP_URI = "rtsp://rtsp.stream/pattern";

export function getStreamUri() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    <GetStreamUriResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
      <MediaUri>
        <Uri>${RTSP_URI}</Uri>
        <InvalidAfterConnect>false</InvalidAfterConnect>
        <InvalidAfterReboot>false</InvalidAfterReboot>
        <Timeout>PT60S</Timeout>
      </MediaUri>
    </GetStreamUriResponse>
  </s:Body>
</s:Envelope>`;
}
