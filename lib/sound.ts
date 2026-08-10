let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(freq: number, startOffset: number, duration: number, type: OscillatorType, gain: number) {
  const audio = getCtx();
  if (!audio) return;

  const osc = audio.createOscillator();
  const gainNode = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gainNode);
  gainNode.connect(audio.destination);

  const t0 = audio.currentTime + startOffset;
  gainNode.gain.setValueAtTime(gain, t0);
  gainNode.gain.exponentialRampToValueAtTime(0.001, t0 + duration);
  osc.start(t0);
  osc.stop(t0 + duration);
}

export function playCorrect() {
  try {
    tone(523.25, 0, 0.12, "sine", 0.2);
    tone(783.99, 0.1, 0.18, "sine", 0.2);
  } catch {
    // audio unsupported/blocked — fail silently
  }
}

export function playWrong() {
  try {
    tone(196, 0, 0.28, "sawtooth", 0.12);
  } catch {
    // audio unsupported/blocked — fail silently
  }
}

export function playComplete() {
  try {
    tone(523.25, 0, 0.12, "sine", 0.18);
    tone(659.25, 0.1, 0.12, "sine", 0.18);
    tone(783.99, 0.2, 0.28, "sine", 0.2);
  } catch {
    // audio unsupported/blocked — fail silently
  }
}

export function playFail() {
  try {
    tone(311.13, 0, 0.18, "triangle", 0.15);
    tone(233.08, 0.16, 0.35, "triangle", 0.15);
  } catch {
    // audio unsupported/blocked — fail silently
  }
}
