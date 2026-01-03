"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";

const THEMES = [
   { id: "bday", bg: "bg-pink-200", text: "Happy Birthday!" },
   { id: "thx", bg: "bg-teal-200", text: "Thank You!" },
   { id: "love", bg: "bg-rose-200", text: "Love You!" },
];

export default function CardCreator() {
  const [theme, setTheme] = useState(THEMES[0]);
  const [msg, setMsg] = useState("To my best friend!");

  return (
    <PageMotion className="min-h-screen bg-slate-100 p-6 flex flex-col items-center justify-center">
      <HomeCloud to="/app/tools" label="Tools" />
      
      <div className={`w-full max-w-md aspect-[3/4] ${theme.bg} rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center text-center transition-colors duration-500`}>
         <h2 className="text-4xl font-black text-slate-900 mb-4">{theme.text}</h2>
         <textarea 
            value={msg}
            onChange={e => setMsg(e.target.value)}
            className="w-full bg-white/50 rounded-xl p-4 text-xl font-medium text-slate-800 text-center resize-none outline-none focus:bg-white/80 transition-colors"
            rows={4}
         />
         <div className="mt-8 text-sm font-bold text-slate-500">From: [Your Name]</div>
      </div>

      <div className="flex gap-4 mt-8">
         {THEMES.map(t => (
            <button
               key={t.id}
               onClick={() => setTheme(t)}
               className={`w-12 h-12 rounded-full border-4 ${theme.id === t.id ? "border-slate-900 scale-110" : "border-white"} ${t.bg}`}
            />
         ))}
      </div>
    </PageMotion>
  );
}