"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Play, Database, Table as TableIcon, RefreshCw, 
  Terminal, Search, Copy, Check, ChevronRight, Hash, AlertTriangle, Download, FileJson
} from "lucide-react";
import { Button } from "@/components/admin/AdminControls";
import AdminPageHeader from "@/components/admin/AdminPageHeader";
import { cx } from "@/components/admin/adminUi";
import AdminNotice from "@/components/admin/AdminNotice";

function ResultTable({ result }) {
  if (!result || !result.rows || result.rows.length === 0) {
    return <div className="p-8 text-center text-slate-400 text-sm">No results returned.</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            {result.fields.map((f) => (
              <th key={f.name} className="px-4 py-3 font-bold text-slate-700 text-xs uppercase tracking-wider">
                {f.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {result.rows.map((row, i) => (
            <tr key={i} className="hover:bg-slate-50 transition-colors">
              {result.fields.map((f) => {
                const val = row[f.name];
                let display = val;
                if (typeof val === "object" && val !== null) display = JSON.stringify(val);
                if (val === null) display = <span className="text-slate-300 italic">null</span>;
                
                return (
                  <td key={f.name} className="px-4 py-2 text-slate-600 font-mono text-xs max-w-[300px] truncate" title={String(val)}>
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDatabasePage() {
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [query, setQuery] = useState("SELECT * FROM profiles LIMIT 10;");
  const [status, setStatus] = useState("idle"); // idle, running, success, error
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [searchTable, setSearchTable] = useState("");
  const [copyFeedback, setCopyFeedback] = useState(null);

  // Load Schema
  async function loadSchema() {
    setLoadingTables(true);
    try {
      const res = await fetch("/api/admin/database/tables");
      const data = await res.json();
      if(data.tables) setTables(data.tables);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTables(false);
    }
  }

  useEffect(() => { loadSchema(); }, []);

  // Run SQL
  async function runQuery(sqlOverride) {
    const sqlToRun = sqlOverride || query;
    if (!sqlToRun.trim()) return;

    setStatus("running");
    setResult(null);
    setErrorMsg(null);
    setCopyFeedback(null);
    setQuery(sqlToRun); // Update editor if we clicked a sidebar item

    try {
      const res = await fetch("/api/admin/sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlToRun, allowMutations: true }), // Allow admins to run updates
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Query failed");
      
      setResult(data);
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setErrorMsg(e.message);
    }
  }

  const filteredTables = tables.filter(t => t.table_name.toLowerCase().includes(searchTable.toLowerCase()));

  // Friendly error hint
  const isConnectionError = errorMsg && (errorMsg.includes("ENOTFOUND") || errorMsg.includes("ECONNREFUSED") || errorMsg.includes("5432"));

  function downloadCSV() {
    if (!result?.rows) return;
    const headers = result.fields.map(f => f.name);
    const csv = [
      headers.join(","),
      ...result.rows.map(row => headers.map(fieldName => {
        const v = row[fieldName];
        if (v === null || v === undefined) return "";
        const s = String(typeof v === 'object' ? JSON.stringify(v) : v);
        // Escape quotes
        return `"${s.replace(/"/g, '""')}"`;
      }).join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query_result_${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function copyJSON() {
    if (!result?.rows) return;
    navigator.clipboard.writeText(JSON.stringify(result.rows, null, 2));
    setCopyFeedback("Copied!");
    setTimeout(() => setCopyFeedback(null), 2000);
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-slate-50/50 -m-4 md:-m-8">
      
      {/* 1. Toolbar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
           <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
              <Database className="w-5 h-5" />
           </div>
           <div>
              <h1 className="text-lg font-black text-slate-900 leading-none">SQL Studio</h1>
              <div className="text-xs font-semibold text-slate-500 mt-1">Direct Database Access</div>
           </div>
        </div>
        
        <div className="flex items-center gap-3">
           {result && (
              <div className="flex items-center gap-2 mr-2">
                 <Button tone="ghost" size="sm" onClick={copyJSON} title="Copy JSON">
                    {copyFeedback ? <Check className="w-4 h-4 text-emerald-600" /> : <FileJson className="w-4 h-4" />}
                 </Button>
                 <Button tone="ghost" size="sm" onClick={downloadCSV} title="Download CSV">
                    <Download className="w-4 h-4" />
                 </Button>
                 <div className="w-px h-6 bg-slate-200 mx-1" />
              </div>
           )}

           <div className="text-xs font-mono px-3 py-1.5 bg-slate-100 rounded-lg text-slate-500 hidden sm:block">
              {status === "running" ? "Running..." : result ? `${result.rowCount} rows in ${result.elapsedMs}ms` : "Ready"}
           </div>
           <Button onClick={() => runQuery()} disabled={status === "running"} className="shadow-lg">
              <Play className="w-4 h-4 mr-2 fill-current" /> Run Query
           </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        
        {/* 2. Sidebar (Schema Browser) */}
        <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
           <div className="p-3 border-b border-slate-200">
              <div className="relative">
                 <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input 
                   className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                   placeholder="Filter tables..."
                   value={searchTable}
                   onChange={e => setSearchTable(e.target.value)}
                 />
              </div>
           </div>
           
           <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {loadingTables ? (
                <div className="p-4 text-xs text-slate-400 text-center">Loading schema...</div>
              ) : (
                filteredTables.map(t => (
                  <button
                    key={t.table_name}
                    onClick={() => runQuery(`SELECT * FROM ${t.table_name} LIMIT 50;`)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all group"
                  >
                    <div className="flex items-center gap-2 truncate">
                       <TableIcon className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100" />
                       <span className="truncate">{t.table_name}</span>
                    </div>
                    <span className="text-[10px] text-slate-300 font-mono group-hover:text-indigo-300">{t.columns}c</span>
                  </button>
                ))
              )}
           </div>
           <div className="p-3 border-t border-slate-200 text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
              public schema
           </div>
        </div>

        {/* 3. Main Editor & Results */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
           
           {/* Editor */}
           <div className="h-1/3 min-h-[160px] border-b border-slate-200 relative group">
              <textarea
                className="w-full h-full p-6 font-mono text-sm text-slate-800 bg-slate-50/30 outline-none resize-none"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="SELECT * FROM..."
                spellCheck={false}
              />
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                   onClick={() => { navigator.clipboard.writeText(query); }}
                   className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 shadow-sm"
                   title="Copy SQL"
                 >
                    <Copy className="w-4 h-4" />
                 </button>
              </div>
           </div>

           {/* Results Area */}
           <div className="flex-1 overflow-auto bg-white relative">
              {status === "error" && (
                <div className="p-6">
                   <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 flex items-start gap-3">
                      <div className="p-2 bg-rose-100 rounded-full text-rose-600 mt-0.5"><Terminal className="w-4 h-4" /></div>
                      <div>
                         <div className="flex items-center gap-2">
                             <h3 className="text-sm font-bold text-rose-900">Query Error</h3>
                             {isConnectionError && <span className="text-[10px] bg-rose-200 text-rose-800 px-1.5 py-0.5 rounded font-bold uppercase">Connection Failed</span>}
                         </div>
                         <pre className="mt-2 text-xs text-rose-800 font-mono whitespace-pre-wrap">{errorMsg}</pre>
                         {isConnectionError && (
                            <div className="mt-3 text-xs text-rose-700 bg-rose-100/50 p-2 rounded">
                               <strong>Tip:</strong> The app cannot reach the database. Check <code>SUPABASE_DB_URL</code> in your environment variables. 
                               You may need to use the <strong>Transaction Pooler (port 6543)</strong> connection string from Supabase settings.
                            </div>
                         )}
                      </div>
                   </div>
                </div>
              )}

              {status === "success" && result && (
                <ResultTable result={result} />
              )}
              
              {status === "idle" && !result && (
                 <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <Database className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-sm font-bold">Select a table or run a query</p>
                 </div>
              )}
           </div>

        </div>
      </div>
    </div>
  );
}