"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useEconomy } from "@/lib/economy/client";
import { useFocusMode } from "@/components/ui/FocusModeProvider";
import AvatarBadge from "./AvatarBadge"; 
import { 
  LayoutGrid, Map, Trophy, Settings, LogOut, 
  Sparkles, Eye, EyeOff, Menu, X, ChevronDown
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { getGradeLabel } from "@/lib/marketing/geoConfig";

const NAV_ITEMS = [
  { href: "/app", label: "Dashboard", icon: LayoutGrid },
  { href: "/app/worlds", label: "Worlds", icon: Map },
  { href: "/app/tools", label: "Tools", icon: Sparkles },
  { href: "/app/rewards", label: "Rewards", icon: Trophy },
];

export default function WelcomeHeader() {
  const { activeChild, loading: childLoading } = useActiveChild();
  const economy = useEconomy(activeChild?.id);
  const { focus, toggle: toggleFocus } = useFocusMode();
  const { scrollY } = useScroll();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  const headerBg = useTransform(scrollY, [0, 20], ["rgba(255,255,255,0.0)", "rgba(255,255,255,0.85)"]);
  const headerBorder = useTransform(scrollY, [0, 20], ["rgba(0,0,0,0)", "rgba(0,0,0,0.06)"]);
  const headerBackdrop = useTransform(scrollY, [0, 20], ["blur(0px)", "blur(12px)"]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/app/login";
  };

  const displayName = activeChild?.display_name || "Explorer";
  const displayYear = childLoading 
    ? "Loading..." 
    : getGradeLabel(activeChild?.year_level, activeChild?.country || "AU");

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
          
          {/* LEFT: Branding & Profile */}
          <div className="flex items-center gap-4">
             <Link href="/app/parent" className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-white/50 border border-slate-200/60 transition-all hover:bg-white hover:shadow-md cursor-pointer group">
               <AvatarBadge config={activeChild?.avatar_config} size={40} className="shadow-sm group-hover:scale-105 transition-transform" />
               <div className="flex flex-col">
                 {childLoading ? (
                   <>
                     <div className="h-2 w-10 bg-slate-200 rounded animate-pulse mb-1" />
                     <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                   </>
                 ) : (
                   <>
                     <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 leading-none mb-0.5">
                       {displayYear}
                     </span>
                     <span className="text-sm font-black text-slate-900 leading-none truncate max-w-[100px]">
                       {displayName}
                     </span>
                   </>
                 )}
               </div>
               <ChevronDown className="w-4 h-4 text-slate-400 ml-1 group-hover:text-slate-600" />
             </Link>
          </div>

          {/* CENTER: Navigation Pills */}
          <nav className="hidden md:flex items-center p-1 rounded-full bg-slate-100/80 border border-slate-200/60 shadow-inner">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/app" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-300",
                    isActive 
                      ? "bg-white text-slate-900 shadow-sm ring-1 ring-black/5" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-brand-primary" : "text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* RIGHT: Actions */}
          <div className="flex items-center gap-3">
            {/* Economy Pill */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/10">
               <div className="flex items-center gap-1.5">
                  <span className="text-base">🪙</span>
                  <span className="text-sm font-bold">{economy?.coins || 0}</span>
               </div>
               <div className="w-px h-3 bg-white/20" />
               <div className="flex items-center gap-1.5">
                  <span className="text-base">⭐</span>
                  <span className="text-sm font-bold">Lvl {economy?.level || 1}</span>
               </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1" />

            {/* Parent Button */}
            <Link
              href="/app/parent"
              className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all"
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
                  ? "bg-indigo-50 border-indigo-200 text-indigo-600" 
                  : "bg-white border-slate-200 text-slate-400 hover:text-slate-900"
              )}
              title="Focus Mode"
            >
              {focus ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-white/95 backdrop-blur-xl pt-24 px-6 animate-in fade-in slide-in-from-top-5">
          <nav className="grid gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-2xl text-lg font-bold transition-colors",
                  pathname === item.href 
                    ? "bg-slate-100 text-slate-900" 
                    : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <item.icon className="w-6 h-6" />
                {item.label}
              </Link>
            ))}
            
            <div className="h-px bg-slate-100 my-4" />
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
               <div className="flex items-center gap-2">
                 <span className="text-xl">🪙</span>
                 <span className="font-black text-slate-900">{economy?.coins || 0}</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-xl">⭐</span>
                 <span className="font-black text-slate-900">Lvl {economy?.level || 1}</span>
               </div>
            </div>

            <Link
              href="/app/parent"
              className="flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-slate-600 hover:bg-slate-50"
            >
              <Settings className="w-6 h-6" /> Parent Settings
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-4 p-4 rounded-2xl text-lg font-bold text-rose-500 hover:bg-rose-50 w-full text-left"
            >
              <LogOut className="w-6 h-6" /> Log Out
            </button>
          </nav>
        </div>
      )}
    </>
  );
}