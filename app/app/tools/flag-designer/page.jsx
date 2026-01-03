"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { Palette, Flag } from "lucide-react";

const EMBLEMS = ["⭐", "☀️", "🦁", "🦅", "⚔️", "🐉", "🍁", "🔵", "🔴"];
const COLORS = ["#ef4444", "#3b82f6", "#22c55e", "#eab308", "#000000", "#ffffff"];

export default function FlagDesigner() {
  const [stripes, setStripes] = useState(["#3b82f6", "#ffffff", "#ef4444"]);
  const [emblem, setEmblem] = useState("⭐");

  const setColor = (idx, c) => {
    const next = [...stripes];
    next[idx] = c;
    setStripes(next);
  };

  return (
    <PageMotion className="min-h-screen bg-slate-100 p-6 flex flex-col items-center justify-center">
      <HomeCloud to="/app/tools" label="Tools" />
      <h1 className="text-3xl font-black text-slate-900 mb-8">Flag Designer</h1>

      {/* Flag Preview */}
      <div className="relative w-80 h-52 shadow-2xl border-4 border-slate-900 rounded-lg overflow-hidden flex flex-col mb-8">
         {stripes.map((c, i) => (
           <div key={i} className="flex-1 transition-colors" style={{ backgroundColor: c }} />
         ))}
         <div className="absolute inset-0 flex items-center justify-center text-6xl drop-shadow-lg">
            {emblem}
         </div>
         {/* Pole */}
         <div className="absolute top-0 bottom-0 left-0 w-2 bg-black/10" />
      </div>

      <div className="bg-white p-6 rounded-[2rem] shadow-xl w-full max-w-md space-y-6">
         {/* Stripes */}
         {[0,1,2].map(i => (
           <div key={i} className="flex gap-2 justify-center">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(i, c)}
                  className={`w-8 h-8 rounded-full border-2 ${stripes[i] === c ? "border-slate-900 scale-110" : "border-slate-200"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
           </div>
         ))}

         {/* Emblems */}
         <div className="pt-4 border-t border-slate-100 flex gap-2 justify-center flex-wrap">
            {EMBLEMS.map(e => (
              <button
                key={e}
                onClick={() => setEmblem(e)}
                className={`text-2xl p-2 rounded-xl transition-all ${emblem === e ? "bg-slate-100 scale-110" : "hover:bg-slate-50"}`}
              >
                {e}
              </button>
            ))}
         </div>
      </div>
    </PageMotion>
  );
}