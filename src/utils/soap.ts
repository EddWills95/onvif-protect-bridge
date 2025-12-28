import http from "http";

export function soap(res: http.ServerResponse, xml: string): void {
  res.writeHead(200, { "Content-Type": "application/soap+xml" });
  res.end(xml);
}
