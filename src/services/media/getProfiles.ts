import { envelope } from "../../utils/envelope";
import { Camera } from "../../domain/Camera";

export function getProfiles(cameras: Camera[]): string {
  const profiles = cameras
    .map(
      (camera) => `
  <Profiles token="${camera.profileToken}">
    <Name>${camera.name}</Name>

    <VideoSourceConfiguration token="vsc_${camera.id}">
      <Name>VideoSource</Name>
      <SourceToken>vs_${camera.id}</SourceToken>
      <Bounds x="0" y="0" width="704" height="576"/>
    </VideoSourceConfiguration>

    <VideoEncoderConfiguration token="vec_${camera.id}">
      <Name>H264</Name>
      <Encoding>H264</Encoding>
      <Resolution>
        <Width>704</Width>
        <Height>576</Height>
      </Resolution>
      <RateControl>
        <FrameRateLimit>25</FrameRateLimit>
        <EncodingInterval>1</EncodingInterval>
        <BitrateLimit>2048</BitrateLimit>
      </RateControl>
      <H264>
        <GovLength>50</GovLength>
        <H264Profile>Baseline</H264Profile>
      </H264>
    </VideoEncoderConfiguration>
  </Profiles>`
    )
    .join("\n");

  return envelope(`
<GetProfilesResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
${profiles}
</GetProfilesResponse>`);
}
