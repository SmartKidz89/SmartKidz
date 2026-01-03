"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { useActiveChild } from "@/hooks/useActiveChild";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { getGradeLabel } from "@/lib/marketing/geoConfig";

export default function ParentProfilePage() {
  const supabase = getSupabaseClient();
  const { kids, activeChildId, setActiveChild, refreshKids } = useActiveChild();
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    (async () => {
      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;
      setMe(user || null);

      if (user) {
        // Explicitly selecting from public.profiles
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single();
        setProfile(profileData);
      }
    })();
  }, [supabase]);

  return (
    
    <PageScaffold title="Profile">
<main className="container-pad py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Profile & Kids</h1>
          <p className="mt-1 text-sm sm:text-base font-semibold text-slate-600">
            Manage your account and view child details.
          </p>
        </div>

        <Link
          href="/app/parent"
          className="h-11 px-4 rounded-2xl bg-white/80 border border-slate-200 shadow-sm font-extrabold text-slate-800 hover:bg-white"
        >
          Back
        </Link>
      </div>

      <section className="mt-6 rounded-4xl bg-white/75 border border-slate-200 shadow-soft p-5">
        <div className="text-lg font-black text-slate-900">Account</div>
        <div className="mt-2 text-sm font-semibold text-slate-700">
          {me?.email ? (
            <div className="grid gap-1">
              <div>
                Signed in as <span className="font-extrabold">{me.email}</span>
              </div>
              {profile?.full_name && (
                <div>
                  Name: <span className="font-extrabold">{profile.full_name}</span>
                </div>
              )}
              {profile?.role && (
                <div className="text-xs text-slate-500 uppercase tracking-wider font-bold mt-1">
                  {profile.role}
                </div>
              )}
            </div>
          ) : (
            "Loading account…"
          )}
        </div>
      </section>

      <section className="mt-4 rounded-4xl bg-white/75 border border-slate-200 shadow-soft p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-lg font-black text-slate-900">Children</div>
            <div className="mt-1 text-sm font-semibold text-slate-600">
              Active child is highlighted. Selecting sets the active child for this device.
            </div>
          </div>
          <button
            onClick={() => refreshKids()}
            className="h-10 px-4 rounded-2xl bg-slate-900 text-white font-extrabold hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {kids.map((k) => (
            <button
              key={k.id}
              onClick={() => setActiveChild(k.id)}
              className={`text-left rounded-4xl p-5 border transition active:scale-[0.99]
                ${k.id === activeChildId ? "bg-brand-primary/10 border-brand-primary/30" : "bg-white border-slate-200 hover:bg-slate-50"}`}
            >
              <div className="text-lg font-black text-slate-900">{k.display_name}</div>
              <div className="mt-1 text-sm font-semibold text-slate-600">{getGradeLabel(k.year_level, k.country)}</div>

              <div className="mt-3 text-xs font-extrabold text-slate-500">Child ID</div>
              <div className="text-xs font-mono text-slate-700 break-all">{k.id}</div>
            </button>
          ))}
        </div>
      </section>
    </main>
  
    </PageScaffold>
  );
}