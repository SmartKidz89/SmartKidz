"use client";

import { useFocusMode } from "@/components/ui/FocusModeProvider";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import WelcomeHeader from "./WelcomeHeader";
import ParentTopBar from "./ParentTopBar";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/useSound";
import RouteBackdrop from "@/components/ui/RouteBackdrop";
import { Home, Map, Trophy, UserCircle } from "lucide-react";

const HIDE_SHELL_PATHS = ["/app/login","/app/signup","/app/auth","/login","/signup","/auth"];

const TABS = [
  { label: "Home", href: "/app", icon: Home, color: "text-sky-500" },
  { label: "Worlds", href: "/app/worlds", icon: Map, color: "text-emerald-500" },
  { label: "Rewards", href: "/app/rewards", icon: Trophy, color: "text-amber-500" },
  { label: "Parent", href: "/app/parent", icon: UserCircle, color: "text-indigo-500" },
];

function BottomNav() {
  const pathname = usePathname();
  const hideShell = !!pathname && HIDE_SHELL_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const { play } = useSound();
  
  if (hideShell) return null;

  return (
    <nav className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none flex justify-center px-4">
      <div className="pointer-events-auto">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 p-2 bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl shadow-slate-900/10 rounded-[2rem] ring-1 ring-black/5"
        >
          {TABS.map((t) => {
            const isActive = pathname === t.href || (pathname?.startsWith(t.href + "/") && t.href !== "/app");
            const Icon = t.icon;
            
            return (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => play("click")}
                className="relative group"
              >
                <div className={cn(
                  "relative flex flex-col items-center justify-center w-16 h-16 rounded-[1.5rem] transition-all duration-300",
                  isActive ? "bg-slate-900 text-white shadow-lg transform -translate-y-2 scale-110" : "hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                )}>
                   <Icon className={cn("w-6 h-6 transition-colors", isActive ? "text-white" : "group-hover:text-slate-900")} strokeWidth={isActive ? 3 : 2.5} />
                   
                   {/* Label (only visible when active or hovered, subtle) */}
                   <span className={cn(
                     "text-[9px] font-bold uppercase tracking-wider mt-1 transition-all duration-300 absolute -bottom-6 opacity-0 group-hover:opacity-100 bg-slate-900 text-white px-2 py-0.5 rounded-md shadow-sm pointer-events-none whitespace-nowrap z-20",
                     isActive && "hidden"
                   )}>
                     {t.label}
                   </span>
                   
                   {isActive && (
                     <motion.div 
                       layoutId="nav-dot"
                       className="absolute -bottom-2 w-1 h-1 rounded-full bg-slate-900 opacity-20"
                     />
                   )}
                </div>
              </Link>
            );
          })}
        </motion.div>
      </div>
    </nav>
  );
}

export default function AppShell({ children }) {
  const { focus } = useFocusMode();
  const pathname = usePathname();
  const reduce = useReducedMotion();

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

  const pageVariants = {
    initial: { opacity: 0, scale: 0.98, y: 10 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 1.02, y: -10 },
  };

  return (
    <div className="app-ui min-h-screen pb-32 selection:bg-brand-primary/30">
      <RouteBackdrop />
      {inKid ? <WelcomeHeader /> : <ParentTopBar />}

      <main className="container-pad pt-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            variants={reduce ? {} : pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {!inParent && !focus && <BottomNav />}
    </div>
  );
}