"use client";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "./useSession";

export default function AuthCard({ mode = "login", initialPlan = null }) {
  const { supabase } = useSession();
  const router = useRouter();

  const isAppHost = typeof window !== "undefined" && window.location.hostname.startsWith("app.");
  const appOrigin = process.env.NEXT_PUBLIC_APP_ORIGIN || (typeof window !== "undefined" ? `${window.location.protocol}//app.${window.location.hostname.replace(/^www\./, "")}` : "");

  function goToApp(pathname = "/") {
    const p = pathname.startsWith("/app") ? pathname : `/app${pathname}`;
    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isLocal = host.includes("localhost") || host.startsWith("127.");

    if (isAppHost || isLocal || !appOrigin) {
      router.push(p);
      return;
    }
    window.location.assign(`${appOrigin}${p}`);
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    try {
      if (!email || !password) throw new Error("Please enter email and password.");

      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { initial_plan: initialPlan || null },
            emailRedirectTo: `${appOrigin}/login`,
          },
        });
        if (error) throw error;
        if (!data?.session) {
          setMsg("Check your email to confirm your account, then log in.");
          return;
        }
        goToApp("/onboarding");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // Lightweight completion check
        try {
          const uid = data?.user?.id;
          if (uid) {
            const { count } = await supabase
              .from("children")
              .select("id", { count: "exact", head: true })
              .eq("parent_id", uid);
            
            goToApp(count && count > 0 ? "/parent" : "/onboarding");
            return;
          }
        } catch {}
        
        goToApp("/parent");
      }
    } catch (e) {
      setMsg(e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-0 border-none shadow-none bg-transparent">
      <form onSubmit={onSubmit} className="grid gap-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Email Address</label>
          <input
            className="w-full h-14 rounded-2xl border-2 border-slate-200 px-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-lg bg-slate-50 focus:bg-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="name@example.com"
          />
        </div>

        <div className="space-y-1.5">
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Password</label>
          <input
            className="w-full h-14 rounded-2xl border-2 border-slate-200 px-4 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-semibold text-lg bg-slate-50 focus:bg-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            placeholder="••••••••"
          />
        </div>

        {msg && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800 text-sm font-bold text-center animate-in slide-in-from-top-1">
            {msg}
          </div>
        )}

        <Button 
          type="submit" 
          disabled={busy} 
          className="w-full h-14 text-lg shadow-xl bg-slate-900 hover:bg-slate-800 text-white mt-2"
        >
          {busy ? "Loading..." : (mode === "signup" ? "Create Free Account" : "Sign In")}
        </Button>
      </form>
    </Card>
  );
}