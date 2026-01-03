"use client";

import { useEffect, useMemo, useState } from "react";

export function useTTS() {
  const [voices, setVoices] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    function load() {
      const v = window.speechSynthesis.getVoices();
      if (v && v.length) {
        setVoices(v);
        setReady(true);
      }
    }

    load();
    window.speechSynthesis.onvoiceschanged = load;

    return () => {
      if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  function speak(text, opts = {}) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const u = new SpeechSynthesisUtterance(text);
    if (opts.voiceURI) {
      const v = voices.find(v => v.voiceURI === opts.voiceURI);
      if (v) u.voice = v;
    }
    u.rate = opts.rate ?? 0.95;
    u.pitch = opts.pitch ?? 1.0;
    u.volume = opts.volume ?? 1.0;

    window.speechSynthesis.speak(u);
    return u;
  }

  function cancel() {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
  }

  return { ready, voices, speak, cancel };
}
