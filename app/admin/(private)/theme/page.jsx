"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AdminNotice from "@/components/admin/AdminNotice";
import AdminModal from "@/components/admin/AdminModal";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { Button, Input } from "@/components/admin/AdminControls";
import { THEME_PRESETS } from "@/lib/themePresets";
import { Sparkles, Check } from "lucide-react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function rgbToHex(rgb) {
  return "#" + rgb.map(x => x.toString(16).padStart(2, '0')).join('');
}

function ColorField({ label, value, onChange, hint }) {
  const v = String(value || "");
  const isHex = /^#([0-9a-fA-F]{6})$/.test(v.trim());
  return (
    <div>
      <div className="text-sm font-semibold text-slate-700">{label}</div>
      {hint ? <div className="mt-0.5 text-xs text-slate-500">{hint}</div> : null}
      <div className="mt-2 flex items-center gap-2">
        <div className="h-11 w-11 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <input
            type="color"
            className="h-full w-full cursor-pointer rounded-lg border-none p-0"
            value={isHex ? v : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} picker`}
          />
        </div>
        <Input value={v} onChange={(e) => onChange(e.target.value)} placeholder="#RRGGBB" className="font-mono" />
      </div>
    </div>
  );
}

const DEFAULT_TOKENS = {
  primary: "#0f172a",
  accent: "#2563eb",
  logoUrl: "",
  faviconUrl: "",
};

export default function AdminThemePage() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const [tokens, setTokens] = useState(DEFAULT_TOKENS);
  const baselineRef = useRef(DEFAULT_TOKENS);
  const [activePreset, setActivePreset] = useState(null);

  const [resetOpen, setResetOpen] = useState(false);

  const dirty = useMemo(() => {
    return JSON.stringify(tokens) !== JSON.stringify(baselineRef.current);
  }, [tokens]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/theme", { cache: "no-store" });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Failed to load theme.");

      const t = j?.theme?.tokens || {};
      const next = {
        primary: t.primary || DEFAULT_TOKENS.primary,
        accent: t.accent || DEFAULT_TOKENS.accent,
        logoUrl: t.logoUrl || "",
        faviconUrl: t.faviconUrl || "",
      };
      setTokens(next);
      baselineRef.current = next;
    } catch (e) {
      setNotice({ tone: "danger", title: "Error", message: e.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function applyPreset(preset) {
    const next = {
      ...tokens,
      primary: rgbToHex(preset.colors.a),
      accent: rgbToHex(preset.colors.b),
    };
    setTokens(next);
    setActivePreset(preset.id);
  }

  async function save() {
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Save failed.");

      baselineRef.current = tokens;
      setNotice({ tone: "success", title: "Saved", message: "Global theme updated." });
    } catch (e) {
      setNotice({ tone: "danger", title: "Error", message: e.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <AdminPageHeader 
        title="Theme & Brand" 
        subtitle="Control the look and feel of the platform."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Token Editor */}
        <div className="lg:col-span-4 space-y-6">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-900 text-lg">Colors</h3>
                {dirty && (
                   <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse">Unsaved</span>
                )}
              </div>
              
              <div className="space-y-5">
                <ColorField
                  label="Primary Brand"
                  value={tokens.primary}
                  onChange={(v) => { setTokens((t) => ({ ...t, primary: v })); setActivePreset(null); }}
                  hint="Buttons, active states, key highlights."
                />
                <ColorField
                  label="Secondary Accent"
                  value={tokens.accent}
                  onChange={(v) => { setTokens((t) => ({ ...t, accent: v })); setActivePreset(null); }}
                  hint="Gradients, secondary actions, fun pops."
                />
              </div>

              <hr className="my-6 border-slate-100" />

              <h3 className="font-bold text-slate-900 text-lg mb-4">Assets</h3>
              <div className="space-y-4">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Logo URL</label>
                    <Input 
                      placeholder="https://..." 
                      value={tokens.logoUrl} 
                      onChange={(e) => setTokens(t => ({ ...t, logoUrl: e.target.value }))}
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Favicon URL</label>
                    <Input 
                      placeholder="https://..." 
                      value={tokens.faviconUrl} 
                      onChange={(e) => setTokens(t => ({ ...t, faviconUrl: e.target.value }))}
                    />
                 </div>
              </div>

              <div className="mt-8 flex gap-2">
                 <Button onClick={save} disabled={busy || !dirty} className="w-full h-12 shadow-md">
                   {busy ? "Saving..." : "Save Changes"}
                 </Button>
                 <Button onClick={() => setResetOpen(true)} tone="ghost" disabled={busy} className="w-auto h-12 border-2">
                   Reset
                 </Button>
              </div>
           </div>
           
           {notice && (
             <AdminNotice tone={notice.tone} title={notice.title}>{notice.message}</AdminNotice>
           )}
        </div>

        {/* Right: Theme Gallery & Preview */}
        <div className="lg:col-span-8 space-y-6">
           {/* Preview Card */}
           <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-slate-50 border-b border-slate-100" />
              <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
                 <div className="w-full md:w-1/2 space-y-4">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Live Preview</div>
                    <div className="bg-white p-5 rounded-3xl shadow-xl border border-slate-100">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-md" style={{ background: tokens.primary }}>SK</div>
                          <div>
                             <div className="h-3 w-24 bg-slate-100 rounded-full mb-1.5" />
                             <div className="h-2 w-16 bg-slate-100 rounded-full" />
                          </div>
                       </div>
                       <div className="h-24 rounded-2xl mb-4 relative overflow-hidden">
                          <div className="absolute inset-0 opacity-20" style={{ background: `linear-gradient(135deg, ${tokens.primary}, ${tokens.accent})` }} />
                          <div className="absolute inset-0 flex items-center justify-center">
                             <Sparkles className="w-8 h-8 text-slate-900/20" />
                          </div>
                       </div>
                       <div className="flex gap-2">
                          <button className="flex-1 h-10 rounded-xl text-white font-bold text-sm shadow-md" style={{ background: tokens.primary }}>Primary</button>
                          <button className="flex-1 h-10 rounded-xl text-white font-bold text-sm shadow-md" style={{ background: tokens.accent }}>Accent</button>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Gallery */}
           <div className="space-y-4">
              <div className="flex items-center justify-between">
                 <h3 className="font-bold text-slate-900 text-lg">Theme Gallery</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                 {THEME_PRESETS.map(p => {
                    const isSelected = activePreset === p.id;
                    const p1 = rgbToHex(p.colors.a);
                    const p2 = rgbToHex(p.colors.b);
                    return (
                      <button
                        key={p.id}
                        onClick={() => applyPreset(p)}
                        className={cx(
                           "group relative flex flex-col items-center p-3 rounded-2xl border-2 transition-all hover:-translate-y-1",
                           isSelected ? "border-slate-900 bg-slate-50 shadow-md" : "border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm"
                        )}
                      >
                         <div className="w-full aspect-[4/3] rounded-xl mb-3 relative overflow-hidden">
                            <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${p1}, ${p2})` }} />
                            <div className="absolute inset-0 flex items-center justify-center text-3xl drop-shadow-md group-hover:scale-110 transition-transform">{p.emoji}</div>
                         </div>
                         <div className="font-bold text-slate-700 text-sm">{p.name}</div>
                         {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center">
                               <Check className="w-3 h-3 text-white" />
                            </div>
                         )}
                      </button>
                    );
                 })}
              </div>
           </div>
        </div>
      </div>

      <AdminModal
        open={resetOpen}
        title="Reset to Defaults?"
        desc="This will discard all customizations."
        onClose={() => setResetOpen(false)}
      >
         <div className="flex justify-end gap-2 mt-4">
            <Button tone="secondary" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button tone="danger" onClick={() => { setTokens(DEFAULT_TOKENS); setResetOpen(false); }}>Confirm Reset</Button>
         </div>
      </AdminModal>
    </div>
  );
}