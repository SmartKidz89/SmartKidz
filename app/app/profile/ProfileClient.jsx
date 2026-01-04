"use client";

import { useActiveChild } from "@/hooks/useActiveChild";
import { useEconomy } from "@/lib/economy/client";
import { PageMotion } from "@/components/ui/PremiumMotion";
import ChildAvatar from "@/components/avatar/ChildAvatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { 
  Trophy, Star, Clock, Target, 
  Edit, Settings, LogOut 
} from "lucide-react";
import Link from "next/link";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { createClient } from "@/lib/supabase/client";

export default function ProfileClient() {
  const { activeChild } = useActiveChild();
  const economy = useEconomy(activeChild?.id);
  const { user } = useSupabaseUser();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  if (!activeChild) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <PageMotion className="max-w-4xl mx-auto pb-24 space-y-8">
      
      {/* Identity Card */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-slate-200 shadow-xl p-8">
         <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-400 to-fuchsia-400" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-end gap-6 mt-12">
            <div className="relative">
               <div className="p-1.5 bg-white rounded-full">
                  <ChildAvatar config={activeChild.avatar_config} size={120} className="border-4 border-slate-50" />
               </div>
               <Link href="/app/avatar">
                  <button className="absolute bottom-2 right-2 p-2 bg-slate-900 text-white rounded-xl shadow-lg hover:scale-105 transition-transform">
                     <Edit className="w-4 h-4" />
                  </button>
               </Link>
            </div>
            
            <div className="flex-1 pb-2">
               <h1 className="text-3xl font-black text-slate-900">{activeChild.display_name}</h1>
               <div className="text-slate-500 font-bold">Year {activeChild.year_level} • Explorer</div>
            </div>

            <div className="flex gap-3 pb-2">
               <div className="flex flex-col items-center bg-amber-50 p-3 rounded-2xl border border-amber-100 min-w-[80px]">
                  <span className="text-2xl">🪙</span>
                  <span className="font-black text-amber-600">{economy?.coins || 0}</span>
                  <span className="text-[10px] font-bold text-amber-400 uppercase">Coins</span>
               </div>
               <div className="flex flex-col items-center bg-indigo-50 p-3 rounded-2xl border border-indigo-100 min-w-[80px]">
                  <span className="text-2xl">⭐</span>
                  <span className="font-black text-indigo-600">{economy?.level || 1}</span>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase">Level</span>
               </div>
            </div>
         </div>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 gap-6">
         <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Trophy className="w-5 h-5 text-amber-500" /> Achievements
            </h3>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">🔥</div>
                     <div>
                        <div className="font-bold text-slate-900">Day Streak</div>
                        <div className="text-xs text-slate-500">Consistency is key!</div>
                     </div>
                  </div>
                  <div className="text-xl font-black text-slate-900">3</div>
               </div>

               <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl shadow-sm">🎯</div>
                     <div>
                        <div className="font-bold text-slate-900">Accuracy</div>
                        <div className="text-xs text-slate-500">Average score</div>
                     </div>
                  </div>
                  <div className="text-xl font-black text-slate-900">92%</div>
               </div>
            </div>
            
            <Link href="/app/collection">
               <Button variant="secondary" className="w-full mt-6">View Sticker Book</Button>
            </Link>
         </Card>

         <Card className="p-6">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Settings className="w-5 h-5 text-slate-400" /> Account
            </h3>
            
            <div className="space-y-3">
               <div className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Parent Account</div>
                  <div className="font-medium text-slate-700">{user?.email}</div>
               </div>

               <Link href="/app/settings">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group">
                     <span className="font-bold text-slate-700">App Settings</span>
                     <Settings className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                  </div>
               </Link>

               <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 p-4 rounded-2xl border border-rose-100 text-rose-600 font-bold hover:bg-rose-50 transition-colors"
               >
                  <LogOut className="w-4 h-4" /> Log Out
               </button>
            </div>
         </Card>
      </div>

    </PageMotion>
  );
}