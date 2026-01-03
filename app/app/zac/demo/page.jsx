"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Sparkles, ShieldCheck, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SecretDemoPage() {
  const router = useRouter();
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(window.localStorage.getItem("skz_force_demo") === "true");
  }, []);

  const toggle = () => {
    const next = !active;
    if (next) {
      window.localStorage.setItem("skz_force_demo", "true");
      // Simulate a premium entitlement in local storage for good measure if needed by client checks
      window.localStorage.setItem("skz_entitlement_override", "premium");
    } else {
      window.localStorage.removeItem("skz_force_demo");
      window.localStorage.removeItem("skz_entitlement_override");
    }
    window.location.href = "/app";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6">
      <Card className="max-w-md w-full p-10 text-center space-y-8 bg-slate-900 border-slate-800 shadow-2xl">
        <div className="flex justify-center">
           <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center text-5xl shadow-inner ring-1 ring-indigo-500/50">
             🕶️
           </div>
        </div>
        
        <div>
           <h1 className="text-3xl font-black text-white tracking-tight">God Mode</h1>
           <p className="text-slate-400 mt-3 font-medium text-lg">
             {active ? "System is currently bypassed." : "Restricted Access Area."}
           </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={toggle} 
            className={`w-full h-16 text-lg shadow-xl border-none ${active ? "bg-emerald-500 hover:bg-emerald-600" : "bg-white text-slate-900 hover:bg-slate-100"}`}
          >
            {active ? (
              <><ShieldCheck className="w-6 h-6 mr-2" /> Active: Return to App</>
            ) : (
              <><Sparkles className="w-6 h-6 mr-2" /> Enable Full Access</>
            )}
          </Button>
          
          {active && (
            <button 
              onClick={() => {
                window.localStorage.clear();
                window.location.href = "/";
              }}
              className="text-slate-500 hover:text-rose-400 text-sm font-bold flex items-center justify-center gap-2 w-full py-2 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Hard Reset App
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}