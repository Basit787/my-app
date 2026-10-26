// Adds an incoming track to the remote stream and publishes a fresh copy, so React sees the change
export const attachRemoteTrack = (
  event: RTCTrackEvent,
  remoteStreamRef: { current: MediaStream | null },
  setRemoteStream: (stream: MediaStream | null) => void,
) => {
  let stream = remoteStreamRef.current;
  if (!stream) {
    stream = new MediaStream();
    remoteStreamRef.current = stream;
  }

  const track = event.track;
  if (track && !stream.getTracks().some((t) => t.id === track.id)) {
    stream.addTrack(track);
  }

  setRemoteStream(new MediaStream(stream.getTracks()));
};
