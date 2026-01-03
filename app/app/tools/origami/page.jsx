"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { ChevronRight, ChevronLeft } from "lucide-react";

const INSTRUCTIONS = [
  { id: 1, text: "Start with a square piece of paper.", img: "🟩" },
  { id: 2, text: "Fold it in half to make a triangle.", img: "🔺" },
  { id: 3, text: "Fold the corners down to make ears.", img: "🐶" },
  { id: 4, text: "Fold the bottom tip up.", img: "😺" },
  { id: 5, text: "Draw a face! You made a cat/dog!", img: "🎨" }
];

export default function OrigamiPage() {
  const [step, setStep] = useState(0);

  return (
    <PageMotion className="min-h-screen bg-orange-50 p-6 flex flex-col items-center justify-center">
      <HomeCloud to="/app/tools" label="Tools" />
      
      <div className="max-w-xl w-full text-center space-y-8">
        <h1 className="text-4xl font-black text-orange-600 tracking-tight">Origami: Simple Cat</h1>
        
        <div className="bg-white rounded-[3rem] p-12 shadow-2xl border-4 border-orange-200 aspect-square flex flex-col items-center justify-center">
           <div className="text-[10rem] mb-6">{INSTRUCTIONS[step].img}</div>
           <p className="text-xl font-bold text-slate-700">{INSTRUCTIONS[step].text}</p>
        </div>

        <div className="flex justify-center gap-4">
           <button 
             onClick={() => setStep(Math.max(0, step - 1))}
             disabled={step === 0}
             className="h-16 w-16 rounded-full bg-white border-2 border-orange-200 text-orange-600 flex items-center justify-center shadow-lg disabled:opacity-50 hover:scale-105 transition-transform"
           >
             <ChevronLeft className="w-8 h-8" />
           </button>
           <div className="flex items-center gap-2">
             {INSTRUCTIONS.map((_, i) => (
               <div key={i} className={`w-3 h-3 rounded-full ${i === step ? "bg-orange-500" : "bg-orange-200"}`} />
             ))}
           </div>
           <button 
             onClick={() => setStep(Math.min(INSTRUCTIONS.length - 1, step + 1))}
             disabled={step === INSTRUCTIONS.length - 1}
             className="h-16 w-16 rounded-full bg-orange-500 text-white flex items-center justify-center shadow-lg disabled:opacity-50 hover:scale-105 transition-transform"
           >
             <ChevronRight className="w-8 h-8" />
           </button>
        </div>
      </div>
    </PageMotion>
  );
}