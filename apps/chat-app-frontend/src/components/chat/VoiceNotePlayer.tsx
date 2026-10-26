import { useEffect, useRef, useState } from "react";
import { Loader2, Pause, Play } from "lucide-react";
import { Button, Slider } from "my-ui";
import { useFileBlob } from "@/lib/useFileBlob";
import type { MessageFile } from "@/features/chat/api/api";
import { cn } from "@/lib/utils";

type VoiceNotePlayerProps = {
  room: string;
  file: MessageFile;
  isOwn?: boolean;
};

const formatAudioTime = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const resolveAudioDuration = (audio: HTMLAudioElement, onResolved: (duration: number) => void) => {
  const apply = () => {
    const value = audio.duration;
    if (Number.isFinite(value) && value > 0) {
      onResolved(value);
      return true;
    }
    return false;
  };

  if (apply()) return;

  const onTimeUpdate = () => {
    if (!apply()) return;
    audio.removeEventListener("timeupdate", onTimeUpdate);
    audio.currentTime = 0;
  };

  audio.addEventListener("timeupdate", onTimeUpdate);
  audio.currentTime = Number.MAX_SAFE_INTEGER;
};

export const VoiceNotePlayer = ({ room, file, isOwn }: VoiceNotePlayerProps) => {
  const { blobUrl, loading, error } = useFileBlob(room, file.id, true);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, [blobUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !blobUrl) return;

    const syncDuration = () => {
      const value = audio.duration;
      if (Number.isFinite(value) && value > 0) setDuration(value);
    };

    const onLoadedMetadata = () => resolveAudioDuration(audio, setDuration);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("durationchange", syncDuration);

    if (audio.readyState >= 1) onLoadedMetadata();

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("durationchange", syncDuration);
    };
  }, [blobUrl]);

  useEffect(() => {
    if (!playing) return;

    let frameId = 0;
    const update = () => {
      const audio = audioRef.current;
      if (audio) setCurrentTime(audio.currentTime);
      frameId = requestAnimationFrame(update);
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, [playing]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !blobUrl) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;

  const handleSeek = (value: number) => {
    const audio = audioRef.current;
    if (!audio || !safeDuration) return;
    audio.currentTime = value;
    setCurrentTime(value);
  };

  const displayTime = playing || currentTime > 0 ? currentTime : safeDuration;

  return (
    <div className="flex min-w-[200px] max-w-[260px] items-center gap-2 py-0.5">
      {blobUrl && (
        <audio
          ref={audioRef}
          src={blobUrl}
          preload="auto"
          onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
          onEnded={() => {
            setPlaying(false);
            setCurrentTime(0);
            if (audioRef.current) audioRef.current.currentTime = 0;
          }}
        />
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => void togglePlay()}
        disabled={loading || error || !blobUrl}
        className={cn(
          "h-9 w-9 shrink-0 rounded-full",
          isOwn ? "bg-primary-foreground/20 hover:bg-primary-foreground/30" : "bg-foreground/10 hover:bg-foreground/15",
          (loading || error) && "opacity-60",
        )}
        aria-label={playing ? "Pause voice note" : "Play voice note"}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : playing ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="ml-0.5 h-4 w-4" />
        )}
      </Button>

      <div className="min-w-0 flex-1">
        <Slider
          value={[Math.min(currentTime, safeDuration || 0)]}
          max={safeDuration || 1}
          step={0.01}
          onValueChange={([value]) => handleSeek(value)}
          disabled={!blobUrl || loading || !safeDuration}
          aria-label="Voice note progress"
        />
        <p
          className={cn(
            "mt-1 text-[10px] tabular-nums",
            isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
          )}
        >
          {formatAudioTime(displayTime)}
          {safeDuration > 0 && (playing || currentTime > 0) && (
            <span className="opacity-70"> / {formatAudioTime(safeDuration)}</span>
          )}
        </p>
      </div>
    </div>
  );
};
