"use client";

import { useEffect, useState } from "react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    const res = await fetch("/api/admin/audit?limit=200", { cache: "no-store" });
    const j = await res.json();
    if (!res.ok) throw new Error(j?.error || "Failed to load audit");
    setLogs(j.logs || []);
  }

  useEffect(() => { load().catch((e)=>setMsg(e.message)); }, []);

  return (
    <div className="p-6">
      <div>
        <div className="text-xl font-semibold">Audit Log</div>
        <div className="text-sm text-slate-500 mt-1">Root-only record of admin actions.</div>
      </div>

      {msg ? <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">{msg}</div> : null}

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="text-left text-slate-500">
            <tr>
              <th className="py-2 pr-3">Time</th>
              <th className="py-2 pr-3">Actor</th>
              <th className="py-2 pr-3">Action</th>
              <th className="py-2 pr-3">Entity</th>
              <th className="py-2 pr-3">Meta</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} className="border-t border-slate-100">
                <td className="py-2 pr-3 text-xs text-slate-500 whitespace-nowrap">{l.created_at}</td>
                <td className="py-2 pr-3">{l.actor || "-"}</td>
                <td className="py-2 pr-3">{l.action}</td>
                <td className="py-2 pr-3">{l.entity}</td>
                <td className="py-2 pr-3">
                  <pre className="text-xs font-mono whitespace-pre-wrap max-w-[520px]">{JSON.stringify(l.meta || {}, null, 2)}</pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 ? <div className="mt-4 text-sm text-slate-500">No audit entries.</div> : null}
      </div>
    </div>
  );
}
