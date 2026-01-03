"use client";

import { useState } from "react";

export default function AdminGitHubPage() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function sync() {
    if (!confirm("Sync CMS snapshot to GitHub and trigger Vercel rebuild? (root only)")) return;
    setBusy(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin/github-sync", { method: "POST" });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Sync failed");
      setMsg(`Synced to ${j.repo}:${j.branch} at ${j.path} (${j.at})`);
    } catch (e) {
      setMsg(e.message || "Sync failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6">
      <div>
        <div className="text-xl font-semibold">GitHub Sync</div>
        <div className="text-sm text-slate-500 mt-1">
          Root-only. Exports the CMS snapshot to your GitHub repo via API. Vercel will rebuild from the commit.
        </div>
      </div>

      {msg ? <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">{msg}</div> : null}

      <div className="mt-6 rounded-2xl border border-slate-200 p-4">
        <div className="text-sm text-slate-700">
          Requires server env vars:
          <ul className="list-disc ml-6 mt-2 text-slate-600">
            <li><span className="font-mono">GITHUB_SYNC_TOKEN</span> (repo scope)</li>
            <li><span className="font-mono">GITHUB_SYNC_REPO</span> (owner/repo)</li>
            <li><span className="font-mono">GITHUB_SYNC_BRANCH</span> (optional, default main)</li>
            <li><span className="font-mono">GITHUB_SYNC_PATH_PREFIX</span> (optional, default cms-export)</li>
          </ul>
        </div>
        <button className="mt-4 h-10 rounded-xl bg-slate-900 text-white px-4 hover:bg-slate-800 disabled:opacity-60" onClick={sync} disabled={busy}>
          {busy ? "Syncing…" : "Sync now"}
        </button>
      </div>
    </div>
  );
}
