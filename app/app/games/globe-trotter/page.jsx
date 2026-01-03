"use client";

import { useState, useEffect } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { Globe2, Check, X, Trophy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { playUISound } from "@/components/ui/sound";
import Image from "next/image";

export default function GlobeTrotterGame() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentRound, setCurrentRound] = useState(null);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("playing"); // playing | correct | wrong

  useEffect(() => {
    fetch("https://restcountries.com/v3.1/all?fields=name,flags")
      .then(res => res.json())
      .then(data => {
        setCountries(data);
        setLoading(false);
        startRound(data);
      })
      .catch(() => setLoading(false));
  }, []);

  function startRound(allCountries) {
    if (!allCountries?.length) return;
    const list = allCountries || countries;
    
    // Pick 1 correct + 3 distractors
    const target = list[Math.floor(Math.random() * list.length)];
    const options = [target];
    while (options.length < 4) {
       const r = list[Math.floor(Math.random() * list.length)];
       if (!options.includes(r)) options.push(r);
    }
    
    // Shuffle options
    options.sort(() => Math.random() - 0.5);

    setCurrentRound({ target, options });
    setStatus("playing");
  }

  function handleGuess(c) {
    if (status !== "playing") return;
    
    if (c.name.common === currentRound.target.name.common) {
       setStatus("correct");
       setScore(s => s + 1);
       playUISound("success");
       setTimeout(() => startRound(countries), 1500);
    } else {
       setStatus("wrong");
       playUISound("error");
       // Reset or just wait? Let's just wait and go next
       setTimeout(() => startRound(countries), 1500);
    }
  }

  if (loading) return <div className="min-h-screen bg-sky-500 flex items-center justify-center text-white font-bold">Loading Map...</div>;

  return (
    <PageMotion className="min-h-screen bg-sky-500 p-6 flex flex-col items-center justify-center">
      <HomeCloud to="/app/rewards" label="Exit" />

      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-8 text-center relative">
         <div className="absolute top-6 left-6 text-sky-600 font-black text-xl flex items-center gap-2">
            <Trophy className="w-6 h-6" /> {score}
         </div>

         <div className="mb-8">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Where is this flag from?</div>
            <div className="relative w-48 h-32 mx-auto rounded-xl overflow-hidden shadow-lg border-4 border-slate-100">
               {currentRound?.target && (
                 <Image src={currentRound.target.flags.svg} alt="Flag" fill className="object-cover" />
               )}
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentRound?.options.map((c, i) => {
               const isTarget = c.name.common === currentRound.target.name.common;
               let btnClass = "bg-slate-50 border-2 border-slate-200 text-slate-700 hover:bg-slate-100";
               
               if (status !== "playing") {
                  if (isTarget) btnClass = "bg-emerald-500 border-emerald-600 text-white";
                  else btnClass = "opacity-50 grayscale";
               }

               return (
                 <button
                   key={i}
                   onClick={() => handleGuess(c)}
                   className={`h-16 rounded-2xl font-bold text-lg transition-all ${btnClass}`}
                 >
                    {c.name.common}
                 </button>
               );
            })}
         </div>

         {status === "correct" && (
            <div className="absolute inset-0 bg-emerald-500/90 backdrop-blur flex items-center justify-center flex-col text-white animate-in fade-in zoom-in">
               <Check className="w-24 h-24 mb-4" />
               <div className="text-4xl font-black">Correct!</div>
            </div>
         )}
         
         {status === "wrong" && (
            <div className="absolute inset-0 bg-rose-500/90 backdrop-blur flex items-center justify-center flex-col text-white animate-in fade-in zoom-in">
               <X className="w-24 h-24 mb-4" />
               <div className="text-4xl font-black">Oops!</div>
               <div className="mt-2 font-bold">It was {currentRound.target.name.common}</div>
            </div>
         )}
      </div>
    </PageMotion>
  );
}