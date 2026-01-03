"use client";

import { useEffect, useState } from "react";
import { Activity, Flag, Server, ShieldCheck, Database, Cpu, Globe } from "lucide-react";
import { Button, Input } from "@/components/admin/AdminControls";
import { cx } from "@/components/admin/adminUi";

const MOCK_FLAGS = [
  { key: "new_onboarding", label: "New Onboarding Flow", enabled: true, desc: "Use the 4-step wizard instead of legacy form." },
  { key: "holiday_theme", label: "Holiday Theme", enabled: false, desc: "Enable seasonal CSS overrides." },
  { key: "maintenance_mode", label: "Maintenance Mode", enabled: false, desc: "Block non-admin access with a maintenance page." },
  { key: "beta_features", label: "Beta Features", enabled: true, desc: "Show 'Labs' tab to users." },
];

export default function SystemPage() {
  const [tab, setTab] = useState("health"); // health | flags | env
  const [flags, setFlags] = useState(MOCK_FLAGS);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    // Simulate health check
    setTimeout(() => {
       setHealth({
         database: "healthy",
         redis: "healthy",
         storage: "healthy",
         latency: "45ms",
         uptime: "99.98%"
       });
    }, 800);
  }, []);

  const toggleFlag = (key) => {
    setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600" />
          System & Operations
        </h1>
        <p className="text-slate-500">
          Monitor health, manage feature flags, and view environment configuration.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-1">
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

      {/* HEALTH TAB */}
      {tab === "health" && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <HealthCard label="Database" status={health?.database} icon={Database} />
            <HealthCard label="Storage" status={health?.storage} icon={Server} />
            <HealthCard label="Latency" value={health?.latency} icon={Cpu} status="healthy" />
            <HealthCard label="Uptime" value={health?.uptime} icon={ShieldCheck} status="healthy" />
            
            <div className="col-span-full bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mt-4">
               <h3 className="font-bold text-slate-900 mb-4">Operational Metrics</h3>
               <div className="h-48 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 text-sm font-mono border border-slate-100 border-dashed">
                  [Chart Placeholder: Error Rates & Traffic]
               </div>
            </div>
         </div>
      )}

      {/* FLAGS TAB */}
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

      {/* ENV TAB */}
      {tab === "env" && (
         <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-bold text-slate-900 mb-4">Environment Config</h3>
            <div className="space-y-2">
               <EnvRow label="NODE_ENV" value={process.env.NODE_ENV} />
               <EnvRow label="NEXT_PUBLIC_APP_URL" value={process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"} />
               <EnvRow label="SUPABASE_URL" value="https://***.supabase.co" />
               <EnvRow label="Default Locale" value="en-AU" />
               <EnvRow label="Timezone" value="Australia/Sydney" />
            </div>
         </div>
      )}

    </div>
  );
}

function HealthCard({ label, status, value, icon: Icon }) {
  const isHealthy = status === "healthy";
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
       <div className={cx("w-12 h-12 rounded-xl flex items-center justify-center", isHealthy ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>
          <Icon className="w-6 h-6" />
       </div>
       <div>
          <div className="text-xs font-bold text-slate-400 uppercase">{label}</div>
          <div className={cx("text-lg font-black", isHealthy ? "text-emerald-700" : "text-slate-700")}>
             {value || (isHealthy ? "Operational" : "Unknown")}
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