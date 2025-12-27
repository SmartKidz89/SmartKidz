"use client";

import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "./useSession";
import { Sparkles, Command } from "lucide-react"; // Using Command icon as a placeholder for Apple if needed, or SVG

function GoogleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.23856)">
        <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" />
        <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" />
        <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" />
        <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" />
      </g>
    </svg>
  );
}

function AppleIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.8406 2.0108C14.7806 0.860802 16.2706 0.0508022 17.5106 0C17.6506 1.7708 16.9406 3.4208 15.9306 4.5408C14.9706 5.6108 13.3706 6.5408 12.0606 6.4208C11.9106 4.7708 12.8306 2.9408 13.8406 2.0108Z" />
      <path d="M17.2007 14.9105C17.2307 18.0605 20.0807 19.1605 20.1207 19.1805C20.0907 19.2605 19.6407 20.8105 18.5507 22.4005C17.6007 23.7805 16.6307 25.1305 15.0807 25.1605C13.5307 25.1805 13.0607 24.2405 11.2707 24.2405C9.48074 24.2405 8.92074 25.1305 7.45074 25.1805C5.97074 25.2405 4.89074 23.7105 3.94074 22.3405C1.99074 19.5305 0.500743 14.3905 2.49074 10.9405C3.47074 9.23053 5.23074 8.16053 7.15074 8.12053C8.63074 8.09053 10.0307 9.12053 10.9407 9.12053C11.8307 9.12053 13.5407 7.82053 15.3507 8.07053C16.1107 8.10053 18.2507 8.37053 19.6207 10.3705C19.5007 10.4405 17.1507 11.8005 17.2007 14.9105Z" transform="translate(0 -2)" />
    </svg>
  );
}

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

  async function handleSocial(provider) {
    setBusy(true);
    setMsg(null);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${appOrigin}/auth/callback`,
          queryParams: initialPlan ? { initial_plan: initialPlan } : undefined,
        },
      });
      if (error) throw error;
      // Redirect happens automatically
    } catch (e) {
      setMsg(e?.message || `Could not sign in with ${provider}.`);
      setBusy(false);
    }
  }

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

      <div className="grid gap-3">
        <button
          onClick={() => handleSocial("google")}
          className="flex items-center justify-center gap-3 w-full h-12 bg-white border border-slate-200 rounded-2xl text-slate-700 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          disabled={busy}
        >
          <GoogleIcon className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>
        
        <button
          onClick={() => handleSocial("apple")}
          className="flex items-center justify-center gap-3 w-full h-12 bg-black text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-md"
          disabled={busy}
        >
          <AppleIcon className="w-5 h-5" />
          <span>Continue with Apple</span>
        </button>
      </div>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
           <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase font-bold tracking-widest text-slate-400">
           <span className="bg-white/80 px-4 backdrop-blur">Or with email</span>
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