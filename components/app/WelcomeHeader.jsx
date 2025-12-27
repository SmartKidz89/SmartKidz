"use client";

import Link from "next/link";
import YearSelector from "./YearSelector";
import AvatarPicker from "./AvatarPicker";
import { useActiveChild } from "@/hooks/useActiveChild";
import { motion, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Mascot from "@/components/ui/Mascot";
import EconomyPill from "@/components/ui/EconomyPill";
import { LogOut, Menu } from "lucide-react";

export default function WelcomeHeader({ showParentBack = false }) {
  const { activeChild } = useActiveChild();
  const reduceMotion = useReducedMotion();

  const name = activeChild?.display_name || "Player";
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase?.auth.signOut();
    window.location.href = "/app/login";
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: -10 }}
      animate={reduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 rounded-4xl bg-white/60 border border-white/60 shadow-sm backdrop-blur-md mb-6"
    >
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <Mascot className="hidden sm:block shrink-0" />
        <div className="relative">
          <AvatarPicker size="lg" />
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-white shadow-sm" />
        </div>
        
        <div className="min-w-0">
          <div className="text-[10px] sm:text-xs font-black tracking-wider text-slate-400 uppercase mb-0.5">
            Welcome back
          </div>
          <div className="text-lg sm:text-xl font-black text-slate-900 truncate max-w-[140px] sm:max-w-none">
            {name}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        <div className="shrink-0">
          <EconomyPill />
        </div>
        
        <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1" />

        <div className="flex items-center gap-2">
          {showParentBack && (
            <Link 
              href="/app/parent" 
              className="skz-btn-soft px-3 py-2 text-xs font-bold bg-white/50 hover:bg-white whitespace-nowrap"
            >
              Parents
            </Link>
          )}
          
          <YearSelector className="shrink-0" />
          
          <Link 
            href="/app/menu" 
            className="h-10 w-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 hover:shadow-sm hover:-translate-y-0.5 transition-all"
            title="Menu"
          >
            <Menu className="w-5 h-5" />
          </Link>
          
          <button 
            onClick={handleLogout} 
            className="h-10 w-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-100 transition-all"
            title="Log out"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}