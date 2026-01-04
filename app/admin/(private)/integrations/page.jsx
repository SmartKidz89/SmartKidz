"use client";

import { useEffect, useState } from "react";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Cloud } from "lucide-react";
import { Button } from "@/components/admin/AdminControls";

function StatusCard({ title, icon, status, details, action, isImage = true }) {
  const isOk = status === "connected";
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center p-2">
                {isImage ? (
                  <img src={icon} alt={title} className="w-full h-full object-contain" />
                ) : (
                  icon
                )}
             </div>
             <div>
                <h3 className="font-bold text-slate-900">{title}</h3>
                <div className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${isOk ? "text-emerald-600" : "text-amber-600"}`}>
                   {isOk ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                   {status}
                </div>
             </div>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
           {details.map((d, i) => (
             <div key={i} className="flex justify-between text-sm border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                <span className="text-slate-500 font-medium truncate pr-2">{d.label}</span>
                <span className={`font-mono text-xs truncate ${d.highlight ? "text-emerald-600 font-bold" : "text-slate-900"}`}>
                  {d.value}
                </span>
             </div>
           ))}
        </div>
      </div>

      {action && (
        <div className="mt-auto pt-4 border-t border-slate-100">
           {action}
        </div>
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/integrations/status");
      setData(await res.json());
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Build tunnel details for the card
  const cfTunnels = data?.cloudflare?.tunnels || [];
  const cfDetails = [
    { label: "Configuration", value: data?.cloudflare?.configured ? "Set" : "Missing Token/ID" },
    { label: "Active Tunnels", value: cfTunnels.filter(t => t.status === 'healthy').length, highlight: true },
  ];
  
  // Add first few tunnels to the list
  cfTunnels.slice(0, 3).forEach(t => {
    cfDetails.push({ label: t.name, value: t.status, highlight: t.status === 'healthy' });
  });

  return (
    <div>
      <AdminPageHeader 
        title="Integrations" 
        subtitle="Manage connections to infrastructure and third-party services."
        actions={
          <Button tone="ghost" onClick={load} disabled={loading}>
             <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {/* SUPABASE */}
         <StatusCard 
            title="Supabase"
            icon="https://supabase.com/dashboard/img/supabase-logo.svg"
            status={data?.supabase?.ok ? "connected" : "missing config"}
            details={[
               { label: "Project URL", value: data?.supabase?.url || "Not Set" },
               { label: "Service Role", value: data?.supabase?.hasServiceRole ? "Configured" : "Missing" },
               { label: "Direct DB (SQL)", value: data?.supabase?.hasDbUrl ? "Configured" : "Missing (Optional)" }
            ]}
            action={
               <Button tone="secondary" className="w-full" onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>
                  Open Dashboard <ExternalLink className="w-3 h-3 ml-2" />
               </Button>
            }
         />

         {/* CLOUDFLARE */}
         <StatusCard 
            title="Cloudflare"
            icon={<Cloud className="w-6 h-6 text-orange-500" />}
            isImage={false}
            status={data?.cloudflare?.status || "unknown"}
            details={cfDetails}
            action={
               <Button tone="secondary" className="w-full" onClick={() => window.open("https://dash.cloudflare.com/", "_blank")}>
                  Manage Tunnels <ExternalLink className="w-3 h-3 ml-2" />
               </Button>
            }
         />

         {/* VERCEL */}
         <StatusCard 
            title="Vercel"
            icon="https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png"
            status={data?.vercel?.env ? "connected" : "local / unknown"}
            details={[
               { label: "Environment", value: data?.vercel?.env || "development" },
               { label: "Region", value: data?.vercel?.region || "local" },
               { label: "Commit", value: data?.vercel?.commit ? data.vercel.commit.substring(0,7) : "HEAD" }
            ]}
            action={
               <Button tone="secondary" className="w-full" onClick={() => window.open("https://vercel.com/dashboard", "_blank")}>
                  View Deployments <ExternalLink className="w-3 h-3 ml-2" />
               </Button>
            }
         />

         {/* GITHUB */}
         <StatusCard 
            title="GitHub"
            icon="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png"
            status={data?.github?.ok ? "connected" : "missing token"}
            details={[
               { label: "Repository", value: data?.github?.repo || "Not Linked" },
               { label: "Branch", value: data?.github?.branch || "main" },
               { label: "Sync Status", value: "Ready" }
            ]}
            action={
               <Button tone="primary" className="w-full" onClick={() => window.location.href = "/admin/github"}>
                  Manage Sync
               </Button>
            }
         />
      </div>
    </div>
  );
}