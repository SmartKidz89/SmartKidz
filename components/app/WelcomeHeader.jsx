"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useEconomy } from "@/lib/economy/client";
import { useFocusMode } from "@/components/ui/FocusModeProvider";
import AvatarBadge from "./AvatarBadge";
import { 
  Settings, Eye, EyeOff, ChevronDown, CheckCircle2, Home 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getGradeLabel, getGeoConfig } from "@/lib/marketing/geoConfig";

export default function WelcomeHeader() {
  const { activeChild, kids, setActiveChild, loading: childLoading } = useActiveChild();
  const economy = useEconomy(activeChild?.id);
  const { focus, toggle: toggleFocus } = useFocusMode();
  const { scrollY } = useScroll();
  
  const [switcherOpen, setSwitcherOpen] = useState(false);

  const headerBg = useTransform(scrollY, [0, 20], ["rgba(255,255,255,0.0)", "rgba(255,255,255,0.9)"]);
  const headerBorder = useTransform(scrollY, [0, 20], ["rgba(0,0,0,0)", "rgba(0,0,0,0.06)"]);
  const headerBackdrop = useTransform(scrollY, [0, 20], ["blur(0px)", "blur(12px)"]);

  const displayName = activeChild?.display_name || "Explorer";
  const geo = getGeoConfig(activeChild?.country || "AU");
  
  const displayYear = childLoading 
    ? "..." 
    : getGradeLabel(activeChild?.year_level, activeChild?.country || "AU");

  const handleSwitch = (kidId) => {
    setActiveChild(kidId);
    setSwitcherOpen(false);
  };

  return (
    <>
      <motion.header
        style={{ 
          backgroundColor: headerBg, 
          backdropFilter: headerBackdrop,
          borderBottomWidth: 1,
          borderBottomColor: headerBorder
        }}
        className="sticky top-0 z-40 transition-all duration-300"
      >
        <div className="container-pad h-16 sm:h-20 flex items-center justify-between px-4 sm:px-6">
          
          {/* LEFT: Child Switcher */}
          <div className="relative z-50 flex items-center gap-3">
             <Link
               href="/app"
               className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 shadow-sm transition-all"
               title="Go Home"
             >
               <Home className="w-5 h-5" />
             </Link>

             <div className="h-6 w-px bg-slate-300/30 mx-1 hidden sm:block" />

             <button 
               onClick={() => setSwitcherOpen(!switcherOpen)}
               className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-white/60 border border-slate-200/60 transition-all hover:bg-white hover:shadow-md cursor-pointer group active:scale-95"
             >
               <AvatarBadge config={activeChild?.avatar_config} size={40} className="shadow-sm" />
               <div className="flex flex-col text-left">
                 {childLoading ? (
                   <>
                     <div className="h-2 w-10 bg-slate-200 rounded animate-pulse mb-1" />
                     <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                   </>
                 ) : (
                   <>
                     <div className="flex items-center gap-1.5">
                       <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 leading-none">
                         {displayYear}
                       </span>
                       {geo.code !== "INT" && <span className="text-[10px] opacity-50">{geo.flag}</span>}
                     </div>
                     <span className="text-sm font-black text-slate-900 leading-none truncate max-w-[100px] mt-0.5">
                       {displayName}
                     </span>
                   </>
                 )}
               </div>
               <div className={cn("w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center transition-transform ml-1", switcherOpen ? "rotate-180" : "")}>
                 <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
               </div>
             </button>

             {/* Dropdown Menu */}
             <AnimatePresence>
               {switcherOpen && (
                 <>
                   <div className="fixed inset-0 z-40" onClick={() => setSwitcherOpen(false)} />
                   <motion.div
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     transition={{ duration: 0.2 }}
                     className="absolute top-full left-12 mt-2 w-64 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden z-50 p-2"
                   >
                     <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-3 py-2">Switch Profile</div>
                     
                     <div className="space-y-1 max-h-60 overflow-y-auto">
                       {(kids || []).map((kid) => {
                         const isActive = kid.id === activeChild?.id;
                         return (
                           <button
                             key={kid.id}
                             onClick={() => handleSwitch(kid.id)}
                             className={cn(
                               "w-full flex items-center gap-3 p-2 rounded-2xl transition-colors text-left",
                               isActive ? "bg-indigo-50 border border-indigo-100" : "hover:bg-slate-50 border border-transparent"
                             )}
                           >
                             <AvatarBadge config={kid.avatar_config} size={32} />
                             <div className="flex-1">
                               <div className={cn("text-sm font-bold", isActive ? "text-indigo-900" : "text-slate-700")}>
                                 {kid.display_name}
                               </div>
                               <div className="text-[10px] text-slate-400 font-semibold uppercase">
                                 {getGradeLabel(kid.year_level, kid.country)}
                               </div>
                             </div>
                             {isActive && <CheckCircle2 className="w-4 h-4 text-indigo-500" />}
                           </button>
                         );
                       })}
                     </div>
                     
                     <div className="h-px bg-slate-100 my-2" />
                     
                     <Link
                       href="/app/children"
                       onClick={() => setSwitcherOpen(false)}
                       className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 font-bold text-sm"
                     >
                       <Settings className="w-4 h-4" /> Manage Profiles
                     </Link>
                   </motion.div>
                 </>
               )}
             </AnimatePresence>
          </div>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Economy Pill */}
            <Link href="/app/rewards">
              <div className="flex items-center gap-3 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/10 hover:scale-105 transition-transform cursor-pointer border border-slate-700/50">
                 <div className="flex items-center gap-1.5">
                    <span className="text-base">🪙</span>
                    <span className="text-sm font-bold">{economy?.coins || 0}</span>
                 </div>
                 <div className="w-px h-3 bg-white/20 hidden sm:block" />
                 <div className="hidden sm:flex items-center gap-1.5">
                    <span className="text-base">⭐</span>
                    <span className="text-sm font-bold">Lvl {economy?.level || 1}</span>
                 </div>
              </div>
            </Link>

            {/* Parent Link (Desktop only) */}
            <Link
              href="/app/parent"
              className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all hover:shadow-md"
              title="Parent Dashboard"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* Focus Toggle */}
            <button
              onClick={toggleFocus}
              className={cn(
                "hidden sm:flex h-10 w-10 items-center justify-center rounded-full border transition-all",
                focus 
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600 shadow-inner" 
                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-900 hover:shadow-md"
              )}
              title="Focus Mode"
            >
              {focus ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>
    </>
  );
}