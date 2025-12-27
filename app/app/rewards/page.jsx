"use client";

import { PageMotion } from "@/components/ui/PremiumMotion";
import { useEconomy } from "@/lib/economy/client";
import { useActiveChild } from "@/hooks/useActiveChild";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Trophy, Star, Zap, Lock, Crown, ChevronRight } from "lucide-react";
import SeasonPassPanel from "@/components/app/SeasonPassPanel";
import Link from "next/link";

function Stat({ label, value, icon, color, bg }) {
  return (
    <div className={`p-6 rounded-3xl border border-white/20 shadow-sm flex items-center gap-5 transition-transform hover:-translate-y-1 ${bg}`}>
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl bg-white/90 shadow-sm ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-black uppercase tracking-wider opacity-60 mb-1">{label}</div>
        <div className="text-3xl font-black">{value}</div>
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
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-10">
        <div>
           <div className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-2">Hall of Fame</div>
           <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
             Your Trophy Room
           </h1>
        </div>
        <div className="flex gap-3">
           <Link href="/app/collection">
             <Button variant="secondary" className="shadow-sm">View Sticker Book</Button>
           </Link>
           <Link href="/app/avatar">
             <Button className="shadow-lg">Avatar Shop</Button>
           </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
        <Stat 
          label="Total Coins" 
          value={economy?.coins || 0} 
          icon="🪙" 
          bg="bg-amber-100 text-amber-900"
          color="text-amber-500"
        />
        <Stat 
          label="Current Level" 
          value={economy?.level || 1} 
          icon="⭐" 
          bg="bg-indigo-100 text-indigo-900"
          color="text-indigo-500" 
        />
        <Stat 
          label="Total XP" 
          value={economy?.xp || 0} 
          icon="⚡" 
          bg="bg-emerald-100 text-emerald-900"
          color="text-emerald-500" 
        />
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        
        {/* Main Column */}
        <div className="space-y-8">
           
           {/* Season Pass Section */}
           <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-b from-indigo-500/30 to-transparent rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center text-slate-900">
                      <Crown className="w-6 h-6 fill-current" />
                    </div>
                    <h2 className="text-2xl font-black">Season Pass</h2>
                  </div>
                  <div className="text-xs font-bold bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
                    Season 1
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-3xl p-6 backdrop-blur-md border border-white/10">
                   <SeasonPassPanel />
                </div>
              </div>
           </section>

           {/* Avatar Promo */}
           <Link href="/app/avatar" className="group block bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-rose-100 rounded-full blur-[60px] -mr-16 -mt-16 opacity-50" />
               <div className="relative z-10 flex items-center justify-between">
                  <div className="flex items-center gap-6">
                     <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center text-5xl shadow-sm group-hover:scale-110 transition-transform">
                       🧢
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-slate-900 mb-1">Avatar Shop</h3>
                        <p className="text-slate-500 font-medium">New items available!</p>
                     </div>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
                     <ChevronRight className="w-6 h-6" />
                  </div>
               </div>
           </Link>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
           <Card className="p-6 bg-gradient-to-br from-orange-50 to-white border-orange-100 shadow-md">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-black text-orange-900 text-lg flex items-center gap-2">
                   <Zap className="w-5 h-5 fill-current" /> Daily Streak
                 </h3>
                 <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-orange-600 shadow-sm border border-orange-100">7 Days</span>
              </div>
              
              <div className="flex justify-between gap-1 mb-4">
                 {['M','T','W','T','F','S','S'].map((d, i) => (
                   <div key={i} className="flex flex-col items-center gap-2">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i < 5 ? 'bg-orange-500 text-white shadow-md scale-110' : 'bg-orange-100 text-orange-300'}`}>
                        {i < 5 ? '✓' : ''}
                      </div>
                      <span className="text-[10px] font-bold text-orange-400">{d}</span>
                   </div>
                 ))}
              </div>
              <p className="text-center text-xs font-bold text-orange-800/60 bg-orange-100/50 py-2 rounded-xl">
                 🔥 Keep it up! 3 days to a big bonus.
              </p>
           </Card>

           <Card className="p-6 border-slate-200">
              <div className="flex items-center justify-between mb-4">
                 <h3 className="font-black text-slate-900">Recent Badges</h3>
                 <Link href="/app/collection" className="text-xs font-bold text-indigo-600 hover:underline">View All</Link>
              </div>
              <div className="grid grid-cols-3 gap-3">
                 {[1,2,3,4,5,6].map((i) => (
                   <div key={i} className={`aspect-square rounded-2xl border flex items-center justify-center text-2xl ${i <= 3 ? 'bg-white border-slate-100 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-50'}`}>
                      {i <= 3 ? '🏅' : <Lock className="w-5 h-5 text-slate-300" />}
                   </div>
                 ))}
              </div>
           </Card>
        </div>

      </div>
    </PageMotion>
  );
}