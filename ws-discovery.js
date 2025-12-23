// ws-discovery.js
import dgram from "dgram";

const MULTICAST_ADDR = "239.255.255.250";
const PORT = 3702;

// change this to your actual reachable IP
const DEVICE_XADDR = "http://192.168.1.66:8000/onvif/device_service";

const socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

socket.on("listening", () => {
  socket.addMembership(MULTICAST_ADDR);
  console.log("WS-Discovery listening on 239.255.255.250:3702");
});

socket.on("message", (msg, rinfo) => {
  const xml = msg.toString();

  if (!xml.includes("Probe")) return;

  console.log("Probe received from", rinfo, msg.toString());

  // extract wsa:MessageID (works for Protect’s probe)
  const messageIdMatch = xml.match(
    /<wsa:MessageID[^>]*>([^<]+)<\/wsa:MessageID>/
  );

  if (!messageIdMatch) {
    console.warn("Probe without MessageID, ignoring");
    return;
  }

  const relatesTo = messageIdMatch[1];

  const response = `
<?xml version="1.0" encoding="UTF-8"?>
<e:Envelope xmlns:e="http://www.w3.org/2003/05/soap-envelope"
            xmlns:w="http://schemas.xmlsoap.org/ws/2004/08/addressing"
            xmlns:d="http://schemas.xmlsoap.org/ws/2005/04/discovery"
            xmlns:dn="http://www.onvif.org/ver10/network/wsdl">
  <e:Header>
    <w:MessageID>uuid:${crypto.randomUUID()}</w:MessageID>
    <w:RelatesTo>${relatesTo}</w:RelatesTo>
    <w:To>http://schemas.xmlsoap.org/ws/2004/08/addressing/role/anonymous</w:To>
    <w:Action>http://schemas.xmlsoap.org/ws/2005/04/discovery/ProbeMatches</w:Action>
  </e:Header>
  <e:Body>
    <d:ProbeMatches>
      <d:ProbeMatch>
        <w:EndpointReference>
          <w:Address>urn:uuid:${crypto.randomUUID()}</w:Address>
        </w:EndpointReference>
        <d:Types>dn:NetworkVideoTransmitter</d:Types>
        <d:Scopes>onvif://www.onvif.org/Profile/Streaming</d:Scopes>
        <d:XAddrs>${DEVICE_XADDR}</d:XAddrs>
        <d:MetadataVersion>1</d:MetadataVersion>
      </d:ProbeMatch>
    </d:ProbeMatches>
  </e:Body>
</e:Envelope>`.trim();

  socket.send(response, rinfo.port, rinfo.address);
});

const setupWSDiscovery = () => {
  socket.bind(PORT);
};

export { setupWSDiscovery };
