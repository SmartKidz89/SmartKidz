"use client";

import { useState, useRef } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { playUISound, haptic } from "@/components/ui/sound";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Loader2, Printer, Sparkles, RefreshCw, ChevronLeft } from "lucide-react";
import Link from "next/link";

const SAMPLE_PROMPTS = [
  "20 questions on advanced multiplication",
  "10 sentence starters for a story about space",
  "Practice adding fractions with different denominators",
  "Science quiz about magnets and forces",
  "Grammar practice: nouns, verbs, and adjectives"
];

export default function WorksheetGenerator() {
  const { activeChild } = useActiveChild();
  const year = activeChild?.year_level || 3;
  
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState(20);
  const [loading, setLoading] = useState(false);
  const [worksheet, setWorksheet] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  async function handleGenerate(e) {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setWorksheet(null);
    try {
      playUISound("tap");
      
      const res = await fetch("/api/worksheet-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          yearLevel: year,
          count: Number(count)
        })
      });

      if (!res.ok) throw new Error("Generation failed");
      
      const data = await res.json();
      setWorksheet(data);
      playUISound("complete");
      haptic("medium");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageMotion className="max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 no-print">
        <div className="flex items-center gap-4">
          <Link href="/app/tools" className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Worksheet Builder</h1>
            <p className="text-slate-600 font-medium">Create custom practice sheets in seconds.</p>
          </div>
        </div>
        
        {worksheet && (
          <Button 
            onClick={() => window.print()} 
            variant="secondary"
            className="hidden sm:flex"
          >
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-[350px_1fr] gap-8 items-start">
        
        {/* Sidebar Controls (Hidden when printing) */}
        <div className="space-y-6 no-print">
          <Card className="p-5 bg-white/80 backdrop-blur-xl border-slate-200 shadow-lg">
            <form onSubmit={handleGenerate} className="space-y-5">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  What do you want to practice?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. 20 questions on long division with remainders, include theory on how to solve them."
                  className="w-full h-32 rounded-2xl border-2 border-slate-200 p-4 text-sm font-medium focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                  Number of Questions
                </label>
                <div className="flex items-center gap-2">
                  {[5, 10, 20].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCount(n)}
                      className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                        count === n 
                          ? "border-indigo-500 bg-indigo-50 text-indigo-700" 
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || !prompt.trim()} 
                className="w-full h-12 text-base shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" /> Generate Worksheet
                  </>
                )}
              </Button>
            </form>
          </Card>

          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Try these</div>
            {SAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => { setPrompt(p); }}
                className="w-full text-left p-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-200"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Preview / Output Area */}
        <div className="min-h-[600px]">
          {!worksheet && !loading && (
            <div className="h-full rounded-[2.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-8 bg-slate-50/50">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                <Printer className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-black text-slate-400">Ready to build</h3>
              <p className="text-slate-400 text-sm max-w-xs mt-2">
                Enter a topic on the left to generate a printable worksheet with theory, tips, and practice questions.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full rounded-[2.5rem] bg-white border border-slate-100 shadow-xl p-12 flex flex-col items-center justify-center text-center animate-pulse">
              <div className="w-32 h-6 bg-slate-200 rounded-full mb-6" />
              <div className="w-full h-4 bg-slate-100 rounded-full mb-3" />
              <div className="w-full h-4 bg-slate-100 rounded-full mb-3" />
              <div className="w-3/4 h-4 bg-slate-100 rounded-full mb-12" />
              
              <div className="grid grid-cols-2 gap-4 w-full">
                 <div className="h-24 bg-slate-100 rounded-2xl" />
                 <div className="h-24 bg-slate-100 rounded-2xl" />
              </div>
            </div>
          )}

          {worksheet && (
            <div className="bg-white text-slate-900 rounded-xl shadow-2xl overflow-hidden print:shadow-none print:rounded-none">
              
              {/* Worksheet Header */}
              <header className="bg-slate-900 text-white p-8 print:bg-white print:text-black print:border-b-2 print:border-black print:p-0 print:mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black tracking-tight mb-2">{worksheet.title}</h2>
                    <div className="text-indigo-200 font-medium print:text-slate-600">
                      Year {year} • {worksheet.questions?.length} Questions
                    </div>
                  </div>
                  <div className="text-right hidden print:block">
                    <div className="text-sm font-bold text-slate-400">Name: ____________________</div>
                    <div className="text-sm font-bold text-slate-400 mt-2">Date: ____________________</div>
                  </div>
                </div>
              </header>

              <div className="p-8 print:p-0">
                
                {/* Theory Section */}
                {(worksheet.theory || worksheet.tips) && (
                  <div className="mb-8 grid md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-8">
                    {worksheet.theory && (
                      <div className="bg-indigo-50 rounded-2xl p-6 print:bg-transparent print:border print:border-slate-200 print:p-4">
                        <h3 className="font-black text-indigo-900 uppercase tracking-wide text-xs mb-3 flex items-center gap-2">
                          <BookOpen className="w-4 h-4" /> Theory & Concepts
                        </h3>
                        <div className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                          {worksheet.theory}
                        </div>
                      </div>
                    )}

                    {worksheet.tips && worksheet.tips.length > 0 && (
                      <div className="bg-amber-50 rounded-2xl p-6 print:bg-transparent print:border print:border-slate-200 print:p-4">
                        <h3 className="font-black text-amber-800 uppercase tracking-wide text-xs mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Tips & Tricks
                        </h3>
                        <ul className="space-y-2">
                          {worksheet.tips.map((tip, i) => (
                            <li key={i} className="text-sm text-slate-800 flex gap-2">
                              <span className="text-amber-500 font-bold">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Questions */}
                <div className="space-y-6">
                  <h3 className="font-black text-slate-900 text-lg border-b border-slate-100 pb-2 mb-4 print:mb-2">
                    Practice Questions
                  </h3>
                  
                  <div className="grid gap-6 print:gap-8">
                    {worksheet.questions.map((q, i) => (
                      <div key={i} className="break-inside-avoid">
                        <div className="flex gap-3">
                          <span className="font-bold text-slate-400 w-6 shrink-0">{i + 1}.</span>
                          <div className="w-full">
                            <div className="font-bold text-slate-900 mb-2">{q.text}</div>
                            {/* Writing Space */}
                            <div className="w-full border-b border-slate-200 h-8 print:border-slate-300" />
                            {q.space > 1 && <div className="w-full border-b border-slate-200 h-8 print:border-slate-300" />}
                            {q.space > 2 && <div className="w-full border-b border-slate-200 h-8 print:border-slate-300" />}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer / Answers Toggle */}
                <div className="mt-12 pt-8 border-t-2 border-dashed border-slate-200 flex justify-between items-center no-print">
                   <div className="text-xs font-bold text-slate-400 uppercase">
                      Generated by SmartKidz
                   </div>
                   <button 
                     onClick={() => setShowAnswers(!showAnswers)}
                     className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-2"
                   >
                     {showAnswers ? "Hide Answers" : "Show Answers"}
                   </button>
                </div>

                {/* Answer Key (Print Only or Toggled) */}
                <div className={`${showAnswers ? 'block' : 'hidden'} print:block print:break-before-page mt-8 bg-slate-50 rounded-2xl p-6 print:bg-transparent print:p-0`}>
                   <h3 className="font-black text-slate-900 mb-4">Answer Key</h3>
                   <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                      {worksheet.answers?.map((a, i) => (
                        <div key={i} className="flex gap-2">
                          <span className="font-bold text-slate-500 w-6">{i + 1}.</span>
                          <span className="text-slate-800">{a.text}</span>
                        </div>
                      ))}
                   </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { margin: 1.5cm; }
          body { background: white; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
          .skz-page { padding: 0 !important; }
        }
      `}</style>
    </PageMotion>
  );
}