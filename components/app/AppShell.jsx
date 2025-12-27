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

const HIDE_SHELL_PATHS = ["/app/login","/app/signup","/app/auth","/login","/signup","/auth"];

const TABS = [
  { label: "Home", href: "/app", icon: "🏠" },
  { label: "Worlds", href: "/app/worlds", icon: "🗺️" },
  { label: "Rewards", href: "/app/rewards", icon: "🎁" },
  { label: "Parent", href: "/app/parent", icon: "👨‍👩‍👧‍👦" },
];

function BottomNav() {
  const pathname = usePathname();
  const hideShell = !!pathname && HIDE_SHELL_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  const { play } = useSound();

  
  if (hideShell) {
    return null;
  }
  return (
    <nav className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
      <div className="mx-auto max-w-lg pointer-events-auto">
        <div className="skz-clay p-2">
          <div className="relative grid grid-cols-4 gap-1">
            {TABS.map((t) => {
              const active = pathname === t.href || (pathname?.startsWith(t.href + "/") && t.href !== "/app");
              return (
                <Link
                  key={t.href}
                  href={t.href}
                  onClick={() => play("click")}
                  className={cn(
                    "relative flex flex-col items-center justify-center py-2 rounded-3xl transition-colors duration-200 skz-pressable",
                    active ? "text-slate-900" : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {active && (
                    <motion.div
                      layoutId="skzDockActive"
                      className="absolute inset-0 rounded-3xl bg-white/70 border border-white/70 shadow-e2"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <motion.span
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 420, damping: 24 }}
                    className="relative z-10 text-xl mb-0.5 filter drop-shadow-sm"
                  >
                    {t.icon}
                  </motion.span>
                  <span
                    className={cn(
                      "relative z-10 text-[10px] font-black uppercase tracking-wider",
                      active ? "opacity-100" : "opacity-70"
                    )}
                  >
                    {t.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function AppShell({ children }) {
  const { focus, toggle: toggleFocus } = useFocusMode();
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
    <div className="app-ui min-h-screen pb-28">
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

      {!inParent && <BottomNav />}
    </div>
  );
}
