"use client";

import { useState } from "react";
import { Button } from "@/components/admin/AdminControls";
import AdminNotice from "@/components/admin/AdminNotice";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { 
  Link as LinkIcon, 
  Image as ImageIcon, Loader2, CheckCircle, 
  AlertCircle, Play, Server, RefreshCw
} from "lucide-react";

export default function AssetGeneratorPage() {
  const [comfyUrl, setComfyUrl] = useState("http://127.0.0.1:8000");
  const [queue, setQueue] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, success: 0, fail: 0 });
  const [logs, setLogs] = useState([]);

  // Scan for missing assets
  async function scan() {
    setScanning(true);
    setLogs(prev => ["Scanning for missing assets...", ...prev]);
    try {
      const res = await fetch("/api/admin/assets/scan", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Scan failed");
      
      setQueue(data.assets || []);
      setLogs(prev => [`Found ${data.count} assets needing generation.`, ...prev]);
    } catch (e) {
      setLogs(prev => [`Error: ${e.message}`, ...prev]);
    } finally {
      setScanning(false);
    }
  }

  // Process the queue
  async function generateAll() {
    if (queue.length === 0) return;
    setProcessing(true);
    setProgress({ current: 0, total: queue.length, success: 0, fail: 0 });
    setLogs(prev => ["Starting batch generation...", ...prev]);

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < queue.length; i++) {
      const asset = queue[i];
      setProgress(p => ({ ...p, current: i + 1 }));
      setLogs(prev => [`Generating: ${asset.asset_id}...`, ...prev]);

      try {
        const res = await fetch("/api/admin/assets/generate-comfy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            assetId: asset.asset_id,
            comfyUrl: comfyUrl,
            prompt: asset.alt_text || asset.metadata?.prompt, // Pass prompt hints if available
            workflow: "basic_text2img"
          })
        });

        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error);
        
        successCount++;
        setProgress(p => ({ ...p, success: successCount }));
        setLogs(prev => [`✅ Done: ${asset.asset_id}`, ...prev]);
        
        // Remove from queue visually
        setQueue(prev => prev.filter(a => a.asset_id !== asset.asset_id));

      } catch (e) {
        failCount++;
        setProgress(p => ({ ...p, fail: failCount }));
        setLogs(prev => [`❌ Failed: ${asset.asset_id} - ${e.message}`, ...prev]);
      }
    }

    setProcessing(false);
    setLogs(prev => ["Batch complete.", ...prev]);
  }

  return (
    <div>
      <AdminPageHeader 
        title="Asset Generator"
        subtitle="Connect local ComfyUI to batch-generate missing media."
        backLink="/admin/media"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Configuration & Controls */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-700 uppercase tracking-wide">
              <LinkIcon className="w-4 h-4" /> Connection
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">ComfyUI URL</label>
                <input 
                  value={comfyUrl}
                  onChange={(e) => setComfyUrl(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-indigo-500/20 outline-none"
                  placeholder="http://127.0.0.1:8000"
                />
              </div>
              
              <div className="bg-indigo-50 p-3 rounded-xl text-xs text-indigo-800 leading-relaxed border border-indigo-100">
                <strong>Note:</strong> Ensure ComfyUI is started with <code className="bg-white/50 px-1 rounded">--listen --port 8000</code>.
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-slate-700 uppercase tracking-wide">
              <Server className="w-4 h-4" /> Actions
            </div>
            
            <div className="space-y-3">
              <Button onClick={scan} disabled={scanning || processing} tone="ghost" className="w-full border-2 border-slate-100">
                {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Scan Missing Assets
              </Button>
              
              <Button onClick={generateAll} disabled={processing || queue.length === 0} className="w-full">
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                Generate Batch ({queue.length})
              </Button>
            </div>
          </div>

        </div>

        {/* Right: Queue & Logs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Card */}
          {(processing || progress.total > 0) && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                 <div className="text-sm font-bold text-slate-700">Batch Progress</div>
                 <div className="text-xs font-mono text-slate-500">{progress.current} / {progress.total}</div>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                 <div 
                   className="h-full bg-indigo-600 transition-all duration-300"
                   style={{ width: `${(progress.current / progress.total) * 100}%` }} 
                 />
              </div>
              <div className="flex gap-4 mt-3 text-xs font-medium">
                 <span className="text-emerald-600 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> {progress.success} success</span>
                 <span className="text-rose-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {progress.fail} failed</span>
              </div>
            </div>
          )}

          {/* Queue List */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[500px]">
             <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div className="font-bold text-sm text-slate-700">Generation Queue</div>
                <div className="text-xs text-slate-500 bg-white px-2 py-1 rounded-md border border-slate-200">
                   {queue.length} Pending
                </div>
             </div>
             
             <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {queue.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                     <ImageIcon className="w-12 h-12 mb-2 opacity-20" />
                     <p className="text-sm">No assets queued.</p>
                  </div>
                ) : (
                  queue.map((asset) => (
                    <div key={asset.asset_id} className="p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-100 transition-colors flex items-start gap-3">
                       <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 text-slate-400">
                          <ImageIcon className="w-5 h-5" />
                       </div>
                       <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900 truncate">{asset.asset_id}</div>
                          <div className="text-[10px] text-slate-500 truncate">{asset.alt_text || "No prompt hint"}</div>
                       </div>
                    </div>
                  ))
                )}
             </div>

             {/* Live Logs */}
             <div className="h-48 border-t border-slate-200 bg-slate-900 text-emerald-400 font-mono text-xs p-4 overflow-y-auto">
                {logs.length === 0 ? (
                  <span className="opacity-50">// Ready. Logs will appear here.</span>
                ) : (
                  logs.map((log, i) => <div key={i} className="mb-1 last:mb-0 border-b border-slate-800/50 pb-1">&gt; {log}</div>)
                )}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}