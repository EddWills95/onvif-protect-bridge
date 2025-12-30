import { Hono } from "hono";
import { DeviceController } from "../controllers/DeviceController";
import { extractSoapAction, hasSecurity } from "../utils/soapParser";

export function createDeviceRoutes(controller: DeviceController): Hono {
  const router = new Hono();

  router.post("/", async (c) => {
    const body = await c.req.text();
    console.log(body);
    console.log(hasSecurity(body) ? "AUTH: yes" : "AUTH: no");

    const action = extractSoapAction(body);
    if (!action) {
      return c.text("Invalid SOAP request - no action found", 400);
    }

    const response = controller.handle(action, c);
    if (!response) {
      return c.text(`Unsupported Device action: ${action}`, 500);
    }

    return response;
  });

  return router;
}
