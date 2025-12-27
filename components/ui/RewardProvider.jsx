"use client";

import { playUISound, haptic } from "@/components/ui/sound";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import RewardToaster from "./RewardToaster";

let _confetti;
async function confettiBurst(){
  try{
    if(!_confetti){
      const mod = await import("canvas-confetti");
      _confetti = mod.default || mod;
    }
    _confetti({
      particleCount: 120,
      spread: 72,
      startVelocity: 42,
      scalar: 1,
      origin: { y: 0.6 }
    });
    window.setTimeout(() => _confetti({ particleCount: 80, spread: 88, startVelocity: 36, origin: { y: 0.6 } }), 140);
  }catch(e){
    // no-op
  }
}


const RewardContext = createContext(null);

export function RewardProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((toast) => {
    const id = toast?.id || `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const t = { id, duration: 3500, tone: "success", ...toast };
    setToasts((prev) => [...prev, t]);
    if (t.tone === "levelup" || t.type === "levelup") {
      confettiBurst();
      playUISound("levelup");
      haptic("success");
    }
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, t.duration);
  }, []);

  const api = useMemo(() => ({ push }), [push]);

  return (
    <RewardContext.Provider value={api}>
      {children}
      <RewardToaster toasts={toasts} />
    </RewardContext.Provider>
  );
}

export function useRewards() {
  const ctx = useContext(RewardContext);
  if (!ctx) return { push: () => {} };
  return ctx;
}