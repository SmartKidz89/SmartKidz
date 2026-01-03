"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Button } from "@/components/ui/Button";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { Play, Pickaxe, Ghost, Gamepad2, BrainCircuit } from "lucide-react";
import ConfettiBurst from "@/components/app/ConfettiBurst";

// --- Simple Game Logics ---

function MathsMiner() {
  const [score, setScore] = useState(0);
  const [q, setQ] = useState({ a: 2, b: 2, ans: 4 });
  
  function next() {
    const a = Math.floor(Math.random() * 10);
    const b = Math.floor(Math.random() * 10);
    setQ({ a, b, ans: a + b });
  }

  function check(val) {
    if (val === q.ans) {
      setScore(s => s + 10);
      next();
    } else {
      setScore(s => Math.max(0, s - 5));
    }
  }

  const options = [q.ans, q.ans + 1, q.ans - 1].sort(() => Math.random() - 0.5);

  return (
    <div className="text-center space-y-8">
      <div className="text-6xl mb-4">💎 {score}</div>
      <div className="text-4xl font-black text-slate-800 bg-white p-8 rounded-3xl shadow-xl border-4 border-slate-900 inline-block min-w-[300px]">
        {q.a} + {q.b} = ?
      </div>
      <div className="flex justify-center gap-4">
        {options.map((o, i) => (
          <button key={i} onClick={() => check(o)} className="w-24 h-24 rounded-2xl bg-slate-900 text-white font-black text-3xl shadow-lg hover:bg-slate-700 active:scale-95 transition-all">
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function RetroRunner() {
  const [jumping, setJumping] = useState(false);
  
  function jump() {
    if (jumping) return;
    setJumping(true);
    setTimeout(() => setJumping(false), 600);
  }

  return (
    <div 
      className="relative w-full h-80 bg-slate-900 rounded-3xl overflow-hidden cursor-pointer border-4 border-slate-700" 
      onClick={jump}
    >
       <div className="absolute top-4 right-4 text-emerald-400 font-mono text-xl">SCORE: 0042</div>
       
       {/* Ground */}
       <div className="absolute bottom-0 w-full h-10 bg-emerald-600" />
       
       {/* Player */}
       <div 
         className={`absolute left-20 w-10 h-10 bg-amber-400 border-2 border-white transition-transform duration-300 ease-out ${jumping ? "bottom-32 rotate-180" : "bottom-10"}`} 
       />
       
       {/* Obstacle (Static for MVP visual) */}
       <div className="absolute right-20 bottom-10 w-8 h-12 bg-rose-500 animate-pulse" />

       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 text-white/50 font-bold text-sm pointer-events-none">
         TAP TO JUMP
       </div>
    </div>
  );
}

// --- Main Page ---

export default function GamePage() {
  const { gameId } = useParams();
  const router = useRouter();
  
  // Game Config
  const CONFIG = {
    "maths-miner": { title: "Maths Miner", color: "bg-emerald-500", component: MathsMiner },
    "retro-runner": { title: "Retro Runner", color: "bg-indigo-600", component: RetroRunner },
    "word-royale": { title: "Word Royale", color: "bg-violet-600", component: () => <div className="text-2xl font-bold text-slate-500">Spelling Battle Loaded...</div> },
    "logic-loops": { title: "Logic Loops", color: "bg-sky-500", component: () => <div className="text-2xl font-bold text-slate-500">Pattern Puzzle Loaded...</div> },
  };

  const game = CONFIG[gameId];

  if (!game) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Button onClick={() => router.push("/app/rewards")}>Back to Arcade</Button>
      </div>
    );
  }

  const Comp = game.component;

  return (
    <PageMotion className={`min-h-screen ${game.color} p-6 flex flex-col`}>
      <HomeCloud to="/app/rewards" label="Quit Game" />
      
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full">
        <div className="bg-white/90 backdrop-blur-xl rounded-[3rem] p-8 sm:p-12 shadow-2xl w-full border-4 border-white/20">
           <div className="flex items-center justify-center gap-3 mb-8 opacity-50">
              <Gamepad2 className="w-6 h-6" />
              <span className="font-black uppercase tracking-widest">{game.title}</span>
           </div>
           
           <Comp />
        </div>
      </div>
    </PageMotion>
  );
}