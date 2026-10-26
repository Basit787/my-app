import { useCallback, useRef, useState } from "react";
import { getUserMedia } from "@/lib/media";

// MP4/AAC first: the iOS app cannot play WebM/Opus voice notes
const pickMimeType = () => {
  const types = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus"];
  return types.find((type) => MediaRecorder.isTypeSupported(type)) ?? "";
};

const extensionForMime = (mimeType: string) => {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "m4a";
  return "webm";
};

export const useVoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      cancelAnimationFrame(timerRef.current);
      timerRef.current = null;
    }
  };

  const cleanupStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  };

  const startRecording = useCallback(async () => {
    if (mediaRecorderRef.current) return;

    const mimeType = pickMimeType();
    if (!mimeType) {
      throw new Error("Voice recording is not supported in this browser");
    }

    const stream = await getUserMedia({ audio: true });
    streamRef.current = stream;

    const recorder = new MediaRecorder(stream, { mimeType });
    chunksRef.current = [];

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    recorder.start(200);
    mediaRecorderRef.current = recorder;
    startedAtRef.current = performance.now();
    setDuration(0);
    setIsRecording(true);

    const tick = () => {
      setDuration((performance.now() - startedAtRef.current) / 1000);
      timerRef.current = requestAnimationFrame(tick);
    };
    timerRef.current = requestAnimationFrame(tick);
  }, []);

  const cancelRecording = useCallback(() => {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        cleanupStream();
        mediaRecorderRef.current = null;
        chunksRef.current = [];
      };
      recorder.stop();
    } else {
      cleanupStream();
    }
    clearTimer();
    setIsRecording(false);
    setDuration(0);
  }, []);

  const stopRecording = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        clearTimer();
        setIsRecording(false);
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        cleanupStream();
        mediaRecorderRef.current = null;
        chunksRef.current = [];
        clearTimer();
        setIsRecording(false);
        setDuration(0);

        if (blob.size < 200) {
          resolve(null);
          return;
        }

        const ext = extensionForMime(mimeType);
        resolve(new File([blob], `voice-note-${Date.now()}.${ext}`, { type: mimeType }));
      };

      recorder.stop();
    });
  }, []);

  return {
    isRecording,
    duration,
    startRecording,
    stopRecording,
    cancelRecording,
  };
};
