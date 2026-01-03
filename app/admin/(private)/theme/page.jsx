"use client";

import { useEffect, useState } from "react";

export default function AdminThemePage() {
  const [tokens, setTokens] = useState({ primary: "#0f172a", accent: "#2563eb", logoUrl: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    setMsg("");
    const res = await fetch("/api/admin/theme", { cache: "no-store" });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Failed to load");
    const t = j?.theme?.tokens || {};
    setTokens({
      primary: t.primary || "#0f172a",
      accent: t.accent || "#2563eb",
      logoUrl: t.logoUrl || "",
      faviconUrl: t.faviconUrl || "",
    });
  }

  useEffect(() => { load().catch((e) => setMsg(e.message)); }, []);

  async function save() {
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tokens }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Save failed");
      setMsg("Saved.");
    } catch (e) {
      setMsg(e.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6">
      <div>
        <div className="text-xl font-semibold">Theme</div>
        <div className="text-sm text-slate-500 mt-1">
          Store global design tokens. You can wire these into Tailwind via CSS variables if you want runtime theming.
        </div>
      </div>

      {msg ? <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">{msg}</div> : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="font-semibold">Brand</div>
          <div className="mt-3 grid gap-3">
            <label className="text-sm">
              <div className="font-medium mb-1">Primary color</div>
              <input className="h-10 w-full rounded-xl border border-slate-200 px-3" value={tokens.primary} onChange={(e)=>setTokens({ ...tokens, primary: e.target.value })} />
            </label>
            <label className="text-sm">
              <div className="font-medium mb-1">Accent color</div>
              <input className="h-10 w-full rounded-xl border border-slate-200 px-3" value={tokens.accent} onChange={(e)=>setTokens({ ...tokens, accent: e.target.value })} />
            </label>
            <label className="text-sm">
              <div className="font-medium mb-1">Logo URL</div>
              <input className="h-10 w-full rounded-xl border border-slate-200 px-3" placeholder="https://..." value={tokens.logoUrl} onChange={(e)=>setTokens({ ...tokens, logoUrl: e.target.value })} />
            </label>
            <label className="text-sm">
              <div className="font-medium mb-1">Favicon URL</div>
              <input className="h-10 w-full rounded-xl border border-slate-200 px-3" placeholder="https://..." value={tokens.faviconUrl} onChange={(e)=>setTokens({ ...tokens, faviconUrl: e.target.value })} />
            </label>
          </div>
          <button className="mt-4 h-10 rounded-xl bg-slate-900 text-white px-4 hover:bg-slate-800 disabled:opacity-60" onClick={save} disabled={busy}>
            Save theme
          </button>
        </div>

        <div className="rounded-2xl border border-slate-200 p-4">
          <div className="font-semibold">Preview</div>
          <div className="mt-3 rounded-2xl border border-slate-200 p-4" style={{ borderColor: tokens.accent }}>
            <div className="text-sm text-slate-500">Example button</div>
            <button className="mt-3 h-10 rounded-xl px-4 text-white" style={{ background: tokens.primary }}>
              Primary
            </button>
            <button className="mt-3 ml-2 h-10 rounded-xl px-4 text-white" style={{ background: tokens.accent }}>
              Accent
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
