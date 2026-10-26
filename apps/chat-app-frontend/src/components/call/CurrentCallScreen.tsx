import { cn } from "@/lib/utils";
import { CallControls } from "./CallControls";
import { CallScreen } from "./CallScreen";
import { GridTile } from "./GridTile";
import { IncomingActions } from "./IncomingActions";
import { PeerAvatar } from "./PeerAvatar";
import { StreamVideo } from "./StreamVideo";
import type { useCallOverlay } from "./use-call-overlay";

type CurrentCallScreenProps = { call: ReturnType<typeof useCallOverlay> };

// Picks the screen for the current state: incoming 1:1, incoming group, active 1:1 or active group call
export const CurrentCallScreen = ({ call }: CurrentCallScreenProps) => {
  const { dmCall, groupCall, actions, title, status, group, isVideo, connected, localStream, remoteStream } = call;

  const controls = (
    <CallControls
      isVideo={isVideo}
      micMuted={call.micMuted}
      cameraOff={call.cameraOff}
      canSwitchCamera={call.isMobile}
      onToggleMic={() => call.setMicMuted((m) => !m)}
      onToggleCamera={() => call.setCameraOff((c) => !c)}
      onSwitchCamera={() => void (groupCall.inGroupCall ? groupCall.switchCamera() : dmCall.switchCamera())}
      onEnd={actions.endCall}
    />
  );
  const onMinimize = call.isMobile && call.inActiveCall ? () => call.setMinimized(true) : undefined;

  if (call.showDmIncoming && dmCall.incomingCall) {
    return (
      <CallScreen
        title={title}
        status={status}
        footer={
          <IncomingActions
            isVideo={dmCall.incomingCall.callType === "video"}
            acceptLabel="Accept"
            onAccept={actions.acceptIncomingDmCall}
            onDecline={dmCall.rejectCall}
          />
        }
      />
    );
  }

  if (call.showGroupIncoming && groupCall.roomCall) {
    return (
      <CallScreen
        title={title}
        status={status}
        group={group}
        footer={
          <IncomingActions
            isVideo={groupCall.roomCall.callType === "video"}
            acceptLabel="Join"
            onAccept={actions.acceptIncomingGroupCall}
            onDecline={groupCall.dismissIncoming}
          />
        }
      />
    );
  }

  if (dmCall.inCall && dmCall.callPeer) {
    const remoteVideo = isVideo && connected && remoteStream?.getVideoTracks().length ? remoteStream : null;
    return (
      <CallScreen
        title={title}
        status={status}
        onMinimize={onMinimize}
        background={remoteVideo && <StreamVideo stream={remoteVideo} />}
        pip={
          isVideo &&
          localStream &&
          !call.cameraOff && (
            <div className="absolute right-4 top-24 z-20 aspect-3/4 w-28 overflow-hidden rounded-xl shadow-lg ring-1 ring-white/20 sm:w-32">
              <StreamVideo stream={localStream} mirrored />
            </div>
          )
        }
        footer={controls}
      />
    );
  }

  if (!groupCall.inGroupCall) return null;

  const others = groupCall.participants.filter((name) => name !== call.selfUsername);
  return (
    <CallScreen
      title={title}
      status={`${status} · ${groupCall.participants.length} in call`}
      group={group}
      onMinimize={onMinimize}
      footer={controls}
    >
      <div className={cn("grid max-h-full w-full gap-2 overflow-y-auto", others.length > 0 && "grid-cols-2")}>
        {isVideo && localStream && (
          <GridTile label="You">{!call.cameraOff && <StreamVideo stream={localStream} mirrored />}</GridTile>
        )}
        {others.map((name) => {
          const stream = call.remoteParticipants.find((p) => p.username === name)?.stream;
          return (
            <GridTile key={name} label={name}>
              {isVideo && stream?.getVideoTracks().length ? (
                <StreamVideo stream={stream} />
              ) : (
                <PeerAvatar name={name} className="h-20 w-20" fallbackClassName="text-2xl" />
              )}
            </GridTile>
          );
        })}
      </div>
    </CallScreen>
  );
};
