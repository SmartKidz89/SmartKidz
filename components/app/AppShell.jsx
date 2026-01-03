"use client";

import { useFocusMode } from "@/components/ui/FocusModeProvider";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import WelcomeHeader from "./WelcomeHeader";
import ParentTopBar from "./ParentTopBar";
import { cn } from "@/lib/utils";
import { useSound } from "@/hooks/useSound";
import RouteBackdrop from "@/components/ui/RouteBackdrop";
import { Home, Map, Trophy, UserCircle } from "lucide-react";

const HIDE_SHELL_PATHS = ["/app/login","/app/signup","/app/auth","/login","/signup","/auth"];

// Updated Navigation Items
const NAV_ITEMS = [
  { label: "Worlds", href: "/app/worlds", icon: Map },
  { label: "Rewards", href: "/app/rewards", icon: Trophy },
  { label: "Home", href: "/app", icon: Home, isCenter: true },
  { label: "Avatar", href: "/app/avatar", icon: UserCircle },
];

function BottomNav() {
  const pathname = usePathname();
  const hideShell = !!pathname && HIDE_SHELL_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const { play } = useSound();
  
  if (hideShell) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Primary"
        className="pointer-events-auto flex items-center gap-1 p-2 bg-slate-900/90 backdrop-blur-xl shadow-2xl shadow-slate-900/30 rounded-[2.5rem] ring-1 ring-white/10 max-w-lg w-full justify-between"
      >
          {NAV_ITEMS.map((t) => {
            const isActive = pathname === t.href || (t.href !== "/app" && pathname?.startsWith(t.href));
            const Icon = t.icon;
            
            if (t.isCenter) {
              return (
                <Link
                  key="home"
                  href="/app"
                  onClick={() => play("click")}
                  className="relative group -mt-8 mx-2"
                  aria-current={isActive ? "page" : undefined}
                  aria-label="Home"
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-[4px] border-white transform transition-transform group-hover:scale-110 group-active:scale-95",
                    isActive 
                      ? "bg-gradient-to-b from-brand-primary to-indigo-500 shadow-indigo-500/40" 
                      : "bg-slate-800"
                  )}>
                     <Icon className="w-7 h-7 text-white" />
                  </div>
                </Link>
              );
            }
            
            return (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => play("click")}
                aria-current={isActive ? "page" : undefined}
                aria-label={t.label}
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
        <BottomNav />
      )}
    </div>
  );
}