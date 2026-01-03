"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { createClient } from "@/lib/supabase/client";
import { LogOut, LayoutGrid, UserCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ParentTopBar() {
  const pathname = usePathname();
  const { user } = useSupabaseUser();
  const supabase = createClient();
  
  const handleLogout = async () => {
    try {
      await supabase?.auth.signOut();
      window.location.href = "/app/login";
    } catch (e) {
      console.error(e);
    }
  };

  const isProfile = pathname?.startsWith("/app/parent/profile");

  return (
    <div className="sticky top-0 z-30">
      <div className="bg-slate-900 text-white shadow-md">
        <div className="container-pad flex flex-col sm:flex-row items-center justify-between py-3 gap-3 sm:gap-0">
          
          {/* Brand / Context */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="h-8 w-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <span className="font-black text-xs">P</span>
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Parent Dashboard</div>
              {user?.email && <div className="text-xs font-semibold text-slate-300">{user.email}</div>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-bold text-white hover:bg-white/20 transition-all active:scale-95"
              title="Switch to Kids Mode"
            >
              <span>Kid View</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </Link>

            <div className="h-6 w-px bg-white/10 mx-1" />

            <Link
              href="/app/parent"
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-xl transition-colors",
                pathname === "/app/parent" 
                  ? "bg-indigo-600 text-white shadow-inner" 
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              )}
              title="Dashboard Home"
            >
              <LayoutGrid className="w-4 h-4" />
            </Link>

            <Link
              href="/app/parent/profile"
              className={cn(
                "h-9 w-9 flex items-center justify-center rounded-xl transition-colors",
                isProfile 
                  ? "bg-indigo-600 text-white shadow-inner" 
                  : "text-slate-400 hover:bg-white/10 hover:text-white"
              )}
              title="Profile Settings"
            >
              <UserCircle className="w-5 h-5" />
            </Link>
            
            <button
              type="button"
              onClick={handleLogout}
              className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-rose-900/30 hover:text-rose-400 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Subtle bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
    </div>
  );
}