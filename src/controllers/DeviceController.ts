import { Context } from "hono";
import { getSystemDateAndTime } from "../services/device/getSystemDateAndTime";
import { getServices } from "../services/device/getServices";
import { getCapabilities } from "../services/device/getCapabilities";
import { getDeviceInformation } from "../services/device/getDeviceInformation";
import { getUsers } from "../services/device/getUsers";
import { getScopes } from "../services/device/getScopes";

type DeviceAction =
  | "GetSystemDateAndTime"
  | "GetServices"
  | "GetCapabilities"
  | "GetDeviceInformation"
  | "GetUsers"
  | "GetScopes";

interface DeviceControllerParams {
  host: string;
  port: number;
}

export class DeviceController {
  constructor(private params: DeviceControllerParams) {}

  handle(action: string, c: Context): Response | null {
    console.log(`Handling: ${action}`);

    switch (action as DeviceAction) {
      case "GetSystemDateAndTime":
        return this.getSystemDateAndTime(c);
      case "GetServices":
        return this.getServices(c);
      case "GetCapabilities":
        return this.getCapabilities(c);
      case "GetDeviceInformation":
        return this.getDeviceInformation(c);
      case "GetUsers":
        return this.getUsers(c);
      case "GetScopes":
        return this.getScopes(c);
      default:
        return null;
    }
  }

  private soapResponse(c: Context, xml: string): Response {
    return c.body(xml, 200, {
      "Content-Type": "application/soap+xml",
    });
  }

  private getSystemDateAndTime(c: Context): Response {
    return this.soapResponse(c, getSystemDateAndTime());
  }

  private getServices(c: Context): Response {
    return this.soapResponse(
      c,
      getServices({ host: this.params.host, port: this.params.port })
    );
  }

  private getCapabilities(c: Context): Response {
    return this.soapResponse(
      c,
      getCapabilities({ host: this.params.host, port: this.params.port })
    );
  }

  private getDeviceInformation(c: Context): Response {
    return this.soapResponse(c, getDeviceInformation());
  }

  private getUsers(c: Context): Response {
    return this.soapResponse(c, getUsers());
  }

  private getScopes(c: Context): Response {
    return this.soapResponse(c, getScopes());
  }
}
