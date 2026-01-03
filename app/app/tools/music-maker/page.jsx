"use client";

import { useState, useEffect, useRef } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { Play, Pause, Trash2, Volume2 } from "lucide-react";

export default function MusicMakerPage() {
  const STEPS = 8;
  const NOTES = ["C5", "A4", "G4", "E4", "C4"]; // Simple pentatonic-ish
  const [grid, setGrid] = useState(
    NOTES.map(() => Array(STEPS).fill(false))
  );
  const [playing, setPlaying] = useState(false);
  const [step, setStep] = useState(0);

  // Audio Context Ref
  const audioCtxRef = useRef(null);

  useEffect(() => {
    let interval;
    if (playing) {
      interval = setInterval(() => {
        setStep(s => (s + 1) % STEPS);
      }, 250); // 240 BPM eighth notes approx
    }
    return () => clearInterval(interval);
  }, [playing]);

  // Play notes when step changes
  useEffect(() => {
    if (!playing) return;
    
    // Init audio if needed
    if (!audioCtxRef.current) {
       audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioCtxRef.current;

    grid.forEach((row, noteIdx) => {
       if (row[step]) {
          playTone(ctx, noteIdx);
       }
    });
  }, [step, playing, grid]);

  function playTone(ctx, noteIdx) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Frequencies for C Major Pentatonic ish
    const freqs = [523.25, 440.00, 392.00, 329.63, 261.63];
    osc.frequency.value = freqs[noteIdx];
    osc.type = "sine";
    
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  }

  const toggleCell = (row, col) => {
    const next = [...grid];
    next[row][col] = !next[row][col];
    setGrid(next);
  };

  const clear = () => setGrid(NOTES.map(() => Array(STEPS).fill(false)));

  return (
    <PageMotion className="min-h-screen bg-fuchsia-600 p-6 flex flex-col items-center justify-center">
      <HomeCloud to="/app/tools" label="Tools" />

      <div className="bg-white rounded-[3rem] p-8 shadow-2xl max-w-2xl w-full text-center">
         <div className="flex items-center justify-center gap-3 mb-8">
            <Volume2 className="w-8 h-8 text-fuchsia-600" />
            <h1 className="text-3xl font-black text-slate-900">Music Maker</h1>
         </div>

         <div className="inline-grid gap-2 p-4 bg-slate-100 rounded-2xl mb-8">
            {grid.map((row, r) => (
               <div key={r} className="flex gap-2">
                  {row.map((active, c) => (
                     <button
                       key={c}
                       onClick={() => toggleCell(r, c)}
                       className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg transition-all ${
                         active ? "bg-fuchsia-500 shadow-lg scale-95" : "bg-white hover:bg-slate-50"
                       } ${c === step && playing ? "ring-4 ring-fuchsia-200" : ""}`}
                     />
                  ))}
               </div>
            ))}
         </div>

         <div className="flex justify-center gap-4">
            <button 
              onClick={() => setPlaying(!playing)}
              className="h-16 w-16 rounded-full bg-slate-900 text-white flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
            >
               {playing ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
            </button>
            <button 
              onClick={clear}
              className="h-16 w-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:text-rose-500 hover:bg-rose-50 transition-colors"
            >
               <Trash2 className="w-6 h-6" />
            </button>
         </div>
      </div>
    </PageMotion>
  );
}