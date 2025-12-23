import http from "http";
import { handleDeviceRequest } from "./device/index.js";
import { setupWSDiscovery } from "./ws-discovery.js";
import { handleMediaRequest } from "./media/index.js";

const server = http.createServer((req, res) => {
  if (req.method !== "POST") {
    res.writeHead(404);
    return res.end();
  }

  if (req.url === "/onvif/events_service") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      console.log("EVENTS SOAP:\n", body);

      try {
        const responseXml = handleEventsRequest(body);
        res.writeHead(200, { "Content-Type": "application/soap+xml" });
        res.end(responseXml);
      } catch (err) {
        console.error(err.message);
        res.writeHead(500);
        res.end();
      }
    });
    return;
  }

  if (req.url === "/onvif/media_service") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      console.log("MEDIA SOAP:\n", body);

      try {
        const responseXml = handleMediaRequest(body);
        res.writeHead(200, { "Content-Type": "application/soap+xml" });
        res.end(responseXml);
      } catch (err) {
        console.error(err.message);
        res.writeHead(500);
        res.end();
      }
    });
    return;
  }

  if (req.url !== "/onvif/device_service") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      console.log("DEVICE SOAP:\n", body);

      try {
        const responseXml = handleDeviceRequest(body);
        res.writeHead(200, { "Content-Type": "application/soap+xml" });
        res.end(responseXml);
      } catch (err) {
        console.error(err.message);
        res.writeHead(500);
        res.end();
      }
    });
  }

  return;
});

server.listen(8000, () => {
  console.log("ONVIF server listening on :8000");
});

setupWSDiscovery();
