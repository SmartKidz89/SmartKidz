"use client";

type SoundName = "tap" | "complete" | "streak" | "levelup";

const SOURCES: Record<SoundName, string> = {
  tap: "/sounds/tap.mp3",
  complete: "/sounds/complete.mp3",
  streak: "/sounds/streak.mp3",
  levelup: "/sounds/levelup.mp3",
};

let cache: Partial<Record<SoundName, HTMLAudioElement>> = {};

export function playSound(name: SoundName, volume = 0.35) {
  if (typeof window === "undefined") return;
  try {
    const src = SOURCES[name];
    if (!src) return;
    const a = cache[name] ?? new Audio(src);
    cache[name] = a;
    a.volume = volume;
    a.currentTime = 0;
    void a.play();
  } catch {
    // ignore autoplay / blocked audio
  }
}

export function haptic(kind: "light" | "medium" | "heavy" = "light") {
  if (typeof window === "undefined") return;
  try {
    if (!("vibrate" in navigator)) return;
    const pattern = kind === "light" ? 10 : kind === "medium" ? 20 : 35;
    navigator.vibrate(pattern);
  } catch {}
}


function beep(freq: number, durationMs: number, gain = 0.035) {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    o.type = "sine";
    g.gain.value = gain;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close?.();
    }, durationMs);
  } catch {}
}

export function playUISound(name: SoundName) {
  // Prefer audio files if you add them later; otherwise fall back to pleasant beeps.
  const hasFiles = false;
  if (hasFiles) return playSound(name);
  if (name === "tap") beep(520, 55);
  if (name === "complete") { beep(660, 80); setTimeout(() => beep(880, 90), 90); }
  if (name === "streak") { beep(740, 80); setTimeout(() => beep(990, 110), 90); }
}
