"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [redirects, setRedirects] = useState([]);
  const [msg, setMsg] = useState("");

  async function loadRedirects() {
    const res = await fetch("/api/admin/redirects", { cache: "no-store" });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Failed to load redirects");
    setRedirects(j.redirects || []);
  }

  useEffect(() => { loadRedirects().catch((e)=>setMsg(e.message)); }, []);

  async function upsertRedirect(r) {
    setMsg("");
    const res = await fetch("/api/admin/redirects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(r),
    });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Save failed");
    setMsg("Saved.");
    await loadRedirects();
  }

  async function addRedirect() {
    const from_path = (prompt("From path? (e.g., /old)") || "").trim();
    if (!from_path) return;
    const to_path = (prompt("To path? (e.g., /new)") || "").trim();
    if (!to_path) return;
    await upsertRedirect({ from_path, to_path, status: 301, is_active: true });
  }

  async function remove(id) {
    if (!confirm("Delete redirect? (root only)")) return;
    setMsg("");
    const res = await fetch(`/api/admin/redirects?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Delete failed");
    setMsg("Deleted.");
    await loadRedirects();
  }

  return (
    <div className="p-6">
      <div>
        <div className="text-xl font-semibold">Settings</div>
        <div className="text-sm text-slate-500 mt-1">
          Operational settings for the Admin Console.
        </div>
      </div>

      {msg ? <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">{msg}</div> : null}

      <div className="mt-6 grid gap-6">
        <section className="rounded-2xl border border-slate-200 p-4">
          <div className="font-semibold">LLM (Llama) configuration</div>
          <div className="mt-2 text-sm text-slate-600">
            The “AI draft” button uses an OpenAI-compatible endpoint. Configure these server env vars in Vercel:
            <ul className="list-disc ml-6 mt-2">
              <li><span className="font-mono">LLM_BASE_URL</span> (example: <span className="font-mono">https://your-llama-host/v1</span>)</li>
              <li><span className="font-mono">LLM_API_KEY</span> (optional)</li>
              <li><span className="font-mono">LLM_MODEL</span> (example: <span className="font-mono">llama-3.1-70b-instruct</span>)</li>
            </ul>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold">Redirects</div>
              <div className="text-sm text-slate-500 mt-1">
                Keep links working when you rename/delete pages.
              </div>
            </div>
            <button className="h-10 rounded-xl bg-slate-900 text-white px-4 hover:bg-slate-800" onClick={addRedirect}>
              Add redirect
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2 pr-3">From</th>
                  <th className="py-2 pr-3">To</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Active</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {redirects.map((r) => (
                  <tr key={r.id} className="border-t border-slate-100">
                    <td className="py-2 pr-3">
                      <input className="h-9 w-64 rounded-lg border border-slate-200 px-2" defaultValue={r.from_path} onBlur={(e)=>upsertRedirect({ ...r, from_path: e.target.value })} />
                    </td>
                    <td className="py-2 pr-3">
                      <input className="h-9 w-64 rounded-lg border border-slate-200 px-2" defaultValue={r.to_path} onBlur={(e)=>upsertRedirect({ ...r, to_path: e.target.value })} />
                    </td>
                    <td className="py-2 pr-3">
                      <select className="h-9 rounded-lg border border-slate-200 px-2 bg-white" defaultValue={r.status || 301} onChange={(e)=>upsertRedirect({ ...r, status: Number(e.target.value) })}>
                        <option value={301}>301</option>
                        <option value={302}>302</option>
                      </select>
                    </td>
                    <td className="py-2 pr-3">
                      <input type="checkbox" defaultChecked={r.is_active !== false} onChange={(e)=>upsertRedirect({ ...r, is_active: e.target.checked })} />
                    </td>
                    <td className="py-2 pr-3">
                      <button className="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50" onClick={()=>remove(r.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {redirects.length === 0 ? <div className="mt-4 text-sm text-slate-500">No redirects yet.</div> : null}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-4">
          <div className="font-semibold">Bootstrap root admin</div>
          <div className="mt-2 text-sm text-slate-600">
            Create the first root admin by calling <span className="font-mono">POST /api/admin-auth/bootstrap</span> with header <span className="font-mono">x-bootstrap-token</span> set to <span className="font-mono">ADMIN_BOOTSTRAP_TOKEN</span>. See README_ADMIN.md in the repo for exact curl.
          </div>
        </section>
      </div>
    </div>
  );
}
