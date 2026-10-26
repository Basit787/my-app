import { CallAudioStream } from "./CallAudioStream";
import type { useCallOverlay } from "./use-call-overlay";

type RemoteCallAudioProps = { call: ReturnType<typeof useCallOverlay> };

// Remote audio lives outside the visible UI so minimizing the call or showing video never cuts it off
export const RemoteCallAudio = ({ call }: RemoteCallAudioProps) => (
  <>
    {call.dmCall.inCall && <CallAudioStream stream={call.remoteStream} />}
    {call.groupCall.inGroupCall &&
      call.remoteParticipants.map(({ username, stream }) => <CallAudioStream key={username} stream={stream} />)}
  </>
);
