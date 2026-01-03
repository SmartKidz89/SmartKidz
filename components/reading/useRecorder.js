"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export function useRecorder() {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [durationMs, setDurationMs] = useState(0);

  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const startRef = useRef(0);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia);
  }, []);

  const stop = useCallback(async () => {
    if (!mediaRef.current) return;
    try {
      mediaRef.current.stop();
    } catch (_) {}
  }, []);

  const start = useCallback(async () => {
    if (!supported) return;
    // Reset previous
    if (audioURL) URL.revokeObjectURL(audioURL);
    setAudioURL(null);
    setDurationMs(0);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream);
    mediaRef.current = rec;
    chunksRef.current = [];
    startRef.current = Date.now();

    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
    };

    rec.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioURL(url);
      setDurationMs(Date.now() - startRef.current);
      setRecording(false);

      // stop tracks
      stream.getTracks().forEach(t => t.stop());
    };

    setRecording(true);
    rec.start();
  }, [supported, audioURL]);

  return { supported, recording, audioURL, durationMs, start, stop };
}
