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
    <Card className="p-8 max-w-md mx-auto bg-white/80 backdrop-blur-xl shadow-xl">
      <div className="text-center mb-6">
        <div className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">
          {mode === "signup" ? "Get Started" : "Welcome Back"}
        </div>
        <div className="text-3xl font-black text-slate-900">
          {mode === "signup" ? "Create Account" : "Sign In"}
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 ml-1">Email</label>
          <input
            className="w-full h-12 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="you@example.com"
          />
        </div>

        <div>
           <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5 ml-1">Password</label>
          <input
            className="w-full h-12 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            placeholder="••••••••"
          />
        </div>

        {msg && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-800 text-sm font-medium text-center">
            {msg}
          </div>
        )}

        <Button type="submit" disabled={busy} className="w-full h-12 text-lg shadow-lg">
          {busy ? "Please wait..." : (mode === "signup" ? "Create Account" : "Sign In")}
        </Button>

        <div className="text-center text-sm font-semibold text-slate-600 mt-2">
          {mode === "signup" ? (
            <span>
              Already joined?{" "}
              <a className="text-indigo-600 hover:text-indigo-800 hover:underline" href="/login">
                Log in
              </a>
            </span>
          ) : (
            <span>
              New to SmartKidz?{" "}
              <a className="text-indigo-600 hover:text-indigo-800 hover:underline" href="/signup">
                Sign up
              </a>
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}