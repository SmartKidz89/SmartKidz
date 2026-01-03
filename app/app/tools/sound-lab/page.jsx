"use client";

import { useEffect, useRef, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { Play, Square } from "lucide-react";

export default function SoundLabPage() {
  const [playing, setPlaying] = useState(false);
  const [freq, setFreq] = useState(440);
  const [type, setType] = useState("sine");
  
  const ctxRef = useRef(null);
  const oscRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (playing) {
       ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
       oscRef.current = ctxRef.current.createOscillator();
       const gain = ctxRef.current.createGain();
       
       oscRef.current.type = type;
       oscRef.current.frequency.value = freq;
       gain.gain.value = 0.1;
       
       oscRef.current.connect(gain);
       gain.connect(ctxRef.current.destination);
       oscRef.current.start();
       
       draw();
    } else {
       if (oscRef.current) oscRef.current.stop();
       if (ctxRef.current) ctxRef.current.close();
    }
  }, [playing]);

  useEffect(() => {
     if (oscRef.current && playing) {
        oscRef.current.frequency.value = freq;
        oscRef.current.type = type;
     }
  }, [freq, type]);

  const draw = () => {
    if (!canvasRef.current || !playing) return;
    const cvs = canvasRef.current;
    const ctx = cvs.getContext("2d");
    const w = cvs.width;
    const h = cvs.height;
    
    ctx.clearRect(0, 0, w, h);
    ctx.beginPath();
    ctx.strokeStyle = "#10b981";
    ctx.lineWidth = 4;
    
    for (let x = 0; x < w; x++) {
       const y = h/2 + Math.sin(x * freq * 0.0005 + Date.now() * 0.01) * 50;
       if (x===0) ctx.moveTo(x, y);
       else ctx.lineTo(x, y);
    }
    ctx.stroke();
    requestAnimationFrame(draw);
  };

  return (
    <PageMotion className="min-h-screen bg-slate-900 p-6 flex flex-col items-center justify-center text-white">
      <HomeCloud to="/app/tools" label="Tools" />

      <div className="w-full max-w-2xl bg-slate-800 rounded-[3rem] p-8 border border-slate-700 shadow-2xl text-center">
         <h1 className="text-3xl font-black mb-8 text-emerald-400">Sound Lab</h1>
         
         <canvas ref={canvasRef} width={600} height={200} className="w-full bg-slate-950 rounded-2xl mb-8 border border-slate-700" />
         
         <div className="flex items-center gap-6 justify-center mb-8">
            <input 
              type="range" 
              min="100" 
              max="1000" 
              value={freq} 
              onChange={e => setFreq(Number(e.target.value))} 
              className="w-64 accent-emerald-500"
            />
            <span className="font-mono font-bold w-16">{freq} Hz</span>
         </div>

         <div className="flex justify-center gap-4">
            <button 
              onClick={() => setPlaying(!playing)}
              className={`h-20 w-20 rounded-full flex items-center justify-center text-3xl shadow-xl transition-transform hover:scale-105 ${playing ? "bg-rose-500" : "bg-emerald-500"}`}
            >
               {playing ? <Square className="fill-current w-8 h-8" /> : <Play className="fill-current w-8 h-8 ml-1" />}
            </button>
         </div>
      </div>
    </PageMotion>
  );
}