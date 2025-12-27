"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useEconomy } from "@/lib/economy/client";
import { AVATARS } from "@/lib/avatars";
import { playUISound, haptic } from "@/components/ui/sound";
import { Check, Lock, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function AvatarPage() {
  const router = useRouter();
  const { activeChild, updateActiveChild } = useActiveChild();
  const economy = useEconomy(activeChild?.id);
  
  const currentKey = activeChild?.avatar_key || "robot";
  const [saving, setSaving] = useState(false);

  // Simple unlock logic: 
  // First 10 free, next 10 cost 100 coins, last 10 cost 500 coins or Level 5
  // For MVP, all free or basic level gating logic could go here.
  // We'll keep it simple: all unlocked for now to let kids have fun immediately.

  async function selectAvatar(key) {
    if (saving || key === currentKey) return;
    
    try {
      playUISound("tap");
      haptic("light");
      setSaving(true);
      
      await updateActiveChild({ avatar_key: key });
      
      playUISound("success");
      haptic("success");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PageMotion className="max-w-5xl mx-auto pb-24">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 px-4 md:px-0">
         <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={() => router.back()}
              className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
            >
               <ChevronLeft className="w-6 h-6" />
            </button>
            <div>
               <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pick Your Hero</h1>
               <p className="text-slate-600 font-medium">Who do you want to be today?</p>
            </div>
         </div>

         {/* Stats */}
         <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-full border border-slate-200 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-amber-400 flex items-center justify-center text-xl shadow-inner">
               🪙
            </div>
            <div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance</div>
               <div className="text-lg font-black text-slate-900 leading-none">{economy?.coins || 0}</div>
            </div>
         </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 px-2 md:px-0">
         {AVATARS.map((a, i) => {
            const isSelected = currentKey === a.key;
            
            return (
               <motion.button
                 key={a.key}
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 transition={{ delay: i * 0.02 }}
                 onClick={() => selectAvatar(a.key)}
                 className={`group relative aspect-[3/4] rounded-[2rem] flex flex-col items-center justify-center gap-2 border-2 transition-all duration-300 ${
                   isSelected 
                     ? "bg-slate-900 border-slate-900 scale-105 shadow-xl z-10" 
                     : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1"
                 }`}
               >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center text-5xl shadow-sm transition-transform group-hover:scale-110 ${a.bg || "bg-slate-50"}`}>
                     {a.emoji}
                  </div>
                  
                  <div className={`text-sm font-bold ${isSelected ? "text-white" : "text-slate-600 group-hover:text-slate-900"}`}>
                     {a.name}
                  </div>

                  {isSelected && (
                     <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-emerald-500 border-4 border-slate-100 flex items-center justify-center text-white shadow-md">
                        <Check className="w-4 h-4 stroke-[4]" />
                     </div>
                  )}
               </motion.button>
            );
         })}
      </div>

    </PageMotion>
  );
}