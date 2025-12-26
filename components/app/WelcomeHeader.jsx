"use client";

import Link from "next/link";
import YearSelector from "./YearSelector";
import AvatarPicker from "./AvatarPicker";
import { useActiveChild } from "@/hooks/useActiveChild";
import { motion, useReducedMotion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Mascot from "@/components/ui/Mascot";
import EconomyPill from "@/components/ui/EconomyPill";

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
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={reduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <Mascot className="hidden sm:block" />
        <AvatarPicker />
        <div className="leading-tight">
          <div className="text-xs font-extrabold tracking-wide text-slate-500">WELCOME BACK!</div>
          <div className="text-lg font-black text-slate-900">{name}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <EconomyPill className="hidden sm:inline-flex" />
        {showParentBack && (
          <Link href="/app/parent" className="skz-btn skz-btn-soft">
            Parents dashboard
          </Link>
        )}
        <Link href="/app/menu" className="skz-btn skz-btn-soft" data-testid="header-menu">Menu</Link>
        <YearSelector />
        <button onClick={handleLogout} className="skz-btn skz-btn-soft">
          Log out
        </button>
      </div>
    </motion.div>
  );
}
