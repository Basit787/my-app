import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Volume2 } from "lucide-react";

type CallAudioStreamProps = {
  stream: MediaStream | null;
};

/**
 * Plays a remote participant's audio. Video tiles are always muted, so this is the single place
 * call audio comes from; it stays mounted while the call window is minimized or showing video.
 */
export const CallAudioStream = ({ stream }: CallAudioStreamProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [blocked, setBlocked] = useState(false);

  const play = useCallback(() => {
    audioRef.current
      ?.play()
      .then(() => setBlocked(false))
      // Autoplay policy: some mobile browsers need a tap before audio can start
      .catch((error: unknown) => setBlocked(error instanceof DOMException && error.name === "NotAllowedError"));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.srcObject = stream;
    if (!stream) return;

    play();
    const tracks = stream.getAudioTracks();
    tracks.forEach((track) => track.addEventListener("unmute", play));

    return () => {
      tracks.forEach((track) => track.removeEventListener("unmute", play));
      audio.srcObject = null;
    };
  }, [play, stream]);

  return (
    <>
      <audio ref={audioRef} autoPlay playsInline className="sr-only" aria-hidden />
      {blocked &&
        createPortal(
          <button
            type="button"
            onClick={play}
            className="fixed left-1/2 top-4 z-300 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#25d366] px-4 py-2 text-sm font-medium text-black shadow-lg"
          >
            <Volume2 className="h-4 w-4" />
            Tap to turn on call audio
          </button>,
          document.body,
        )}
    </>
  );
};
