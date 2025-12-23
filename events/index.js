import { getEventProperties } from "./getEventProperties.js";

export function handleEventsRequest(xml) {
  if (xml.includes("GetEventProperties")) {
    return getEventProperties();
  }

  throw new Error("Unsupported Events action");
}
