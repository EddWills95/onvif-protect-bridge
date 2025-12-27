export function getScopes() {
  console.log("getScopes called");
  return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    <GetScopesResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
      <Scopes>
        <Scope>
          <ScopeDef>Fixed</ScopeDef>
          <ScopeItem>onvif://www.onvif.org/type/video_encoder</ScopeItem>
        </Scope>
        <Scope>
          <ScopeDef>Fixed</ScopeDef>
          <ScopeItem>onvif://www.onvif.org/hardware/VirtualCamera</ScopeItem>
        </Scope>
        <Scope>
          <ScopeDef>Fixed</ScopeDef>
          <ScopeItem>onvif://www.onvif.org/name/RTSP Camera</ScopeItem>
        </Scope>
      </Scopes>
    </GetScopesResponse>
  </s:Body>
</s:Envelope>`;
}
