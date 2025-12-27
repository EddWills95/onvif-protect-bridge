import http from "http";
import { handleDeviceRequest } from "./device/index.js";
import { setupWSDiscovery } from "./ws-discovery.js";
import { handleMediaRequest } from "./media/index.js";
import { stripWSSecurity } from "./utils/stripSecurity.js";
import { config } from "dotenv";

// Set up env
config();

const server = http.createServer((req, res) => {
  if (req.method === "GET" && req.url === "/onvif/snapshot.jpg") {
    // 1x1 jpg placeholder (you can swap later)
    const img = Buffer.from(
      "/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxAQEBAQEA8QDw8PEA8PDw8PDw8PDw8PFREWFhURFRUYHSggGBolGxUVITEhJSkrLi4uFx8zODMsNygtLisBCgoKDg0OGxAQGy0lICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAAEAAQMBIgACEQEDEQH/xAAXAAEBAQEAAAAAAAAAAAAAAAABAAID/8QAFxEBAQEBAAAAAAAAAAAAAAAAAQARIf/aAAwDAQACEAMQAAABy2gP/8QAGBAAAgMAAAAAAAAAAAAAAAAAAQIAERP/2gAIAQEAAQUCq2sT/8QAFxEBAQEBAAAAAAAAAAAAAAAAAQARIf/aAAgBAwEBPwGqf//EABYRAQEBAAAAAAAAAAAAAAAAAAARIf/aAAgBAgEBPwGqf//EABoQAAICAwAAAAAAAAAAAAAAAAABESExQWH/2gAIAQEABj8Czq2mJYf/xAAaEAEAAwEBAQAAAAAAAAAAAAABABEhMVFh/9oACAEBAAE/IbVd5FQqV1lX0R8q3sQH/9oADAMBAAIAAwAAABD/AP/EABYRAQEBAAAAAAAAAAAAAAAAAAARIf/aAAgBAwEBPxAqf//EABcRAQEBAQAAAAAAAAAAAAAAAAERACH/2gAIAQIBPxAqf//EABoQAQACAwEAAAAAAAAAAAAAAAEAESExQVH/2gAIAQEAAT8QdQm0Y0m5jQvWcYbqgQyq3rP/2Q==",
      "base64"
    );
    res.writeHead(200, { "Content-Type": "image/jpeg" });
    return res.end(img);
  }

  console.log(req.url);

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
        const cleanedBody = stripWSSecurity(body);
        const responseXml = handleMediaRequest(cleanedBody);
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

  if (req.url === "/onvif/device_service") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      console.log("DEVICE SOAP:\n", body);

      try {
        const cleanedBody = stripWSSecurity(body);
        const responseXml = handleDeviceRequest(cleanedBody);
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
