"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";

const STICKERS = ["😀", "😎", "🦖", "🚀", "💬", "💥", "🐱"];

export default function ComicCreatorPage() {
  const [panels, setPanels] = useState([[], [], []]);
  const [dragItem, setDragItem] = useState(null);

  const drop = (panelIdx) => {
    if (!dragItem) return;
    const next = [...panels];
    next[panelIdx] = [...next[panelIdx], dragItem];
    setPanels(next);
    setDragItem(null);
  };

  return (
    <PageMotion className="min-h-screen bg-yellow-50 p-6 flex flex-col items-center justify-center">
      <HomeCloud to="/app/tools" label="Tools" />

      <h1 className="text-4xl font-black text-slate-900 mb-8 transform -rotate-2">COMIC MAKER</h1>

      <div className="flex flex-col md:flex-row gap-4 w-full max-w-4xl">
         {panels.map((items, i) => (
           <div 
             key={i}
             onDragOver={e => e.preventDefault()}
             onDrop={() => drop(i)}
             className="flex-1 h-64 bg-white border-4 border-slate-900 rounded-lg shadow-xl relative overflow-hidden group"
           >
              <div className="absolute top-2 left-2 text-slate-200 font-black text-4xl select-none">{i + 1}</div>
              <div className="w-full h-full p-4 flex flex-wrap content-start gap-2">
                 {items.map((s, idx) => (
                    <div key={idx} className="text-5xl cursor-move">{s}</div>
                 ))}
              </div>
           </div>
         ))}
      </div>

      <div className="mt-8 bg-white p-4 rounded-2xl shadow-lg flex gap-4 overflow-x-auto border-2 border-slate-900">
         {STICKERS.map(s => (
            <div 
              key={s}
              draggable
              onDragStart={() => setDragItem(s)}
              className="text-5xl cursor-grab hover:scale-110 transition-transform"
            >
               {s}
            </div>
         ))}
      </div>
    </PageMotion>
  );
}