import crypto from "crypto";
import dgram from "dgram";
import { Camera } from "./src/domain/Camera";

export class WSDiscoveryServer {
  private socket: dgram.Socket;
  private readonly cameras: Camera[];
  private readonly onvifPort: number;
  private readonly multicastAddr = "239.255.255.250";
  private readonly discoveryPort = 3702;
  private readonly hostIp: string;

  constructor(cameras: Camera[], onvifPort: number, hostIp: string) {
    this.cameras = cameras;
    this.onvifPort = onvifPort;
    this.hostIp = hostIp;
    this.socket = dgram.createSocket({ type: "udp4", reuseAddr: true });

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.socket.on("listening", () => {
      try {
        this.socket.addMembership(this.multicastAddr);
        console.log(
          `WS-Discovery listening on ${this.multicastAddr}:${this.discoveryPort}`
        );
        this.cameras.forEach((cam) =>
          console.log(
            `  ${cam.name}: http://${this.hostIp}:${this.onvifPort}/onvif/${cam.id}/device_service`
          )
        );
      } catch (err) {
        console.error("Failed to setup multicast:", err);
        console.log(
          "WS-Discovery will continue without multicast (manual camera config required)"
        );
      }
    });

    this.socket.on("message", (msg, rinfo) => this.handleProbe(msg, rinfo));

    this.socket.on("error", (err) => {
      console.error("WS-Discovery socket error:", err);
    });
  }

  private handleProbe(msg: Buffer, rinfo: dgram.RemoteInfo): void {
    const xml = msg.toString();

    if (!xml.includes("Probe")) return;

    console.log(`Probe received from ${rinfo.address}`);

    const messageIdMatch = xml.match(
      /<wsa:MessageID[^>]*>([^<]+)<\/wsa:MessageID>/
    );
    if (!messageIdMatch) {
      console.warn("Probe without MessageID, ignoring");
      return;
    }

    const response = this.buildProbeResponse(messageIdMatch[1]);
    this.socket.send(response, rinfo.port, rinfo.address);
  }

  private buildProbeResponse(relatesTo: string): string {
    const probeMatches = this.cameras
      .map(
        (cam) => `
      <d:ProbeMatch>
        <w:EndpointReference>
          <w:Address>urn:uuid:${cam.deviceUuid}</w:Address>
        </w:EndpointReference>
        <d:Types>dn:NetworkVideoTransmitter</d:Types>
        <d:Scopes>onvif://www.onvif.org/name/${cam.name} onvif://www.onvif.org/Profile/Streaming</d:Scopes>
        <d:XAddrs>http://${this.hostIp}:${this.onvifPort}/onvif/${cam.id}/device_service</d:XAddrs>
        <d:MetadataVersion>1</d:MetadataVersion>
      </d:ProbeMatch>`
      )
      .join("\n");

    return `<?xml version="1.0" encoding="UTF-8"?>
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
${probeMatches}
    </d:ProbeMatches>
  </e:Body>
</e:Envelope>`;
  }

  start(): void {
    console.log(
      `Starting WS-Discovery for ${this.cameras.length} camera(s): ${this.cameras.map((c) => c.name).join(", ")}`
    );
    this.socket.bind(this.discoveryPort);
  }

  stop(): void {
    console.log("Stopping WS-Discovery");
    this.socket.close();
  }
}
