import { getProfiles } from "./getProfiles.js";
import { getStreamUri } from "./getStreamUri.js";
import { getVideoSources } from "./getVideoSources.js";

export function handleMediaRequest(xml) {
  if (xml.includes("GetVideoSources")) {
    return getVideoSources();
  }

  if (xml.includes("GetProfiles")) {
    return getProfiles();
  }

  if (xml.includes("GetStreamUri")) {
    return getStreamUri();
  }

  throw new Error("Unsupported Media action");
}
