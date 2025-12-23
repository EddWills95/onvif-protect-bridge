import { getCapabilities } from "./getCapabilities.js";
import { getDeviceInformation } from "./getDeviceInformation.js";
import { getScopes } from "./getScopes.js";
import { getServices } from "./getServices.js";
import { getSystemDateAndTime } from "./getSystemDateAndTime.js";

export function handleDeviceRequest(xml) {
  if (xml.includes("GetSystemDateAndTime")) {
    return getSystemDateAndTime();
  }

  if (xml.includes("GetDeviceInformation")) {
    return getDeviceInformation();
  }

  if (xml.includes("GetCapabilities")) {
    return getCapabilities();
  }

  if (xml.includes("GetScopes")) {
    return getScopes();
  }

  if (xml.includes("GetServices")) {
    return getServices();
  }

  throw new Error("Unsupported Device action");
}
