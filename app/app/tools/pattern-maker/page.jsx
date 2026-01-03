"use client";

import { useEffect, useRef, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { Trash2 } from "lucide-react";

export default function PatternMakerPage() {
  const canvasRef = useRef(null);
  const [color, setColor] = useState("#000000");

  const clear = () => {
    const cvs = canvasRef.current;
    const ctx = cvs?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, cvs.width, cvs.height);
  };

  const draw = (e) => {
    if (e.buttons !== 1) return;
    const cvs = canvasRef.current;
    const ctx = cvs.getContext("2d");
    const rect = cvs.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const cx = cvs.width / 2;
    const cy = cvs.height / 2;
    
    ctx.fillStyle = color;
    
    // 4-way symmetry
    const points = [
      { x: x, y: y },
      { x: cvs.width - x, y: y },
      { x: x, y: cvs.height - y },
      { x: cvs.width - x, y: cvs.height - y }
    ];

    points.forEach(p => {
       ctx.beginPath();
       ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
       ctx.fill();
    });
  };

  return (
    <PageMotion className="min-h-screen bg-cyan-100 p-6 flex flex-col items-center justify-center">
      <HomeCloud to="/app/tools" label="Tools" />
      
      <div className="bg-white p-2 rounded-[2.5rem] shadow-xl">
         <canvas 
           ref={canvasRef}
           width={500}
           height={500}
           className="bg-white rounded-[2rem] cursor-crosshair touch-none border border-slate-100"
           onMouseMove={draw}
         />
      </div>

      <div className="mt-6 flex gap-4 bg-white/80 backdrop-blur p-4 rounded-full shadow-lg">
         <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-12 h-12 rounded-full cursor-pointer border-none" />
         <button onClick={clear} className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-rose-100 hover:text-rose-500">
            <Trash2 className="w-6 h-6" />
         </button>
      </div>
    </PageMotion>
  );
}