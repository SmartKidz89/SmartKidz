"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { useEconomy } from "@/lib/economy/client";
import { useFocusMode } from "@/components/ui/FocusModeProvider";
import AvatarPicker from "./AvatarPicker";
import { 
  LayoutGrid, Map, Trophy, Settings, LogOut, 
  Sparkles, Eye, EyeOff, Menu, X 
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/app", label: "Home", icon: LayoutGrid },
  { href: "/app/worlds", label: "Worlds", icon: Map },
  { href: "/app/tools", label: "Tools", icon: Sparkles },
  { href: "/app/rewards", label: "Rewards", icon: Trophy },
];

export default function WelcomeHeader({ showParentBack = false }) {
  const { activeChild } = useActiveChild();
  const economy = useEconomy(activeChild?.id);
  const { focus, toggle: toggleFocus } = useFocusMode();
  const { scrollY } = useScroll();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  const headerShadow = useTransform(scrollY, [0, 20], ["none", "0 4px 20px rgba(0,0,0,0.05)"]);
  const headerBg = useTransform(scrollY, [0, 20], ["rgba(255,255,255,0)", "rgba(255,255,255,0.9)"]);
  const headerBackdrop = useTransform(scrollY, [0, 20], ["blur(0px)", "blur(12px)"]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/app/login";
  };

  return (
    <>
      <motion.header
        style={{ 
          boxShadow: headerShadow, 
          backgroundColor: headerBg, 
          backdropFilter: headerBackdrop 
        }}
        className="sticky top-0 z-40 transition-all duration-200 border-b border-transparent data-[scrolled=true]:border-slate-100"
      >
        <div className="container-pad h-20 flex items-center justify-between px-4 sm:px-6">
          
          {/* Left: Profile / Identity */}
          <div className="flex items-center gap-4">
            <AvatarPicker size="md" />
            <div className="hidden sm:block">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Student
              </div>
              <div className="text-base font-black text-slate-900 leading-none">
                {activeChild?.display_name || "Explorer"}
              </div>
            </div>

            {/* Economy Pill (Mobile Compact) */}
            <div className="flex sm:hidden items-center gap-2 bg-slate-100 rounded-full px-3 py-1.5 ml-2">
               <span className="text-sm">🪙</span>
               <span className="text-xs font-bold text-slate-700">{economy?.coins || 0}</span>
            </div>
          </div>

          {/* Center: Navigation (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/app" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all",
                    isActive 
                      ? "bg-white text-slate-900 shadow-sm" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-white/50"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive ? "text-brand-primary" : "text-slate-400")} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Economy (Desktop) */}
            <div className="hidden sm:flex items-center gap-3 mr-2 bg-white border border-slate-100 rounded-full px-4 py-2 shadow-sm">
               <div className="flex items-center gap-1.5">
                  <span className="text-lg">🪙</span>
                  <span className="text-sm font-bold text-slate-700">{economy?.coins || 0}</span>
               </div>
               <div className="w-px h-4 bg-slate-200" />
               <div className="flex items-center gap-1.5">
                  <span className="text-lg">⭐</span>
                  <span className="text-sm font-bold text-slate-700">Lvl {economy?.level || 1}</span>
               </div>
            </div>

            {/* Focus Toggle */}
            <button
              onClick={toggleFocus}
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-all border",
                focus 
                  ? "bg-indigo-100 text-indigo-600 border-indigo-200" 
                  : "bg-white text-slate-400 border-slate-200 hover:border-slate-300 hover:text-slate-600"
              )}
              title={focus ? "Exit Focus" : "Enter Focus"}
            >
              {focus ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Parent Mode Link */}
            <Link
              href="/app/parent"
              className="hidden sm:flex h-10 w-10 rounded-xl bg-slate-900 text-white items-center justify-center hover:bg-slate-800 transition-colors shadow-md"
              title="Parent Dashboard"
            >
              <Settings className="w-5 h-5" />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-600"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-white/95 backdrop-blur-xl pt-24 px-6 animate-in fade-in slide-in-from-top-10">
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