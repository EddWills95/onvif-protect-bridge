import { envelope } from "../../utils/envelope";
import { Camera } from "../../domain/Camera";

export interface GetProfilesParams {
  camera: Camera;
}

export function getProfiles({ camera }: GetProfilesParams): string {
  return envelope(`
<GetProfilesResponse xmlns="http://www.onvif.org/ver10/media/wsdl">
  <Profiles token=${camera.profileToken}>
    <Name>${camera.name}</Name>

    <VideoSourceConfiguration token="vsc_1">
      <Name>VideoSource</Name>
      <SourceToken>vs_1</SourceToken>
      <Bounds x="0" y="0" width="704" height="576"/>
    </VideoSourceConfiguration>

    <VideoEncoderConfiguration token="vec_1">
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
  </Profiles>
</GetProfilesResponse>`);
}
