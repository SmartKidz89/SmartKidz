"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSupabaseUser } from "@/lib/useSupabaseUser";
import { createClient } from "@/lib/supabase/client";

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

  return (
    <div className="sticky top-0 z-30">
      <div className="bg-white/80 backdrop-blur border-b border-slate-200">
        <div className="container-pad flex items-center justify-between py-3">
          <div>
            <div className="text-xs font-extrabold tracking-wide text-slate-500">PARENT</div>
            <div className="text-base font-black text-slate-900">Dashboard</div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/app"
              className="rounded-2xl px-3 py-2 text-sm font-extrabold bg-slate-900 text-white hover:bg-slate-800"
              title="Go to Kids mode"
            >
              Kids View
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100"
              aria-label="Log out"
            >
              Log out
            </button>

            <Link
              href="/app/parent/profile"
              className={"rounded-2xl px-3 py-2 text-sm font-extrabold border border-slate-200 bg-white hover:bg-slate-50 " +
                (pathname?.startsWith("/app/parent/profile") ? "text-slate-900" : "text-slate-700")}
            >
              Profile & Kids
            </Link>
          </div>
        </div>
      </div>

      {user?.email && (
        <div className="bg-slate-50/80 border-b border-slate-200">
          <div className="container-pad py-2 text-xs font-semibold text-slate-600">
            Signed in as <span className="font-extrabold text-slate-800">{user.email}</span>
          </div>
        </div>
      )}
    </div>
  );
}
