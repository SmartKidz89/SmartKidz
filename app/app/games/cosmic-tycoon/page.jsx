"use client";

import { useState, useEffect } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { HomeCloud } from "@/components/app/world/HomeCloud";
import { Rocket, Star, Zap, Hammer } from "lucide-react";
import { playUISound, haptic } from "@/components/ui/sound";

export default function CosmicTycoonGame() {
  const [stardust, setStardust] = useState(0);
  const [cps, setCps] = useState(0); // Coins per second
  
  // Upgrades
  const [miners, setMiners] = useState(0); // +1 cps
  const [rovers, setRovers] = useState(0); // +5 cps
  
  const MINER_COST = 20;
  const ROVER_COST = 100;

  // Game Loop
  useEffect(() => {
    const t = setInterval(() => {
      if (cps > 0) {
        setStardust(s => s + cps);
      }
    }, 1000);
    return () => clearInterval(t);
  }, [cps]);

  // Recalculate CPS
  useEffect(() => {
    setCps(miners * 1 + rovers * 5);
  }, [miners, rovers]);

  const clickMine = () => {
    setStardust(s => s + 1);
    playUISound("tap");
    haptic("light");
  };

  const buyMiner = () => {
    if (stardust >= MINER_COST) {
      setStardust(s => s - MINER_COST);
      setMiners(m => m + 1);
      playUISound("success");
    }
  };

  const buyRover = () => {
    if (stardust >= ROVER_COST) {
      setStardust(s => s - ROVER_COST);
      setRovers(r => r + 1);
      playUISound("success");
    }
  };

  return (
    <PageMotion className="min-h-screen bg-slate-900 text-white p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-20 mix-blend-overlay pointer-events-none" />
      
      {/* Stars BG */}
      <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full blur-[1px] animate-pulse" />
      <div className="absolute top-40 right-20 w-1 h-1 bg-blue-300 rounded-full blur-[1px]" />
      <div className="absolute bottom-20 left-1/3 w-3 h-3 bg-purple-300 rounded-full blur-[2px] animate-pulse" />

      <HomeCloud to="/app/rewards" label="Base" />

      <div className="max-w-4xl mx-auto mt-12 grid md:grid-cols-2 gap-8 relative z-10">
         
         {/* Main Action Area */}
         <div className="flex flex-col items-center justify-center text-center space-y-8">
            <div>
               <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Cosmic Bank</div>
               <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-amber-200 to-amber-500 filter drop-shadow-lg">
                 {stardust}
               </div>
               <div className="text-sm font-bold text-slate-400 mt-2">{cps} Stardust / sec</div>
            </div>

            <button 
              onClick={clickMine}
              className="w-48 h-48 rounded-full bg-indigo-600 shadow-[0_0_60px_rgba(79,70,229,0.4)] border-8 border-indigo-500 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group"
            >
               <div className="text-7xl group-hover:rotate-12 transition-transform">☄️</div>
            </button>
            <div className="text-sm font-bold text-slate-500 animate-bounce">Tap to Mine!</div>
         </div>

         {/* Shop */}
         <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400">
                  <Zap className="w-6 h-6" />
               </div>
               <h2 className="text-xl font-black">Upgrades</h2>
            </div>

            <div className="space-y-4">
               {/* Miner */}
               <button 
                 onClick={buyMiner}
                 disabled={stardust < MINER_COST}
                 className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <div className="flex items-center gap-4">
                     <div className="text-3xl">🤖</div>
                     <div className="text-left">
                        <div className="font-bold text-white">Auto-Bot</div>
                        <div className="text-xs text-indigo-300 font-bold">+1 / sec</div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="font-bold text-amber-400">{MINER_COST}</div>
                     <div className="text-[10px] text-slate-400 font-bold uppercase">Owned: {miners}</div>
                  </div>
               </button>

               {/* Rover */}
               <button 
                 onClick={buyRover}
                 disabled={stardust < ROVER_COST}
                 className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <div className="flex items-center gap-4">
                     <div className="text-3xl">🚙</div>
                     <div className="text-left">
                        <div className="font-bold text-white">Moon Rover</div>
                        <div className="text-xs text-indigo-300 font-bold">+5 / sec</div>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="font-bold text-amber-400">{ROVER_COST}</div>
                     <div className="text-[10px] text-slate-400 font-bold uppercase">Owned: {rovers}</div>
                  </div>
               </button>
            </div>
         </div>

      </div>
    </PageMotion>
  );
}