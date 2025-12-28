"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowLeft } from "lucide-react";

export default function DemoSwitchPage() {
  const router = useRouter();
  const [isDemo, setIsDemo] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDemo(window.localStorage.getItem("skz_force_demo") === "true");
  }, []);

  const toggle = (val) => {
    if (val) window.localStorage.setItem("skz_force_demo", "true");
    else window.localStorage.removeItem("skz_force_demo");
    setIsDemo(val);
    
    // Force reload to pick up new client
    window.location.href = "/app";
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <Card className="max-w-md w-full p-8 text-center space-y-6 shadow-2xl">
        <div className="flex justify-center mb-2">
           <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-4xl shadow-inner">
             🎭
           </div>
        </div>
        
        <div>
           <h1 className="text-2xl font-black text-slate-900">Demo Control Panel</h1>
           <p className="text-slate-600 mt-3 font-medium leading-relaxed">
             Toggle this to force the app into <strong>"Screenshot Mode"</strong>. 
             <br/><br/>
             You'll enter a simulated session with populated data (Leo & Mia) to explore the UI without needing a real database.
           </p>
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <Button 
            onClick={() => toggle(true)} 
            className={`h-14 text-lg shadow-lg ${isDemo ? "bg-emerald-500 hover:bg-emerald-600 pointer-events-none opacity-100" : ""}`}
            disabled={isDemo}
          >
            {isDemo ? (
              <>
                 <Sparkles className="w-5 h-5 mr-2" /> Demo Active
              </>
            ) : (
              "Enable Demo Mode"
            )}
          </Button>
          
          <Button 
            variant="secondary" 
            onClick={() => toggle(false)}
            className="h-14"
          >
            Disable (Use Real DB)
          </Button>
        </div>

        <div className="text-xs font-bold text-slate-400 pt-4 border-t border-slate-100 uppercase tracking-widest">
          Current State: <span className={isDemo ? "text-emerald-500" : "text-slate-500"}>{isDemo ? "Mock Data" : "Real Supabase"}</span>
        </div>
        
        <div className="pt-2">
           <a href="/" className="text-sm font-bold text-indigo-600 hover:underline flex items-center justify-center gap-1">
             <ArrowLeft className="w-4 h-4" /> Back to Home
           </a>
        </div>
      </Card>
    </div>
  );
}