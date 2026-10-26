/**
 * Call tones synthesized with Web Audio (no audio assets to ship).
 *
 * Browsers only let a page make sound after a user gesture, and iOS also pauses ("interrupts") the
 * context when the microphone starts. So one shared context is resumed on every tap/keypress.
 */

let ctx: AudioContext | null = null;

const getContext = () => {
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  // "suspended" before any gesture, "interrupted" on iOS once the mic starts
  if (ctx.state !== "running") void ctx.resume().catch(() => {});
  return ctx;
};

for (const event of ["pointerdown", "keydown", "touchend"]) {
  document.addEventListener(event, getContext, { capture: true, passive: true });
}

const tone = (
  context: AudioContext,
  freq: number,
  start: number,
  duration: number,
  volume: number,
  type: OscillatorType,
) => {
  const gain = context.createGain();
  gain.connect(context.destination);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  const osc = context.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  osc.connect(gain);
  osc.start(start);
  osc.stop(start + duration + 0.02);
};

/** Bright marimba-like phrase, similar in spirit to a mobile messenger ringtone. */
const playRingPhrase = (context: AudioContext) => {
  const t = context.currentTime + 0.02;
  const notes = [659.25, 783.99, 987.77, 783.99, 880, 1046.5]; // E5 G5 B5 G5 A5 C6
  notes.forEach((freq, i) => {
    tone(context, freq, t + i * 0.16, 0.32, 0.22, "sine");
    tone(context, freq * 2, t + i * 0.16, 0.12, 0.05, "triangle"); // mallet "click"
  });
};

/** Classic double-ring ringback heard by the caller while the other side rings. */
const playRingbackBurst = (context: AudioContext) => {
  const t = context.currentTime + 0.02;
  for (const offset of [0, 0.6]) {
    tone(context, 400, t + offset, 0.4, 0.25, "sine");
    tone(context, 450, t + offset, 0.4, 0.25, "sine");
  }
};

const loop = (play: (context: AudioContext) => void, everyMs: number, vibrate?: number[]) => {
  const pattern = "vibrate" in navigator ? vibrate : undefined;
  const run = () => {
    const context = getContext();
    if (context) play(context);
    if (pattern) navigator.vibrate(pattern);
  };
  run();
  const id = window.setInterval(run, everyMs);
  return () => {
    window.clearInterval(id);
    if (pattern) navigator.vibrate(0);
  };
};

/** Incoming call ringtone (plus vibration on phones that support it). Returns a stop function. */
export const startRingtone = () => loop(playRingPhrase, 2200, [400, 200, 400]);

/** Outgoing call ringback tone. Returns a stop function. */
export const startRingback = () => loop(playRingbackBurst, 3000);
