"use client";

import { useState, useEffect, useRef } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { playUISound, haptic } from "@/components/ui/sound";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useEconomy } from "@/lib/economy/client";
import { Volume2, Mic, ArrowRight, Check, X, Trophy, Sparkles, RefreshCw, AlertCircle } from "lucide-react";
import Link from "next/link";
import ConfettiBurst from "@/components/app/ConfettiBurst";

export default function SpellingClient() {
  const { activeChild } = useActiveChild();
  const economy = useEconomy(activeChild?.id);
  const year = activeChild?.year_level || 3;

  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(null); // { word, sentence }
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [streak, setStreak] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const inputRef = useRef(null);

  // Fetch a word
  async function nextWord() {
    setLoading(true);
    setInput("");
    setStatus("idle");
    setCurrent(null);
    setShowConfetti(false);

    try {
      const res = await fetch("/api/spelling-bee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year, count: 1 })
      });
      const data = await res.json();
      if (data.words?.[0]) {
        setCurrent(data.words[0]);
        // Auto-play word after a brief delay
        setTimeout(() => speak(data.words[0].word), 500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      // Focus input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }

  // Initial load
  useEffect(() => {
    nextWord();
  }, []);

  function speak(text) {
    if (typeof window === "undefined" || !window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  function check() {
    if (!current) return;
    const target = current.word.trim().toLowerCase();
    const guess = input.trim().toLowerCase();

    if (guess === target) {
      setStatus("success");
      setStreak(s => s + 1);
      setShowConfetti(true);
      playUISound("success");
      haptic("medium");
      economy.award(5, 10); // Reward
      speak("Correct! " + current.word);
    } else {
      setStatus("error");
      setStreak(0);
      playUISound("error");
      haptic("heavy");
      speak("Not quite. Try again.");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      if (status === "success") {
        nextWord();
      } else {
        check();
      }
    }
  }

  return (
    <PageMotion className="max-w-xl mx-auto pb-20 pt-6">
      <ConfettiBurst show={showConfetti} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-4">
        <Link href="/app/tools" className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
           <ArrowRight className="w-6 h-6 text-slate-600 rotate-180" />
        </Link>
        <div className="flex flex-col items-center">
           <h1 className="text-2xl font-black text-slate-900 tracking-tight">Spelling Bee</h1>
           <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
             <Trophy className="w-3 h-3 text-amber-500" /> Streak: {streak}
           </div>
        </div>
        <div className="w-12" /> {/* Spacer */}
      </div>

      <Card className="p-8 bg-white shadow-2xl border-slate-200 relative overflow-hidden">
         {/* Bee decoration */}
         <div className="absolute -top-10 -right-10 text-[10rem] opacity-5 pointer-events-none select-none rotate-12">
            🐝
         </div>

         {loading ? (
            <div className="flex flex-col items-center py-20 animate-pulse">
               <div className="w-20 h-20 rounded-full bg-slate-100 mb-4" />
               <div className="h-6 w-32 bg-slate-100 rounded-full" />
            </div>
         ) : !current ? (
            <div className="flex flex-col items-center py-12 text-center relative z-10">
               <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500 mb-4">
                  <AlertCircle className="w-10 h-10" />
               </div>
               <h3 className="text-xl font-bold text-slate-900 mb-2">Could not load word</h3>
               <p className="text-slate-500 mb-6 max-w-xs">There was a problem getting the next spelling word.</p>
               <Button onClick={nextWord}>Try Again</Button>
            </div>
         ) : (
            <div className="flex flex-col items-center gap-8 relative z-10">
               
               {/* Speaker Button */}
               <button 
                 onClick={() => speak(current.word)}
                 className="group relative w-32 h-32 rounded-full bg-amber-400 hover:bg-amber-300 shadow-[0_10px_30px_rgba(251,191,36,0.5)] flex items-center justify-center transition-transform active:scale-95"
               >
                 <Volume2 className="w-14 h-14 text-white fill-white/20" />
                 <span className="absolute -bottom-10 text-xs font-bold uppercase tracking-widest text-slate-400 group-hover:text-amber-500 transition-colors">
                   Tap to hear
                 </span>
                 <div className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping opacity-20" />
               </button>

               {/* Sentence Hint */}
               {current.sentence && (
                 <div className="text-center max-w-sm">
                    <button 
                      onClick={() => speak(current.sentence)}
                      className="text-lg text-slate-600 font-medium hover:text-indigo-600 transition-colors"
                    >
                      "{current.sentence}"
                    </button>
                 </div>
               )}

               {/* Input Area */}
               <div className="w-full relative">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => { setInput(e.target.value); setStatus("idle"); }}
                    onKeyDown={handleKeyDown}
                    disabled={status === "success"}
                    placeholder="Type the word..."
                    className={`w-full h-20 text-center text-3xl font-black rounded-3xl border-4 outline-none transition-all shadow-inner ${
                      status === "success" 
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700" 
                        : status === "error" 
                        ? "border-rose-300 bg-rose-50 text-rose-900 shake" 
                        : "border-slate-200 bg-slate-50 focus:border-amber-400 focus:bg-white"
                    }`}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="none"
                    spellCheck="false"
                  />
                  
                  {status === "success" && (
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 animate-in zoom-in spin-in-1">
                        <Check className="w-8 h-8 stroke-[4]" />
                     </div>
                  )}
                  {status === "error" && (
                     <div className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500 animate-in zoom-in">
                        <X className="w-8 h-8 stroke-[4]" />
                     </div>
                  )}
               </div>

               {/* Actions */}
               <div className="flex gap-3 w-full">
                  {status === "success" ? (
                    <Button onClick={nextWord} className="w-full h-14 text-lg shadow-xl bg-emerald-500 hover:bg-emerald-600 animate-in slide-in-from-bottom-2">
                       Next Word <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  ) : (
                    <Button 
                      onClick={check} 
                      disabled={!input.trim()} 
                      className="w-full h-14 text-lg shadow-xl"
                    >
                       Check Spelling
                    </Button>
                  )}
               </div>

            </div>
         )}
      </Card>
      
      {/* Footer Hint */}
      <div className="mt-8 text-center">
         <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            Year {year} Word List
         </p>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .shake { animation: shake 0.4s ease-in-out; }
      `}</style>
    </PageMotion>
  );
}