"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { Eraser, Trash2, Box } from "lucide-react";

const COLORS = ["#ef4444", "#f97316", "#f59e0b", "#84cc16", "#10b981", "#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#d946ef", "#52525b", "#9ca3af", "#ffffff"];

export default function BlockBuilderGame() {
  const GRID_W = 16;
  const GRID_H = 12;
  const [grid, setGrid] = useState(Array(GRID_W * GRID_H).fill(null));
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const toggleBlock = (i) => {
    const next = [...grid];
    // If clicking with same color, remove it (or use dedicated eraser)
    // Here we strictly paint over
    next[i] = selectedColor === "eraser" ? null : selectedColor;
    setGrid(next);
  };

  const clear = () => {
    if (confirm("Clear your build?")) setGrid(Array(GRID_W * GRID_H).fill(null));
  };

  return (
    <PageMotion className="min-h-screen bg-slate-200 p-6 flex flex-col items-center justify-center">
      <HomeCloud to="/app/rewards" label="Exit" />

      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg">
           <Box className="w-6 h-6 text-slate-700" />
           <h1 className="font-black text-slate-800 text-xl">BLOCK BUILDER</h1>
        </div>

        <div 
           className="bg-white p-4 rounded-xl shadow-2xl border-4 border-slate-300 grid gap-1"
           style={{ gridTemplateColumns: `repeat(${GRID_W}, 1fr)` }}
        >
           {grid.map((cell, i) => (
             <div 
               key={i}
               onClick={() => toggleBlock(i)}
               className="w-8 h-8 sm:w-10 sm:h-10 rounded-md cursor-pointer border border-slate-100 hover:brightness-90 transition-all active:scale-90"
               style={{ backgroundColor: cell || "#f1f5f9" }}
             />
           ))}
        </div>

        <div className="flex flex-wrap justify-center gap-3 bg-white p-4 rounded-2xl shadow-xl">
           {COLORS.map(c => (
             <button
               key={c}
               onClick={() => setSelectedColor(c)}
               className={`w-10 h-10 rounded-full border-4 transition-transform hover:scale-110 ${selectedColor === c ? "border-slate-800 scale-110" : "border-transparent"}`}
               style={{ backgroundColor: c }}
             />
           ))}
           <div className="w-px h-10 bg-slate-200 mx-2" />
           <button 
             onClick={() => setSelectedColor("eraser")}
             className={`w-10 h-10 rounded-full border-4 flex items-center justify-center text-slate-500 bg-slate-100 ${selectedColor === "eraser" ? "border-slate-800 bg-slate-200" : "border-transparent"}`}
           >
             <Eraser className="w-5 h-5" />
           </button>
           <button 
             onClick={clear}
             className="w-10 h-10 rounded-full border-4 border-transparent bg-rose-100 text-rose-500 flex items-center justify-center hover:bg-rose-200"
           >
             <Trash2 className="w-5 h-5" />
           </button>
        </div>
      </div>
    </PageMotion>
  );
}