"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";

export default function ColorLabPage() {
  const [r, setR] = useState(128);
  const [g, setG] = useState(128);
  const [b, setB] = useState(128);

  const color = `rgb(${r}, ${g}, ${b})`;

  return (
    <PageMotion className="min-h-screen bg-slate-100 p-6 flex flex-col items-center justify-center">
      <HomeCloud to="/app/tools" label="Tools" />

      <div className="w-full max-w-lg bg-white rounded-[3rem] p-8 shadow-2xl">
         <div 
           className="w-full h-48 rounded-[2rem] shadow-inner mb-8 transition-colors duration-200 border-4 border-slate-100"
           style={{ backgroundColor: color }}
         />
         
         <div className="space-y-6">
            <div className="space-y-2">
               <label className="font-bold text-rose-500 flex justify-between">
                 <span>Red</span> <span>{r}</span>
               </label>
               <input type="range" min="0" max="255" value={r} onChange={e => setR(e.target.value)} className="w-full h-4 bg-rose-100 rounded-full appearance-none accent-rose-500" />
            </div>
            <div className="space-y-2">
               <label className="font-bold text-emerald-500 flex justify-between">
                 <span>Green</span> <span>{g}</span>
               </label>
               <input type="range" min="0" max="255" value={g} onChange={e => setG(e.target.value)} className="w-full h-4 bg-emerald-100 rounded-full appearance-none accent-emerald-500" />
            </div>
            <div className="space-y-2">
               <label className="font-bold text-blue-500 flex justify-between">
                 <span>Blue</span> <span>{b}</span>
               </label>
               <input type="range" min="0" max="255" value={b} onChange={e => setB(e.target.value)} className="w-full h-4 bg-blue-100 rounded-full appearance-none accent-blue-500" />
            </div>
         </div>
      </div>
    </PageMotion>
  );
}