"use client";

import { useState } from "react";

export default function AdminDatabasePage() {
  const [sql, setSql] = useState("select now();");
  const [allowMutations, setAllowMutations] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  async function run() {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, allowMutations }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Query failed");
      setResult(j);
    } catch (e) {
      setError(e.message || "Query failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="p-6">
      <div>
        <div className="text-xl font-semibold">Database (SQL)</div>
        <div className="text-sm text-slate-500 mt-1">
          Root-only SQL runner against your Supabase Postgres. Use with extreme care.
        </div>
      </div>

      {error ? <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

      <div className="mt-6 rounded-2xl border border-slate-200 p-4">
        <textarea
          className="w-full min-h-[220px] rounded-2xl border border-slate-200 p-3 font-mono text-sm outline-none focus:ring-2 focus:ring-slate-200"
          value={sql}
          onChange={(e) => setSql(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={allowMutations} onChange={(e)=>setAllowMutations(e.target.checked)} />
            Allow mutations (INSERT/UPDATE/DELETE/DDL)
          </label>
          <button className="h-10 rounded-xl bg-slate-900 text-white px-4 hover:bg-slate-800 disabled:opacity-60" onClick={run} disabled={busy}>
            {busy ? "Running…" : "Run SQL"}
          </button>
        </div>
      </div>

      {result ? (
        <div className="mt-6 rounded-2xl border border-slate-200 p-4 overflow-x-auto">
          <div className="text-sm text-slate-500">
            {result.command} • {result.rowCount} row(s) • {result.elapsedMs}ms
          </div>
          <table className="mt-3 min-w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr>
                {(result.fields || []).map((f) => (
                  <th key={f.name} className="py-2 pr-4">{f.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(result.rows || []).slice(0, 200).map((row, idx) => (
                <tr key={idx} className="border-t border-slate-100">
                  {(result.fields || []).map((f) => (
                    <td key={f.name} className="py-2 pr-4 align-top">
                      <div className="max-w-[420px] break-words whitespace-pre-wrap text-xs font-mono">
                        {typeof row[f.name] === "object" ? JSON.stringify(row[f.name], null, 2) : String(row[f.name])}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {(result.rows || []).length > 200 ? <div className="mt-2 text-xs text-slate-500">Showing first 200 rows.</div> : null}
        </div>
      ) : null}
    </div>
  );
}
