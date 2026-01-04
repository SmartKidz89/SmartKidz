"use client";

import { useEffect, useState } from "react";
import { Activity, Flag, Server, ShieldCheck, Database, Cpu, Globe, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/admin/AdminControls";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { cx } from "@/components/admin/adminUi";

const MOCK_FLAGS = [
  { key: "new_onboarding", label: "New Onboarding Flow", enabled: true, desc: "Use the 4-step wizard instead of legacy form." },
  { key: "holiday_theme", label: "Holiday Theme", enabled: false, desc: "Enable seasonal CSS overrides." },
  { key: "maintenance_mode", label: "Maintenance Mode", enabled: false, desc: "Block non-admin access with a maintenance page." },
  { key: "beta_features", label: "Beta Features", enabled: true, desc: "Show 'Labs' tab to users." },
];

export default function SystemPage() {
  const [tab, setTab] = useState("health");
  const [flags, setFlags] = useState(MOCK_FLAGS);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(false);

  async function checkHealth() {
    setLoading(true);
    try {
       const res = await fetch("/api/admin/system/health", { cache: "no-store" });
       const data = await res.json();
       setHealth(data);
    } catch (e) {
       setHealth({ database: "error", dbError: "Check failed" });
    } finally {
       setLoading(false);
    }
  }

  useEffect(() => {
    checkHealth();
  }, []);

  const toggleFlag = (key) => {
    setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div>
      <AdminPageHeader 
        title="System & Operations" 
        subtitle="Monitor health, manage feature flags, and view environment configuration."
        actions={
            <Button onClick={checkHealth} disabled={loading} tone="secondary">
                <RefreshCw className={cx("w-4 h-4 mr-2", loading && "animate-spin")} /> Refresh Health
            </Button>
        }
      />

      <div className="flex gap-2 border-b border-slate-200 pb-1 mb-6">
        {[
          { id: "health", label: "System Health", icon: Server },
          { id: "flags", label: "Feature Flags", icon: Flag },
          { id: "env", label: "Environment", icon: Globe },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold rounded-t-lg transition-colors ${
              tab === t.id 
                ? "bg-slate-100 text-slate-900 border-b-2 border-slate-900" 
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "health" && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <HealthCard 
              label="Database (SQL)" 
              status={health?.database} 
              icon={Database} 
              error={health?.dbError}
            />
            <HealthCard 
              label="Supabase API" 
              status={health?.supabaseApi} 
              icon={Server} 
            />
            <HealthCard label="Latency" value={health?.latency} icon={Cpu} status="healthy" />
            <HealthCard label="Environment" value={process.env.NODE_ENV} icon={ShieldCheck} status="healthy" />
            
            <div className="col-span-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-4">
               <h3 className="font-bold text-slate-900 mb-2">Connection Info</h3>
               <div className="text-sm text-slate-600">
                  <p>Database Health Check attempts to connect using <code>SUPABASE_DB_URL</code> (port 6543/5432).</p>
                  <p className="mt-2">Supabase API check uses the REST interface via <code>SUPABASE_URL</code>.</p>
                  {health?.dbError && (
                    <div className="mt-4 p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-800 font-mono text-xs">
                        <strong>Error Detail:</strong> {health.dbError}
                    </div>
                  )}
               </div>
            </div>
         </div>
      )}

      {tab === "flags" && (
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
               <div className="text-sm font-bold text-slate-700">Active Flags</div>
               <Button size="sm" tone="secondary">Add Flag</Button>
            </div>
            <div className="divide-y divide-slate-100">
               {flags.map(f => (
                  <div key={f.key} className="p-4 flex items-center justify-between hover:bg-slate-50/50">
                     <div>
                        <div className="font-bold text-slate-900 text-sm">{f.label}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{f.key}</div>
                        <div className="text-xs text-slate-600 mt-1">{f.desc}</div>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={f.enabled} onChange={() => toggleFlag(f.key)} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                     </label>
                  </div>
               ))}
            </div>
         </div>
      )}

      {tab === "env" && (
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Environment Config</h3>
            <div className="space-y-2">
               <EnvRow label="NODE_ENV" value={process.env.NODE_ENV} />
               <EnvRow label="NEXT_PUBLIC_APP_URL" value={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"} />
               <EnvRow label="Default Locale" value="en-AU" />
               <EnvRow label="Timezone" value="Australia/Sydney" />
            </div>
         </div>
      )}
    </div>
  );
}

function HealthCard({ label, status, value, icon: Icon, error }) {
  const isHealthy = status === "healthy";
  const isError = status === "error" || status === "missing_env";
  
  return (
    <div className={cx(
        "p-5 rounded-2xl border shadow-sm flex items-center gap-4 transition-colors",
        isError ? "bg-rose-50 border-rose-200" : "bg-white border-slate-200"
    )}>
       <div className={cx("w-12 h-12 rounded-xl flex items-center justify-center", isHealthy ? "bg-emerald-50 text-emerald-600" : isError ? "bg-white text-rose-500" : "bg-slate-100 text-slate-500")}>
          <Icon className="w-6 h-6" />
       </div>
       <div>
          <div className={cx("text-xs font-bold uppercase", isError ? "text-rose-800" : "text-slate-400")}>{label}</div>
          <div className={cx("text-lg font-black", isHealthy ? "text-emerald-700" : isError ? "text-rose-600" : "text-slate-700")}>
             {value || (isHealthy ? "Healthy" : isError ? "Error" : "Unknown")}
          </div>
       </div>
    </div>
  );
}

function EnvRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
       <span className="text-sm font-mono text-slate-500">{label}</span>
       <span className="text-sm font-bold text-slate-900">{value}</span>
    </div>
  );
}