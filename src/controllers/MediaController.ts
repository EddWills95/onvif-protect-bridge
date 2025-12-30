import { Context } from "hono";
import { Camera } from "../domain/Camera";
import { getProfiles } from "../services/media/getProfiles";
import { getVideoSources } from "../services/media/getVideoSources";
import { getStreamUri } from "../services/media/getStreamUri";
import { getSnapshotUri } from "../services/media/getSnapshotUri";

type MediaAction =
  | "GetProfiles"
  | "GetVideoSources"
  | "GetStreamUri"
  | "GetSnapshotUri";

interface MediaControllerParams {
  camera: Camera;
  host: string;
  rtspPort: number;
}

export class MediaController {
  constructor(private params: MediaControllerParams) {}

  handle(action: string, c: Context): Response | null {
    console.log(`Handling: ${action}`);

    switch (action as MediaAction) {
      case "GetProfiles":
        return this.getProfiles(c);
      case "GetVideoSources":
        return this.getVideoSources(c);
      case "GetStreamUri":
        return this.getStreamUri(c);
      case "GetSnapshotUri":
        return this.getSnapshotUri(c);
      default:
        return null;
    }
  }

  private soapResponse(c: Context, xml: string): Response {
    return c.body(xml, 200, {
      "Content-Type": "application/soap+xml",
    });
  }

  private getProfiles(c: Context): Response {
    return this.soapResponse(c, getProfiles({ camera: this.params.camera }));
  }

  private getVideoSources(c: Context): Response {
    return this.soapResponse(c, getVideoSources());
  }

  private getStreamUri(c: Context): Response {
    return this.soapResponse(
      c,
      getStreamUri({
        camera: this.params.camera,
        host: this.params.host,
        rtspPort: this.params.rtspPort,
      })
    );
  }

  private getSnapshotUri(c: Context): Response {
    return this.soapResponse(
      c,
      getSnapshotUri({
        camera: this.params.camera,
        host: this.params.host,
        rtspPort: this.params.rtspPort,
      })
    );
  }
}
