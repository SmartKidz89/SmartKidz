"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Github, ShieldAlert, CloudUpload, CheckCircle2, Copy } from "lucide-react";
import AdminNotice from "@/components/admin/AdminNotice";
import AdminModal from "@/components/admin/AdminModal";
import { cx } from "@/components/admin/adminUi";
import { Button, Input } from "@/components/admin/AdminControls";
import { useAdminMe } from "@/components/admin/useAdminMe";

function StatusPill({ ready }) {
  if (ready) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
        <CheckCircle2 className="h-4 w-4" /> Ready
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800">
      <ShieldAlert className="h-4 w-4" /> Needs setup
    </span>
  );
}

function fmtIso(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString();
}

export default function AdminGitHubPage() {
  const me = useAdminMe();
  const isRoot = me.role === "root";

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null); // { tone, title, message }
  const [status, setStatus] = useState(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmPhrase, setConfirmPhrase] = useState("");

  const ready = useMemo(() => {
    const missing = status?.missing || [];
    return missing.length === 0;
  }, [status]);

  async function refresh() {
    setLoading(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/github-sync", { method: "GET", cache: "no-store" });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Failed to load status");
      setStatus(j);
    } catch (e) {
      setNotice({ tone: "danger", title: "Status failed", message: e?.message || "Failed to load status." });
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openSyncConfirm() {
    if (!isRoot) {
      setNotice({
        tone: "warning",
        title: "Root required",
        message: "GitHub sync is restricted to root admins.",
      });
      return;
    }
    if (!ready) {
      setNotice({
        tone: "warning",
        title: "Configuration required",
        message: "Set the required environment variables before syncing.",
      });
      return;
    }
    setConfirmPhrase("");
    setConfirmOpen(true);
  }

  async function runSync() {
    if (String(confirmPhrase || "").trim().toUpperCase() !== "SYNC") {
      setNotice({ tone: "warning", title: "Confirmation required", message: "Type SYNC to proceed." });
      return;
    }
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch("/api/admin/github-sync", { method: "POST" });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Sync failed");
      setConfirmOpen(false);
      setNotice({
        tone: "success",
        title: "Sync complete",
        message: `Synced to ${j.repo}:${j.branch} at ${j.path} (${fmtIso(j.at)})`,
      });
      await refresh();
    } catch (e) {
      setNotice({ tone: "danger", title: "Sync failed", message: e?.message || "Sync failed." });
    } finally {
      setBusy(false);
    }
  }

  function copy(text) {
    try {
      navigator.clipboard.writeText(String(text || ""));
      setNotice({ tone: "success", title: "Copied", message: "Copied to clipboard." });
    } catch {
      setNotice({ tone: "danger", title: "Copy failed", message: "Clipboard access was blocked by the browser." });
    }
  }

  const env = status?.env || {};
  const missing = status?.missing || [];
  const last = status?.lastSync || null;

  return (
    <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
              <Github className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xl font-semibold">GitHub Sync</div>
              <div className="text-sm text-slate-500 mt-1">
                Exports a CMS snapshot to your GitHub repository. Root-only sync; status is visible to admins.
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <StatusPill ready={ready} />
          <Button tone="ghost" onClick={refresh} disabled={loading || busy}>
            <RefreshCw className={cx("h-4 w-4", loading ? "animate-spin" : "")} />
            Refresh
          </Button>
          <Button onClick={openSyncConfirm} disabled={busy || loading || !isRoot}>
            <CloudUpload className="h-4 w-4" />
            {busy ? "Syncing…" : "Sync now"}
          </Button>
        </div>
      </div>

      {notice ? (
        <div className="mt-4">
          <AdminNotice tone={notice.tone} title={notice.title}>
            {notice.message}
          </AdminNotice>
        </div>
      ) : null}

      {!loading && missing.length ? (
        <div className="mt-4">
          <AdminNotice tone="warning" title="Missing configuration">
            The following environment variables are required before sync can run: {missing.join(", ")}.
          </AdminNotice>
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Last sync</div>
          <div className="mt-1 text-xs text-slate-500">Stored in cms_settings (key: github_sync).</div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-200 p-3">
              <div className="text-xs text-slate-500">Repository</div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <div className="text-sm font-medium truncate">{last?.repo || "—"}</div>
                {last?.repo ? (
                  <button
                    className="h-8 w-8 rounded-xl border border-slate-200 hover:bg-slate-50"
                    onClick={() => copy(last.repo)}
                    aria-label="Copy repo"
                  >
                    <Copy className="h-4 w-4 mx-auto" />
                  </button>
                ) : null}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3">
              <div className="text-xs text-slate-500">Snapshot path</div>
              <div className="mt-1 text-sm font-medium truncate">{last?.path || "—"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3">
              <div className="text-xs text-slate-500">Branch</div>
              <div className="mt-1 text-sm font-medium">{last?.branch || "—"}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 p-3">
              <div className="text-xs text-slate-500">When / Actor</div>
              <div className="mt-1 text-sm font-medium">{fmtIso(last?.at)}</div>
              <div className="mt-0.5 text-xs text-slate-500">{last?.actor ? `by ${last.actor}` : ""}</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="text-sm font-semibold">Environment</div>
          <div className="mt-1 text-xs text-slate-500">
            These are read from server env vars. Token value is never shown.
          </div>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
              <div>
                <div className="text-xs text-slate-500">GITHUB_SYNC_REPO</div>
                <div className="font-medium truncate max-w-[220px]">{env.repo || "—"}</div>
              </div>
              <span className={cx("text-xs font-medium", env.repo ? "text-emerald-700" : "text-amber-700")}>
                {env.repo ? "Set" : "Missing"}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
              <div>
                <div className="text-xs text-slate-500">GITHUB_SYNC_BRANCH</div>
                <div className="font-medium">{env.branch || "main"}</div>
              </div>
              <span className="text-xs font-medium text-slate-600">Optional</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
              <div>
                <div className="text-xs text-slate-500">GITHUB_SYNC_PATH_PREFIX</div>
                <div className="font-medium truncate max-w-[220px]">{env.prefix || "cms-export"}</div>
              </div>
              <span className="text-xs font-medium text-slate-600">Optional</span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2">
              <div>
                <div className="text-xs text-slate-500">GITHUB_SYNC_TOKEN</div>
                <div className="font-medium">{env.tokenConfigured ? "Configured" : "Not configured"}</div>
              </div>
              <span className={cx("text-xs font-medium", env.tokenConfigured ? "text-emerald-700" : "text-amber-700")}>
                {env.tokenConfigured ? "Set" : "Missing"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold">Operational notes</div>
        <div className="mt-2 text-sm text-slate-600 space-y-1">
          <div>• Sync writes <span className="font-mono">snapshot.json</span> to your configured repo/path.</div>
          <div>• Your deployment platform will rebuild if it watches the branch (e.g., Vercel Git integration).</div>
          <div>• All sync actions are logged in the audit log.</div>
        </div>
      </div>

      <AdminModal
        open={confirmOpen}
        title="Confirm GitHub sync"
        desc="This will export the current CMS snapshot and commit it to GitHub. Type SYNC to proceed."
        onClose={() => (!busy ? setConfirmOpen(false) : null)}
      >
        <div className="space-y-3">
          <AdminNotice tone="warning" title="Root-only action">
            Sync will commit changes to your repository. Ensure you are targeting the correct repo/branch.
          </AdminNotice>
          <div>
            <div className="text-xs font-medium text-slate-600">Type SYNC</div>
            <Input value={confirmPhrase} onChange={(e) => setConfirmPhrase(e.target.value)} placeholder="SYNC" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button tone="ghost" onClick={() => setConfirmOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={runSync} disabled={busy}>
              <CloudUpload className="h-4 w-4" />
              {busy ? "Syncing…" : "Run sync"}
            </Button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
