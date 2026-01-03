"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/Button";
import { getSupabaseClient } from "../../lib/supabaseClient";
import { getTodaySession, progressCount, isComplete } from "../../lib/today/session";
import { Play, CheckCircle2, Star, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function TodayModule() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [session, setSession] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: sess } = await supabase.auth.getSession();
        const uid = sess?.session?.user?.id || "anon";
        const s = getTodaySession(uid);
        if (!mounted) return;
        setSession(s);
      } catch {
        if (!mounted) return;
        setSession(getTodaySession("anon"));
      }
    })();
    return () => { mounted = false; };
  }, [supabase]);

  const done = progressCount(session);
  const complete = isComplete(session);
  const percent = Math.round((done / 3) * 100);

  return (
    <div className="relative overflow-hidden p-8 sm:p-10 h-full flex flex-col justify-between min-h-[340px]">
      
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600" />
      <div className="absolute inset-0 bg-[url('/textures/noise.png')] opacity-20 mix-blend-overlay" />
      
      {/* Animated Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[80px] -mr-20 -mt-20 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-400/20 rounded-full blur-[80px] -ml-20 -mb-20" />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-bold text-white uppercase tracking-wider mb-4 border border-white/20 shadow-sm">
              <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" /> Daily Mission
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-2 drop-shadow-sm">
              {complete ? "All Missions Complete!" : "Today's Adventure"}
            </h2>
            <p className="text-indigo-100 font-medium text-lg max-w-md leading-relaxed">
              {complete 
                ? "You did it! Come back tomorrow for a fresh start." 
                : "Complete 3 quick missions to boost your brain and earn rewards."}
            </p>
          </div>
          
          {/* Progress Circle */}
          <div className="relative w-20 h-20 shrink-0 hidden sm:flex items-center justify-center">
             <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
               <path className="text-white/20" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
               <motion.path 
                 className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                 initial={{ pathLength: 0 }}
                 animate={{ pathLength: percent / 100 }}
                 transition={{ duration: 1, ease: "easeOut" }}
                 d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                 fill="none" 
                 stroke="currentColor" 
                 strokeWidth="4" 
                 strokeDasharray="100, 100"
               />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center font-black text-white text-lg">
                {done}/3
             </div>
          </div>
        </div>
      </div>

      {/* Mission Steps */}
      <div className="relative z-10 grid grid-cols-3 gap-3 mt-8">
        {[
          { label: "Reading", done: session?.missions?.reading?.done },
          { label: "Writing", done: session?.missions?.writing?.done },
          { label: "Maths", done: session?.missions?.maths?.done }
        ].map((m, i) => (
          <div 
            key={i}
            className={cn(
              "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-300",
              m.done 
                ? "bg-emerald-500/20 border-emerald-400/50 text-white" 
                : "bg-white/10 border-white/10 text-indigo-100"
            )}
          >
            {m.done ? (
               <CheckCircle2 className="w-6 h-6 mb-1 text-emerald-300" />
            ) : (
               <div className="w-6 h-6 rounded-full border-2 border-white/30 mb-1" />
            )}
            <span className="text-xs font-bold uppercase tracking-wide">{m.label}</span>
          </div>
        ))}
      </div>

      {/* Footer Action */}
      <div className="relative z-10 mt-8 flex sm:hidden">
         {complete ? (
           <Button href="/app/worlds" className="w-full bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl font-black text-lg h-14 border-none">
             Explore Worlds
           </Button>
         ) : (
           <Button href="/app/today" className="w-full bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl font-black text-lg h-14 border-none group">
             <Play className="w-5 h-5 mr-2 fill-current group-hover:scale-110 transition-transform" /> Start Mission
           </Button>
         )}
      </div>
      
      <div className="relative z-10 mt-auto hidden sm:flex items-center gap-4">
         {complete ? (
           <Button href="/app/worlds" className="px-8 bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl font-black text-lg h-14 border-none rounded-full">
             <Trophy className="w-5 h-5 mr-2" /> Explore Worlds
           </Button>
         ) : (
           <Button href="/app/today" className="px-10 bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl font-black text-lg h-14 border-none rounded-full group">
             <Play className="w-5 h-5 mr-2 fill-current group-hover:scale-110 transition-transform" /> Start Mission
           </Button>
         )}
         {!complete && (
           <span className="text-white/80 font-bold text-sm">~15 mins</span>
         )}
      </div>

    </div>
  );
}