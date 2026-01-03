"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";

export default function SkyWriter() {
  const [text, setText] = useState("HELLO");
  
  return (
    <PageMotion className="min-h-screen bg-sky-400 p-6 flex flex-col items-center justify-center overflow-hidden">
      <HomeCloud to="/app/tools" label="Tools" />
      
      {/* Moving Clouds BG */}
      <div className="absolute inset-0 pointer-events-none">
         {[1,2,3,4,5].map(i => (
            <div 
               key={i} 
               className="absolute bg-white/30 rounded-full blur-xl animate-pulse"
               style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  width: `${100 + Math.random() * 200}px`,
                  height: `${50 + Math.random() * 100}px`,
                  animationDuration: `${5 + Math.random() * 10}s`
               }}
            />
         ))}
      </div>

      <div className="relative z-10 text-center">
         <div className="font-black text-[15vw] text-white/90 drop-shadow-lg tracking-widest" style={{ fontFamily: "cursive" }}>
            {text}
         </div>
         
         <div className="mt-12 bg-white p-4 rounded-full shadow-xl flex gap-4">
            <input 
              value={text} 
              onChange={e => setText(e.target.value.toUpperCase())}
              maxLength={8}
              className="text-2xl font-bold text-center outline-none text-sky-600 w-64 uppercase"
            />
         </div>
      </div>
    </PageMotion>
  );
}