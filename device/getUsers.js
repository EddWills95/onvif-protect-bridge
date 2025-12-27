export function getUsers() {
  console.log("getUsers called");
  return `
<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope">
  <s:Body>
    <GetUsersResponse xmlns="http://www.onvif.org/ver10/device/wsdl">
      <Users>
        <User>
          <Username>admin</Username>
          <UserLevel>Administrator</UserLevel>
        </User>
      </Users>
    </GetUsersResponse>
  </s:Body>
</s:Envelope>
    `;
}
