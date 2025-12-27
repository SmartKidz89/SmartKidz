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
  Sparkles, Clock, Settings
} from "lucide-react";

const HIDE_SHELL_PATHS = ["/app/login","/app/signup","/app/auth","/login","/signup","/auth"];

// Main Navigation Items
const NAV_ITEMS = [
  { label: "Home", href: "/app", icon: Home, exact: true },
  { label: "Worlds", href: "/app/worlds", icon: Map },
  { label: "Explore", isTrigger: true, icon: Grid2X2 }, // Center Button
  { label: "Rewards", href: "/app/rewards", icon: Trophy },
  { label: "Me", href: "/app/pet", icon: UserCircle },
];

// Tools for the "Explore" Menu - With improved gradients
const EXPLORE_TOOLS = [
  { href: "/app/tools/pixel-art", title: "Pixel Studio", icon: Palette, bg: "bg-gradient-to-br from-pink-400 to-rose-500 text-white", shadow: "shadow-rose-200" },
  { href: "/app/tools/world-explorer", title: "World Map", icon: Globe2, bg: "bg-gradient-to-br from-sky-400 to-blue-500 text-white", shadow: "shadow-sky-200" },
  { href: "/app/tools/dictionary", title: "Dictionary", icon: BookOpen, bg: "bg-gradient-to-br from-emerald-400 to-teal-500 text-white", shadow: "shadow-emerald-200" },
  { href: "/app/tools/storybook", title: "Storybook", icon: PenTool, bg: "bg-gradient-to-br from-violet-400 to-purple-500 text-white", shadow: "shadow-violet-200" },
  { href: "/app/tools/curiosity", title: "Curiosity", icon: Compass, bg: "bg-gradient-to-br from-amber-400 to-orange-500 text-white", shadow: "shadow-amber-200" },
  { href: "/app/tools/timeline", title: "Timeline", icon: Clock, bg: "bg-gradient-to-br from-indigo-400 to-blue-500 text-white", shadow: "shadow-indigo-200" },
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col max-h-[85vh]"
          >
             {/* Header */}
             <div className="p-6 pb-2 shrink-0">
                <div className="flex items-center justify-between">
                   <div>
                     <h2 className="text-2xl font-black text-slate-900">Explore Tools</h2>
                     <p className="text-slate-500 font-medium text-sm">Discover new ways to learn.</p>
                   </div>
                   <button onClick={onClose} className="p-3 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                      <X className="w-6 h-6" />
                   </button>
                </div>
             </div>
             
             {/* Scrollable Content */}
             <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-8">
                
                {/* Tools Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                   {EXPLORE_TOOLS.map((t) => (
                     <Link key={t.href} href={t.href} onClick={() => { play("click"); onClose(); }}>
                        <div className="group flex flex-col items-center gap-3 p-5 rounded-[2rem] bg-slate-50 border-2 border-transparent hover:border-indigo-100 hover:bg-white hover:shadow-xl transition-all active:scale-95">
                           <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg transition-transform group-hover:scale-110", t.bg, t.shadow)}>
                              <t.icon className="w-8 h-8" />
                           </div>
                           <span className="font-extrabold text-slate-700 text-sm group-hover:text-indigo-600">{t.title}</span>
                        </div>
                     </Link>
                   ))}
                </div>

                {/* Parent Section */}
                <div className="bg-slate-900 rounded-[2rem] p-6 flex items-center justify-between shadow-xl text-white">
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                         <Settings className="w-6 h-6" />
                      </div>
                      <div>
                         <div className="font-bold text-lg">Parents</div>
                         <div className="text-xs text-slate-400 font-medium">Settings, Safety & Reports</div>
                      </div>
                   </div>
                   <Link href="/app/parent" onClick={onClose} className="px-6 py-3 bg-white rounded-full text-sm font-black text-slate-900 hover:bg-indigo-50 transition-colors">
                      Open
                   </Link>
                </div>
                
                {/* Spacer for bottom safe area */}
                <div className="h-6" />
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
      <nav className="pointer-events-auto flex items-center gap-1 p-2 bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-slate-900/30 rounded-[2.5rem] ring-1 ring-white/10 max-w-md w-full justify-between">
          {NAV_ITEMS.map((t) => {
            const isActive = t.exact ? pathname === t.href : (pathname?.startsWith(t.href));
            const Icon = t.icon;
            
            if (t.isTrigger) {
              return (
                <button
                  key="trigger"
                  onClick={() => { play("click"); onOpenMenu(); }}
                  className="relative group -mt-8 mx-2"
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