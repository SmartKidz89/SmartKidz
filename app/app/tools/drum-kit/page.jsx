"use client";

import { useEffect, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";

const PADS = [
  { id: "kick", color: "bg-red-500", label: "Kick" },
  { id: "snare", color: "bg-blue-500", label: "Snare" },
  { id: "hat", color: "bg-yellow-500", label: "Hi-Hat" },
  { id: "clap", color: "bg-purple-500", label: "Clap" },
  { id: "tom", color: "bg-green-500", label: "Tom" },
  { id: "cymbal", color: "bg-orange-500", label: "Crash" }
];

export default function DrumKit() {
  const [activePad, setActivePad] = useState(null);

  const play = (id) => {
    setActivePad(id);
    setTimeout(() => setActivePad(null), 100);
    
    // Synth fallback
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (id === "kick") { osc.frequency.setValueAtTime(150, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5); }
    if (id === "snare") { osc.type = "triangle"; osc.frequency.setValueAtTime(300, ctx.currentTime); }
    if (id === "hat") { osc.type = "square"; osc.frequency.setValueAtTime(800, ctx.currentTime); gain.gain.value = 0.1; }
    
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  };

  return (
    <PageMotion className="min-h-screen bg-slate-900 p-6 flex flex-col items-center justify-center">
      <HomeCloud to="/app/tools" label="Tools" />
      <h1 className="text-3xl font-black text-white mb-8">Drum Kit</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-2xl w-full">
         {PADS.map(pad => (
            <button
               key={pad.id}
               onMouseDown={() => play(pad.id)}
               className={`aspect-square rounded-[2rem] flex items-center justify-center shadow-2xl transition-all active:scale-95 ${pad.color} ${activePad === pad.id ? "brightness-125 scale-95" : ""}`}
            >
               <span className="text-white font-black text-xl uppercase tracking-widest">{pad.label}</span>
            </button>
         ))}
      </div>
    </PageMotion>
  );
}