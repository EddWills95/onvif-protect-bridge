import { getCapabilities } from "./getCapabilities.js";
import { getDeviceInformation } from "./getDeviceInformation.js";
import { getScopes } from "./getScopes.js";
import { getServices } from "./getServices.js";
import { getSystemDateAndTime } from "./getSystemDateAndTime.js";
import { getUsers } from "./getUsers.js";

export function handleDeviceRequest(xml) {
  console.log("handleDeviceRequest called");

  if (!hasWSSecurity(xml)) {
    res.writeHead(401, {
      "WWW-Authenticate":
        'Digest realm="ONVIF", qop="auth", nonce="dummy", opaque="dummy"',
    });
    return res.end();
  }

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

  if (xml.includes("GetUsers")) {
    return getUsers();
  }

  throw new Error("Unsupported Device action");
}
