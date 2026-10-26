import { toastError } from "@/lib/toast";

const friendlyMediaError = (error: unknown): Error => {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") return new Error("Camera/microphone permission was denied");
    if (error.name === "NotFoundError") return new Error("No camera or microphone found");
    if (error.name === "NotReadableError") return new Error("Camera or microphone is already in use by another app");
  }
  return error instanceof Error ? error : new Error("Could not access camera or microphone");
};

/** Swap the camera track on every peer connection; returns a new stream so React re-renders previews. */
const switchCameraFacing = async (stream: MediaStream, pcs: Iterable<RTCPeerConnection>): Promise<MediaStream> => {
  const current = stream.getVideoTracks()[0];
  if (!current) return stream;
  const facingMode = current.getSettings().facingMode === "environment" ? "user" : "environment";

  // Many phones can't open two cameras at once, so release the current one first
  current.stop();
  const next = (await getUserMedia({ video: { facingMode } })).getVideoTracks()[0];
  next.enabled = current.enabled;
  for (const pc of pcs) {
    await pc
      .getSenders()
      .find((sender) => sender.track?.kind === "video" || sender.track === current)
      ?.replaceTrack(next);
  }
  return new MediaStream([...stream.getAudioTracks(), next]);
};

/** Flip a call's outgoing camera between front and back, updating the call hook's stream ref and state. */
export const switchCamera = async (
  streamRef: { current: MediaStream | null },
  setStream: (stream: MediaStream) => void,
  pcs: Iterable<RTCPeerConnection>,
) => {
  if (!streamRef.current) return;
  try {
    streamRef.current = await switchCameraFacing(streamRef.current, pcs);
    setStream(streamRef.current);
  } catch (error) {
    toastError(error, "Could not switch camera");
  }
};

/** `navigator.mediaDevices.getUserMedia` with readable errors, including the non-HTTPS case where it doesn't exist. */
export const getUserMedia = async (constraints: MediaStreamConstraints): Promise<MediaStream> => {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error(
      window.isSecureContext
        ? "This browser does not support camera or microphone access"
        : "Calls and voice notes need HTTPS — open this app with https://",
    );
  }
  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (error) {
    throw friendlyMediaError(error);
  }
};
