"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { playUISound, haptic } from "@/components/ui/sound";
import { Sparkles, ChevronLeft, Search, Lightbulb, Compass, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  "Why is the sky blue?",
  "How do plants drink water?",
  "What is a fraction?",
  "Why do we need sleep?",
  "How do magnets work?",
];

export default function CuriosityExplorerPage() {
  const { activeChild } = useActiveChild();
  const [q, setQ] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(query) {
    const term = query || q;
    if (!term.trim()) return;

    setError(null);
    setResult(null);
    setLoading(true);
    try { playUISound("tap"); } catch {}

    try {
      const res = await fetch(`/api/curiosity?q=${encodeURIComponent(term)}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Could not find an answer.");
      
      setResult(data);
      try { playUISound("success"); haptic("medium"); } catch {}
    } catch (err) {
      setError(err.message);
      try { playUISound("error"); } catch {}
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageMotion className="max-w-4xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app/tools" className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Curiosity Explorer</h1>
          <p className="text-slate-600 font-medium">Ask a big question. Get a fun answer.</p>
        </div>
      </div>

      <div className="grid gap-8">
        
        {/* Search Input */}
        <div className="relative z-20">
          <div className="relative shadow-2xl rounded-[2rem] bg-white overflow-hidden border border-slate-100 p-2 flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
               <Search className="w-6 h-6" />
            </div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(q)}
              placeholder="What are you wondering today?"
              className="flex-1 h-14 bg-transparent text-xl font-bold text-slate-900 placeholder:text-slate-300 outline-none"
              autoFocus
            />
            <button 
              onClick={() => handleSearch(q)}
              disabled={loading}
              className="h-12 px-6 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-transform active:scale-95 disabled:opacity-50"
            >
              {loading ? "..." : "Ask"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 font-bold text-center animate-in slide-in-from-top-2">
              ⚠️ {error}
            </div>
          )}
          
          {/* Suggestions */}
          {!result && !loading && !error && (
            <div className="mt-8 text-center">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Or try one of these</div>
              <div className="flex flex-wrap justify-center gap-3">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setQ(s); handleSearch(s); }}
                    className="px-5 py-3 rounded-2xl bg-white border border-slate-100 text-slate-600 font-bold hover:border-indigo-200 hover:text-indigo-600 hover:-translate-y-1 transition-all shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 text-center animate-pulse">
            <div className="inline-block p-6 rounded-full bg-indigo-50 mb-4">
              <Sparkles className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Thinking...</h3>
          </div>
        )}

        {/* Results Reveal */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Main Answer Card */}
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[2.5rem] p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-6">
                    <Sparkles className="w-3 h-3" /> {result.title}
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black leading-tight mb-6">
                    {result.explanation}
                  </h2>
                  <div className="flex gap-4">
                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex-1">
                      <div className="flex items-center gap-2 font-bold mb-2 opacity-80 text-sm uppercase tracking-wide">
                        <Compass className="w-4 h-4" /> Real World
                      </div>
                      <p className="font-medium text-white/90 leading-relaxed">
                        {result.realWorld}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity & Quiz Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-100">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 mb-4">
                       <Lightbulb className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Try this!</h3>
                    <p className="text-slate-700 font-medium leading-relaxed">{result.activity}</p>
                 </div>

                 <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-lg">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 mb-4">
                       <BrainCircuit className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-4">Quick Quiz</h3>
                    <div className="space-y-4">
                      {result.quiz?.map((item, i) => (
                        <div key={i} className="group cursor-pointer">
                          <div className="font-bold text-slate-900 mb-1">{item.question}</div>
                          <div className="text-sm font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                            Reveal answer: {item.answer}
                          </div>
                        </div>
                      ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </PageMotion>
  );
}