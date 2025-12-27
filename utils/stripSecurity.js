export function stripWSSecurity(xml) {
  // Remove any Security header with or without namespace prefixes
  // e.g. <wsse:Security ...>...</wsse:Security> or <Security>...</Security>
  const withoutSecurity = xml.replace(
    /<(?:\w+:)?Security[\s\S]*?<\/(?:\w+:)?Security>/gi,
    ""
  );

  // Also remove any stray UsernameToken blocks (namespaced or not)
  const cleaned = withoutSecurity.replace(
    /<(?:\w+:)?UsernameToken[\s\S]*?<\/(?:\w+:)?UsernameToken>/gi,
    ""
  );

  return cleaned;
}
