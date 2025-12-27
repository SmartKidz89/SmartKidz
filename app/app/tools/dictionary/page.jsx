"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { playUISound } from "@/components/ui/sound";
import { Search, BookOpen, Sparkles, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const POPULAR_WORDS = ["observe", "habitat", "predict", "gravity", "ancient", "curious"];

export default function DictionaryPage() {
  const { activeChild } = useActiveChild();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearch(e) {
    e?.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    try { playUISound("tap"); } catch {}

    try {
      const res = await fetch(`/api/dictionary?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Could not find that word.");
      }
      
      setResult(data);
      try { playUISound("success"); } catch {}
    } catch (err) {
      setError(err.message);
      try { playUISound("error"); } catch {}
    } finally {
      setLoading(false);
    }
  }

  function speak(text) {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    window.speechSynthesis.speak(u);
  }

  return (
    <PageMotion className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="skz-glass p-6 md:p-8 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald-400/20 blur-3xl" />
        
        <div className="flex items-end justify-between gap-3 relative z-10">
          <div>
            <div className="text-sm text-slate-500 font-bold uppercase tracking-wider">Reference Tool</div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 mt-1">Smart Dictionary</h1>
            <p className="mt-2 text-slate-600 font-medium">
              Kid-friendly definitions for big words.
            </p>
          </div>
          <button className="skz-chip px-4 py-2 skz-press" onClick={() => history.back()}>Back</button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="skz-card p-2 bg-white shadow-lg">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type a word to define..."
              className="w-full h-14 pl-12 pr-4 rounded-2xl bg-slate-50 text-lg font-bold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 transition-all"
              autoComplete="off"
              autoFocus
            />
          </div>
          <Button 
            type="submit" 
            size="lg" 
            disabled={loading || !query.trim()}
            className="rounded-2xl px-6"
          >
            {loading ? "..." : "Go"}
          </Button>
        </form>
      </div>

      {/* Popular / Recent */}
      {!result && !loading && !error && (
        <div className="text-center py-8">
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4">Try a word</div>
          <div className="flex flex-wrap justify-center gap-2">
            {POPULAR_WORDS.map((w) => (
              <button
                key={w}
                onClick={() => { setQuery(w); setTimeout(() => handleSearch(), 0); }}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all skz-press"
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="skz-card p-8 text-center animate-pulse">
          <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl mb-4" />
          <div className="h-6 w-32 mx-auto bg-slate-100 rounded-full mb-2" />
          <div className="h-4 w-48 mx-auto bg-slate-100 rounded-full" />
        </div>
      )}

      {error && (
        <div className="skz-card p-6 border-rose-100 bg-rose-50 text-center">
          <div className="text-3xl mb-2">🤔</div>
          <div className="text-rose-900 font-bold text-lg">Oops!</div>
          <div className="text-rose-700">{error}</div>
        </div>
      )}

      {result && (
        <div className="skz-card p-6 md:p-8 skz-glow skz-shine border-brand-primary/20">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-4xl font-black text-slate-900 capitalize mb-1">{result.word}</h2>
              <div className="flex items-center gap-2">
                 <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wide">Noun/Verb</span>
                 <button 
                   onClick={() => speak(result.word)}
                   className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                   title="Pronounce"
                 >
                   <Volume2 className="w-4 h-4" />
                 </button>
              </div>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-3xl shadow-sm">
              <BookOpen className="w-7 h-7" />
            </div>
          </div>

          <div className="mt-8 space-y-6">
            <div className="relative pl-6 border-l-4 border-emerald-400">
              <div className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Meaning</div>
              <p className="text-xl text-slate-800 font-medium leading-relaxed">
                {result.simple}
              </p>
            </div>

            <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm uppercase tracking-wide mb-2">
                <Sparkles className="w-4 h-4" /> Example
              </div>
              <p className="text-lg text-slate-800 italic">
                &ldquo;{result.example}&rdquo;
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100 flex justify-center">
            <button 
              onClick={() => { setQuery(""); setResult(null); }}
              className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Look up another word
            </button>
          </div>
        </div>
      )}
    </PageMotion>
  );
}