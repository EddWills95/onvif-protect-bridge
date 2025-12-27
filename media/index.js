import { getProfiles } from "./getProfiles.js";
import { getSnapshotUri } from "./getSnapshotUri.js";
import { getStreamUri } from "./getStreamUri.js";
import { getVideoSources } from "./getVideoSources.js";

export function handleMediaRequest(xml) {
  console.log("handleMediaRequest called");

  if (xml.includes("GetVideoSources")) {
    return getVideoSources();
  }

  if (xml.includes("GetProfiles")) {
    return getProfiles();
  }

  if (xml.includes("GetStreamUri")) {
    return getStreamUri();
  }

  if (xml.includes("GetSnapshotUri")) {
    return getSnapshotUri();
  }

  throw new Error("Unsupported Media action");
}
