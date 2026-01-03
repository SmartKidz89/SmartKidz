"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { playUISound, haptic } from "@/components/ui/sound";
import { BrainCircuit, ChevronLeft, Sparkles, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

// Updated Year Options: Prep (0) to Year 6
const YEAR_OPTIONS = [
  { val: 0, label: "Prep / Foundation" },
  { val: 1, label: "Year 1" },
  { val: 2, label: "Year 2" },
  { val: 3, label: "Year 3" },
  { val: 4, label: "Year 4" },
  { val: 5, label: "Year 5" },
  { val: 6, label: "Year 6" }
];

function Markdown({ children }) {
  if (!children) return null;
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
      {children}
    </ReactMarkdown>
  );
}

export default function TeachMePage() {
  const child = useActiveChild();
  const defaultYear = useMemo(() => {
    const y = child?.activeChild?.year_level ?? 3;
    return Math.min(Math.max(0, Number(y)), 6);
  }, [child]);

  const [year, setYear] = useState(defaultYear);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  async function runTeachMe() {
    const q = prompt.trim();
    if (!q) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try { playUISound("tap"); haptic?.("light"); } catch {}

    try {
      const res = await fetch("/api/teachme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year_level: year, prompt: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "TeachMe request failed");
      setResult(data);
    } catch (e) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageMotion className="max-w-5xl mx-auto pb-24 pt-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <Link href="/app/tools" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold p-2 rounded-xl hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-5 h-5" />
          Back to Tools
        </Link>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 shadow-sm border border-white/60 backdrop-blur-md">
          <BrainCircuit className="w-5 h-5 text-indigo-600" />
          <span className="font-bold text-slate-900">TeachMe AI</span>
        </div>
      </div>

      <div className="rounded-[2.5rem] bg-white border border-slate-200 shadow-xl p-6 sm:p-10 relative overflow-hidden">
        {/* Decor */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-end gap-6 relative z-10">
          <div className="flex-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Ask anything. Learn it your way.</h1>
            <p className="text-slate-600 font-medium max-w-xl">
              Type any question. I'll explain it perfectly for your year level with steps, tips, and practice questions.
            </p>
          </div>

          <div className="w-full md:w-64">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Level</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all cursor-pointer"
            >
              {YEAR_OPTIONS.map(y => (
                <option key={y.val} value={y.val}>{y.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-8 relative z-10">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Your Question</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder='e.g., "How do I do long division?" or "Why do volcanoes erupt?"'
            rows={3}
            className="w-full rounded-3xl border-2 border-slate-200 bg-slate-50 px-6 py-5 font-medium text-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none placeholder:text-slate-400"
          />
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={runTeachMe}
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white px-8 py-4 font-black shadow-xl hover:bg-slate-800 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 text-amber-300" />}
              {loading ? "Thinking..." : "Teach Me"}
            </button>
            
            {result && (
               <button
                 onClick={() => { setPrompt(""); setResult(null); setError(null); }}
                 className="rounded-2xl bg-white border-2 border-slate-200 px-6 py-4 font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
               >
                 Ask Another
               </button>
            )}
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 font-semibold flex items-center gap-3">
              <div className="p-2 bg-rose-100 rounded-full"><Sparkles className="w-4 h-4" /></div>
              {error}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-8 space-y-6"
          >
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl p-8 sm:p-10 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
                
                <h2 className="text-3xl font-black text-slate-900 mb-6">{result.title || "Here's what I found"}</h2>
                
                {result.summary && (
                   <div className="prose prose-lg prose-slate max-w-none font-medium text-slate-700 bg-slate-50 p-6 rounded-3xl mb-8">
                      <Markdown>{result.summary}</Markdown>
                   </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Array.isArray(result.steps) && result.steps.length > 0 && (
                    <div className="rounded-3xl bg-indigo-50/50 border border-indigo-100 p-6">
                      <h3 className="font-black text-indigo-900 mb-4 flex items-center gap-2">
                         <span className="w-6 h-6 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs">1</span>
                         Steps
                      </h3>
                      <ul className="space-y-3">
                        {result.steps.map((s, i) => (
                           <li key={i} className="flex gap-3 text-slate-700 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                              <span className="flex-1"><Markdown>{String(s)}</Markdown></span>
                           </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(result.tips) && result.tips.length > 0 && (
                    <div className="rounded-3xl bg-emerald-50/50 border border-emerald-100 p-6">
                      <h3 className="font-black text-emerald-900 mb-4 flex items-center gap-2">
                         <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-700 flex items-center justify-center text-xs">★</span>
                         Pro Tips
                      </h3>
                      <ul className="space-y-3">
                        {result.tips.map((t, i) => (
                           <li key={i} className="flex gap-3 text-slate-700 font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                              <span className="flex-1"><Markdown>{String(t)}</Markdown></span>
                           </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {Array.isArray(result.practice_questions) && result.practice_questions.length > 0 && (
                   <div className="mt-6 rounded-3xl bg-amber-50/50 border border-amber-100 p-6">
                      <h3 className="font-black text-amber-900 mb-4">Try it yourself</h3>
                      <div className="grid gap-3">
                         {result.practice_questions.map((q, i) => (
                            <div key={i} className="bg-white p-4 rounded-2xl border border-amber-100/50 shadow-sm font-medium text-slate-800">
                               <span className="font-bold text-amber-500 mr-2">Q{i+1}.</span> <Markdown>{String(q)}</Markdown>
                            </div>
                         ))}
                      </div>
                   </div>
                )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageMotion>
  );
}