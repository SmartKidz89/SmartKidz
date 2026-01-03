"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";

const BASES = ["🙂", "🐱", "🐶", "🐵", "👽", "💩", "👻"];
const PROPS = ["🕶️", "🎩", "👑", "🎀", "😷", "🤠", "🥳"];

export default function EmojiKitchen() {
  const [base, setBase] = useState(BASES[0]);
  const [prop, setProp] = useState(PROPS[0]);

  return (
    <PageMotion className="min-h-screen bg-yellow-50 p-6 flex flex-col items-center justify-center">
      <HomeCloud to="/app/tools" label="Tools" />
      <h1 className="text-3xl font-black text-slate-900 mb-8">Emoji Kitchen</h1>

      <div className="w-64 h-64 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center relative mb-10 border-4 border-yellow-200">
         <div className="text-[8rem] leading-none absolute">{base}</div>
         <div className="text-[5rem] leading-none absolute -top-2 -right-2 transform rotate-12">{prop}</div>
      </div>

      <div className="flex gap-8">
         <div className="flex flex-col gap-2">
            <div className="text-xs font-bold uppercase text-slate-400 text-center">Base</div>
            {BASES.map(b => (
               <button key={b} onClick={() => setBase(b)} className={`text-4xl p-2 rounded-xl ${base === b ? "bg-white shadow" : "opacity-50"}`}>{b}</button>
            ))}
         </div>
         <div className="flex flex-col gap-2">
            <div className="text-xs font-bold uppercase text-slate-400 text-center">Prop</div>
            {PROPS.map(p => (
               <button key={p} onClick={() => setProp(p)} className={`text-4xl p-2 rounded-xl ${prop === p ? "bg-white shadow" : "opacity-50"}`}>{p}</button>
            ))}
         </div>
      </div>
    </PageMotion>
  );
}