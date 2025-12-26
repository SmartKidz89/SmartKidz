"use client";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "./useSession";

export default function AuthCard({ mode = "login", initialPlan = null }) {
  const { supabase } = useSession();
  const router = useRouter();

  const isAppHost =
    typeof window !== "undefined" && window.location.hostname.startsWith("app.");
  const appOrigin =
    process.env.NEXT_PUBLIC_APP_ORIGIN ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//app.${window.location.hostname.replace(/^www\./, "")}`
      : "");

  function goToApp(pathname = "/") {
    const p = pathname.startsWith("/app") ? pathname : `/app${pathname}`;

    const host = typeof window !== "undefined" ? window.location.hostname : "";
    const isLocal = host.includes("localhost") || host.startsWith("127.");

    // In local dev and in single-origin deployments, keep navigation client-side.
    if (isAppHost || isLocal || !appOrigin) {
      router.push(p);
      return;
    }

    // From marketing/root domain, hop to the app subdomain.
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
            data: {
              initial_plan: initialPlan || null,
            },
            emailRedirectTo: `${appOrigin}/login`,
          },
        });
        if (error) throw error;

        // If email confirmation is enabled, Supabase may not create a session immediately.
        // We guide the user clearly.
        if (!data?.session) {
          setMsg("Check your email to confirm your account, then log in.");
          return;
        }

        goToApp("/onboarding");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        // If profile is incomplete, send to onboarding.
        // Schema alignment:
        // - public.profiles.full_name
        // - public.children.display_name
        // (Do not require legacy first_name/last_name/billing fields.)
        try {
          const uid = data?.user?.id;
          if (uid) {
            const [profileRes, childrenRes] = await Promise.all([
              supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle(),
              supabase
                .from("children")
                .select("id", { count: "exact", head: true })
                .eq("parent_id", uid),
            ]);

            // If we can't reliably read completion state due to transient errors or permissions,
            // do not block the user by forcing onboarding.
            if (profileRes?.error || childrenRes?.error) {
              goToApp("/parent");
              return;
            }

            const profile = profileRes?.data;
            const childrenCount = childrenRes?.count ?? 0;
            const incomplete = !profile?.full_name || childrenCount < 1;
            goToApp(incomplete ? "/onboarding" : "/parent");
            return;
          }
        } catch {
          // fallback
        }

        goToApp("/parent");
      }
    } catch (e) {
      setMsg(e?.message || "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="p-6 max-w-md mx-auto bg-white/80 backdrop-blur-xl">
      <div className="text-sm font-semibold text-slate-600">
        {mode === "signup" ? "Create account" : "Welcome back"}
      </div>
      <div className="text-2xl font-extrabold mt-1">
        {mode === "signup" ? "Start your Smart Kidz trial" : "Log in"}
      </div>
      <p className="text-slate-700 mt-2">
        {mode === "signup"
          ? "Create your account now, then add billing details and your children in the next step."
          : "Log in to continue learning."}
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm font-semibold text-slate-700">Email</span>
          <input
            className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-semibold text-slate-700">Password</span>
          <input
            className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </label>

        {msg && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-slate-800 text-sm">
            {msg}
          </div>
        )}

        <Button type="submit" disabled={busy}>
          {busy ? (mode === "signup" ? "Creating…" : "Signing in…") : (mode === "signup" ? "Create account" : "Sign in")}
        </Button>

        <div className="text-sm text-slate-700">
          {mode === "signup" ? (
            <span>
              Already have an account?{" "}
              <a className="font-semibold hover:underline" href="/login">
                Log in
              </a>
            </span>
          ) : (
            <span>
              New here?{" "}
              <a className="font-semibold hover:underline" href="/signup">
                Start free trial
              </a>
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}
