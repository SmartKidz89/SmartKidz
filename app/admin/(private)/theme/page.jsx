"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import AdminNotice from "@/components/admin/AdminNotice";
import AdminModal from "@/components/admin/AdminModal";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

function Button({ children, tone = "primary", className, ...props }) {
  const base =
    "rounded-xl px-3 py-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed";
  const toneCls =
    tone === "primary"
      ? "bg-slate-900 text-white hover:bg-slate-800"
      : tone === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-500"
      : "bg-white border border-slate-200 hover:bg-slate-50";
  return (
    <button className={cx(base, toneCls, className)} {...props}>
      {children}
    </button>
  );
}

function Input({ className, ...props }) {
  return (
    <input
      className={cx(
        "h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-200",
        className
      )}
      {...props}
    />
  );
}

function ColorField({ label, value, onChange, hint }) {
  const v = String(value || "");
  const isHex = /^#([0-9a-fA-F]{6})$/.test(v.trim());
  return (
    <div>
      <div className="text-sm font-medium">{label}</div>
      {hint ? <div className="mt-0.5 text-xs text-slate-500">{hint}</div> : null}
      <div className="mt-2 flex items-center gap-2">
        <div className="h-10 w-10 rounded-xl border border-slate-200 bg-white p-1">
          <input
            type="color"
            className="h-full w-full cursor-pointer rounded-lg"
            value={isHex ? v : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} picker`}
          />
        </div>
        <Input value={v} onChange={(e) => onChange(e.target.value)} placeholder="#RRGGBB" />
      </div>
    </div>
  );
}

function StatusPill({ dirty, saving }) {
  if (saving) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
        Saving…
      </span>
    );
  }
  if (dirty) {
    return (
      <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
        Unsaved changes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
      Saved
    </span>
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
  const [notice, setNotice] = useState(null); // { tone, title, message }

  const [tokens, setTokens] = useState(DEFAULT_TOKENS);
  const baselineRef = useRef(DEFAULT_TOKENS);

  const [resetOpen, setResetOpen] = useState(false);

  const dirty = useMemo(() => {
    return JSON.stringify(tokens) !== JSON.stringify(baselineRef.current);
  }, [tokens]);

  async function load() {
    setLoading(true);
    setNotice(null);
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
      setNotice({ tone: "danger", title: "Load failed", message: e.message || String(e) });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

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

      const t = j?.theme?.tokens || tokens;
      const next = {
        primary: t.primary || DEFAULT_TOKENS.primary,
        accent: t.accent || DEFAULT_TOKENS.accent,
        logoUrl: t.logoUrl || "",
        faviconUrl: t.faviconUrl || "",
      };
      setTokens(next);
      baselineRef.current = next;
      setNotice({ tone: "success", title: "Saved", message: "Theme tokens updated." });
    } catch (e) {
      setNotice({ tone: "danger", title: "Save failed", message: e.message || String(e) });
    } finally {
      setBusy(false);
    }
  }

  function resetToDefault() {
    setTokens(DEFAULT_TOKENS);
    setResetOpen(false);
    setNotice({ tone: "info", title: "Reset staged", message: "Defaults applied locally. Click Save to persist." });
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xl font-semibold">Theme</div>
          <div className="mt-1 text-sm text-slate-500">
            Global brand tokens used across marketing + app surfaces.
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill dirty={dirty} saving={busy} />
          <Button tone="secondary" onClick={load} disabled={busy || loading}>
            Reload
          </Button>
          <Button tone="secondary" onClick={() => setResetOpen(true)} disabled={busy || loading}>
            Reset
          </Button>
          <Button onClick={save} disabled={busy || loading || !dirty}>
            Save changes
          </Button>
        </div>
      </div>

      {notice ? (
        <AdminNotice className="mt-4" tone={notice.tone} title={notice.title}>
          {notice.message}
        </AdminNotice>
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Brand tokens</div>
              <div className="mt-1 text-xs text-slate-500">
                Use hex colors for consistency. URLs may point to public assets or Supabase Storage.
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-5">
            <ColorField
              label="Primary color"
              value={tokens.primary}
              onChange={(v) => setTokens((t) => ({ ...t, primary: v }))}
              hint="Used for primary buttons and emphasis."
            />
            <ColorField
              label="Accent color"
              value={tokens.accent}
              onChange={(v) => setTokens((t) => ({ ...t, accent: v }))}
              hint="Used for borders, highlights, and secondary accents."
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm font-medium">Logo URL</div>
                <div className="mt-0.5 text-xs text-slate-500">Displayed in header and admin surfaces.</div>
                <div className="mt-2">
                  <Input
                    placeholder="https://…"
                    value={tokens.logoUrl || ""}
                    onChange={(e) => setTokens((t) => ({ ...t, logoUrl: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <div className="text-sm font-medium">Favicon URL</div>
                <div className="mt-0.5 text-xs text-slate-500">Browser tab icon for the public site.</div>
                <div className="mt-2">
                  <Input
                    placeholder="https://…"
                    value={tokens.faviconUrl || ""}
                    onChange={(e) => setTokens((t) => ({ ...t, faviconUrl: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-sm font-semibold">Notes</div>
              <div className="mt-1 text-sm text-slate-600">
                These values are stored in <span className="font-medium">cms_theme</span> (scope: global). The runtime
                wiring (e.g., CSS variables) can be added later without changing the admin model.
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Preview</div>
          <div className="mt-1 text-xs text-slate-500">Representative UI elements rendered with current tokens.</div>

          <div className="mt-4 rounded-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3" style={{ background: tokens.primary }}>
              <div className="flex items-center gap-3">
                <div
                  className="h-9 w-9 rounded-xl border border-white/20 bg-white/10 flex items-center justify-center overflow-hidden"
                  aria-label="Logo preview"
                >
                  {tokens.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tokens.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-semibold text-white/80">LOGO</span>
                  )}
                </div>
                <div className="text-sm font-semibold text-white">Brand Header</div>
              </div>
              <div className="text-xs text-white/70">Preview</div>
            </div>

            <div className="p-4 bg-white">
              <div className="text-sm text-slate-700">Buttons</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="h-10 rounded-xl px-4 text-sm font-medium text-white"
                  style={{ background: tokens.primary }}
                >
                  Primary
                </button>
                <button
                  className="h-10 rounded-xl px-4 text-sm font-medium text-white"
                  style={{ background: tokens.accent }}
                >
                  Accent
                </button>
                <button className="h-10 rounded-xl px-4 text-sm font-medium border border-slate-200 bg-white">
                  Secondary
                </button>
              </div>

              <div className="mt-5 text-sm text-slate-700">Card + Accent</div>
              <div className="mt-2 rounded-2xl border border-slate-200 p-4" style={{ borderColor: tokens.accent }}>
                <div className="text-sm font-semibold">Example card</div>
                <div className="mt-1 text-sm text-slate-600">
                  Accent border demonstrates how highlight surfaces will render.
                </div>
              </div>

              <div className="mt-5 text-sm text-slate-700">Favicon</div>
              <div className="mt-2 flex items-center gap-2">
                <div className="h-10 w-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden">
                  {tokens.faviconUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={tokens.faviconUrl} alt="Favicon" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs text-slate-500">N/A</span>
                  )}
                </div>
                {tokens.faviconUrl ? (
                  <a
                    href={tokens.faviconUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-slate-900 underline decoration-slate-300 underline-offset-2 hover:decoration-slate-500"
                  >
                    Open
                  </a>
                ) : (
                  <span className="text-sm text-slate-500">No favicon URL set</span>
                )}
              </div>
            </div>
          </div>

          {dirty ? (
            <div className="mt-4 text-xs text-slate-500">
              Preview reflects local edits. Save changes to update what the public site reads from the database.
            </div>
          ) : null}
        </div>
      </div>

      <AdminModal
        open={resetOpen}
        title="Reset theme tokens?"
        desc="This will revert local values back to defaults. You can still cancel by closing this modal."
        onClose={() => setResetOpen(false)}
      >
        <div className="text-sm text-slate-600">
          Defaults:
          <div className="mt-2 grid gap-1 text-xs text-slate-700">
            <div>
              Primary: <span className="font-mono">{DEFAULT_TOKENS.primary}</span>
            </div>
            <div>
              Accent: <span className="font-mono">{DEFAULT_TOKENS.accent}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button tone="secondary" onClick={() => setResetOpen(false)}>
            Cancel
          </Button>
          <Button tone="danger" onClick={resetToDefault}>
            Reset
          </Button>
        </div>
      </AdminModal>
    </div>
  );
}
