export function getScopes(): string {
  return `
    <tds:GetScopesResponse>
      <tds:Scopes>
        <tt:ScopeDef>Fixed</tt:ScopeDef>
        <tt:ScopeItem>onvif://www.onvif.org/type/video_encoder</tt:ScopeItem>
      </tds:Scopes>
      <tds:Scopes>
        <tt:ScopeDef>Fixed</tt:ScopeDef>
        <tt:ScopeItem>onvif://www.onvif.org/Profile/Streaming</tt:ScopeItem>
      </tds:Scopes>
      <tds:Scopes>
        <tt:ScopeDef>Fixed</tt:ScopeDef>
        <tt:ScopeItem>onvif://www.onvif.org/name/RTSP-Bridge</tt:ScopeItem>
      </tds:Scopes>
    </tds:GetScopesResponse>
  `;
}
