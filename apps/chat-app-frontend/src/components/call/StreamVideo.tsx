import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type StreamVideoProps = { stream: MediaStream; className?: string; mirrored?: boolean };

// Video element bound to a stream. Always muted: call audio is played by CallAudioStream.
export const StreamVideo = ({ stream, className, mirrored }: StreamVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.srcObject = stream;
    void el.play().catch(() => {});
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      className={cn("h-full w-full object-cover", mirrored && "-scale-x-100", className)}
    />
  );
};
