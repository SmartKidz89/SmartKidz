"use client";

import { useEffect, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useEconomy } from "@/lib/economy/client";
import { useActiveChild } from "@/hooks/useActiveChild";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Trophy, Star, Zap, Lock, Crown } from "lucide-react";
import SeasonPassPanel from "@/components/app/SeasonPassPanel";
import Link from "next/link";

function Stat({ label, value, icon, color }) {
  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</div>
        <div className="text-2xl font-black text-slate-900">{value}</div>
      </div>
    </div>
  );
}

export default function RewardsPage() {
  const { activeChild } = useActiveChild();
  const economy = useEconomy(activeChild?.id);
  
  return (
    <PageMotion className="max-w-5xl mx-auto pb-24">
      
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          Hall of Fame
        </h1>
        <p className="text-lg text-slate-600 font-medium">
          Track your wins, level up, and unlock epic rewards.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <Stat 
          label="Coins" 
          value={economy?.coins || 0} 
          icon="🪙" 
          color="bg-amber-100" 
        />
        <Stat 
          label="Level" 
          value={economy?.level || 1} 
          icon="⭐" 
          color="bg-indigo-100" 
        />
        <Stat 
          label="Total XP" 
          value={economy?.xp || 0} 
          icon="⚡" 
          color="bg-emerald-100" 
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_350px] gap-8">
        
        {/* Main Column */}
        <div className="space-y-8">
           
           {/* Season Pass Section */}
           <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Crown className="w-8 h-8 text-amber-400" />
                  <h2 className="text-2xl font-black">Season Pass</h2>
                </div>
                <div className="bg-white/10 rounded-3xl p-6 backdrop-blur-md border border-white/10">
                   <SeasonPassPanel />
                </div>
              </div>
           </section>

           {/* Quick Actions */}
           <div className="grid sm:grid-cols-2 gap-4">
              <Link href="/app/avatar" className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                 <div className="w-14 h-14 bg-rose-100 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                   🧢
                 </div>
                 <h3 className="text-xl font-black text-slate-900 mb-1">Avatar Shop</h3>
                 <p className="text-slate-500 text-sm font-medium">Spend coins on new looks.</p>
              </Link>
              
              <Link href="/app/collection" className="group bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                 <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
                   📒
                 </div>
                 <h3 className="text-xl font-black text-slate-900 mb-1">Sticker Book</h3>
                 <p className="text-slate-500 text-sm font-medium">View your collection.</p>
              </Link>
           </div>

        </div>

        {/* Sidebar: Streak & Badges */}
        <div className="space-y-6">
           <Card className="p-6 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-100">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-black text-orange-900 text-lg flex items-center gap-2">
                   <Zap className="w-5 h-5" /> Daily Streak
                 </h3>
                 <span className="bg-white/50 px-3 py-1 rounded-full text-xs font-bold text-orange-700">7 Days</span>
              </div>
              
              <div className="flex justify-between gap-1">
                 {['M','T','W','T','F','S','S'].map((d, i) => (
                   <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i < 5 ? 'bg-orange-500 text-white shadow-md' : 'bg-white/60 text-orange-300'}`}>
                        {i < 5 ? '✓' : ''}
                      </div>
                      <span className="text-[10px] font-bold text-orange-400">{d}</span>
                   </div>
                 ))}
              </div>
              <p className="text-center text-xs font-bold text-orange-700/60 mt-4">
                 Keep it up! 3 more days to a bonus.
              </p>
           </Card>

           <Card className="p-6">
              <h3 className="font-black text-slate-900 mb-4">Recent Badges</h3>
              <div className="grid grid-cols-3 gap-3">
                 {[1,2,3,4,5,6].map((i) => (
                   <div key={i} className="aspect-square rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl grayscale opacity-60">
                      {i <= 3 ? '🏅' : <Lock className="w-5 h-5 text-slate-300" />}
                   </div>
                 ))}
              </div>
              <Button variant="ghost" className="w-full mt-4 text-xs">View All</Button>
           </Card>
        </div>

      </div>
    </PageMotion>
  );
}