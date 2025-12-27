"use client";

import { useState } from "react";
import { useFocusMode } from "@/components/ui/FocusModeProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import WelcomeHeader from "./WelcomeHeader";
import ParentTopBar from "./ParentTopBar";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/useSound";
import RouteBackdrop from "@/components/ui/RouteBackdrop";
import { 
  Home, Map, Trophy, UserCircle, Grid2X2, X, 
  BookOpen, Palette, Globe2, Compass, PenTool, 
  Sparkles, Clock, LogOut, Settings
} from "lucide-react";
import { useActiveChild } from "@/hooks/useActiveChild";

const HIDE_SHELL_PATHS = ["/app/login","/app/signup","/app/auth","/login","/signup","/auth"];

// Main Navigation Items
const NAV_ITEMS = [
  { label: "Home", href: "/app", icon: Home, exact: true },
  { label: "Worlds", href: "/app/worlds", icon: Map },
  { label: "Explore", isTrigger: true, icon: Grid2X2 }, // Center Button
  { label: "Rewards", href: "/app/rewards", icon: Trophy },
  { label: "Me", href: "/app/pet", icon: UserCircle },
];

// Tools for the "Explore" Menu
const EXPLORE_TOOLS = [
  { href: "/app/tools/pixel-art", title: "Pixel Studio", icon: Palette, color: "bg-pink-100 text-pink-600" },
  { href: "/app/tools/world-explorer", title: "World Map", icon: Globe2, color: "bg-sky-100 text-sky-600" },
  { href: "/app/tools/dictionary", title: "Dictionary", icon: BookOpen, color: "bg-emerald-100 text-emerald-600" },
  { href: "/app/tools/storybook", title: "Storybook", icon: PenTool, color: "bg-violet-100 text-violet-600" },
  { href: "/app/tools/curiosity", title: "Curiosity", icon: Compass, color: "bg-rose-100 text-rose-600" },
  { href: "/app/tools/timeline", title: "Timeline", icon: Clock, color: "bg-amber-100 text-amber-600" },
];

function ExploreMenu({ open, onClose }) {
  const { play } = useSound();
  
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2.5rem] shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
          >
             <div className="p-6 pb-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                   <h2 className="text-2xl font-black text-slate-900">Explore Tools</h2>
                   <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                      <X className="w-6 h-6" />
                   </button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
                   {EXPLORE_TOOLS.map((t) => (
                     <Link key={t.href} href={t.href} onClick={() => { play("click"); onClose(); }}>
                        <div className="flex flex-col items-center gap-3 p-4 rounded-3xl bg-slate-50 border-2 border-transparent hover:border-slate-200 hover:bg-white hover:shadow-lg transition-all active:scale-95">
                           <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm", t.color)}>
                              <t.icon className="w-7 h-7" />
                           </div>
                           <span className="font-bold text-slate-700 text-sm">{t.title}</span>
                        </div>
                     </Link>
                   ))}
                </div>

                <div className="bg-indigo-50 rounded-3xl p-5 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                         <Settings className="w-6 h-6" />
                      </div>
                      <div>
                         <div className="font-bold text-slate-900">Parent Dashboard</div>
                         <div className="text-xs text-slate-500 font-semibold">Settings & Reports</div>
                      </div>
                   </div>
                   <Link href="/app/parent" onClick={onClose} className="px-5 py-2 bg-white rounded-xl text-sm font-bold text-indigo-600 shadow-sm">
                      Open
                   </Link>
                </div>
             </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function BottomNav({ onOpenMenu }) {
  const pathname = usePathname();
  const hideShell = !!pathname && HIDE_SHELL_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const { play } = useSound();
  
  if (hideShell) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto flex items-center gap-1 p-2 bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-slate-900/20 rounded-[2.5rem] ring-1 ring-white/10 max-w-md w-full justify-between">
          {NAV_ITEMS.map((t) => {
            const isActive = t.exact ? pathname === t.href : (pathname?.startsWith(t.href));
            const Icon = t.icon;
            
            if (t.isTrigger) {
              return (
                <button
                  key="trigger"
                  onClick={() => { play("click"); onOpenMenu(); }}
                  className="relative group -mt-8"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-b from-brand-primary to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 border-[4px] border-white transform transition-transform group-hover:scale-110 group-active:scale-95">
                     <Grid2X2 className="w-7 h-7 text-white" />
                  </div>
                </button>
              );
            }
            
            return (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => play("click")}
                className={cn(
                  "relative flex flex-col items-center justify-center w-14 h-14 rounded-[1.5rem] transition-all duration-300",
                  isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                )}
              >
                 <Icon className={cn("w-6 h-6 transition-all", isActive && "scale-110")} strokeWidth={isActive ? 3 : 2.5} />
                 
                 {isActive && (
                   <motion.div 
                     layoutId="nav-glow"
                     className="absolute inset-0 bg-white/10 rounded-[1.5rem]"
                     transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                   />
                 )}
              </Link>
            );
          })}
      </nav>
    </div>
  );
}

export default function AppShell({ children }) {
  const { focus } = useFocusMode();
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);

  const isLoginLike =
    pathname === "/app/login" ||
    pathname === "/app/signup" ||
    pathname === "/app/redeem" ||
    pathname?.startsWith("/app/auth") ||
    pathname?.startsWith("/app/onboarding");

  const inParent = pathname === "/app/parent" || pathname?.startsWith("/app/parent/");
  const inKid = !isLoginLike && !inParent;

  if (isLoginLike) {
    return <div className="app-ui min-h-screen">{children}</div>;
  }

  return (
    <div className="app-ui min-h-screen pb-32 selection:bg-brand-primary/30">
      <RouteBackdrop />
      {inKid ? <WelcomeHeader /> : <ParentTopBar />}

      <main className="container-pad pt-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="min-h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {!inParent && !focus && (
        <>
          <BottomNav onOpenMenu={() => setMenuOpen(true)} />
          <ExploreMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </>
      )}
    </div>
  );
}