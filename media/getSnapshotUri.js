// media/getSnapshotUri.js

const SNAPSHOT_URI = "http://192.168.1.66:8000/onvif/snapshot.jpg";

export function getSnapshotUri() {
  console.log("getSnapshotUri called");
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    <GetSnapshotUriResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
      <MediaUri>
        <Uri>${SNAPSHOT_URI}</Uri>
        <InvalidAfterConnect>false</InvalidAfterConnect>
        <InvalidAfterReboot>false</InvalidAfterReboot>
        <Timeout>PT60S</Timeout>
      </MediaUri>
    </GetSnapshotUriResponse>
  </s:Body>
</s:Envelope>`;
}
