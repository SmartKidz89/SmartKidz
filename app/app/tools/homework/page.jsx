"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { generateHomeworkQuestions } from "@/lib/homework/generate";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Button } from "@/components/ui/Button";
import { Printer, RefreshCw, ChevronLeft, Layers, CheckCircle2 } from "lucide-react";
import { playUISound, haptic } from "@/components/ui/sound";
import { useActiveChild } from "@/hooks/useActiveChild";
import { getGeoConfig } from "@/lib/marketing/geoConfig";

export default function HomeworkToolPage() {
  const supabase = useMemo(() => createClient(), []);
  const { activeChild } = useActiveChild();
  
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("MAT");
  const [lessons, setLessons] = useState([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState(new Set());
  const [count, setCount] = useState(20);
  const [sheet, setSheet] = useState(null);

  const geo = getGeoConfig(activeChild?.country || "AU");

  useEffect(() => {
    (async () => {
      // Fetch subjects, but we might want to rename them in UI
      const { data } = await supabase.from("subjects").select("edition_id,title,country_code,lesson_templates!inner(subject_id,year_level,topic)").eq("status", "active");
      
      if (data) {
        // Map names based on country config
        const mapped = data.map(s => {
           if (s.id === 'MATH') return { ...s, name: geo.mathTerm };
           if (s.id === 'HASS') return { ...s, name: geo.code === "US" ? "Social Studies" : "HASS" };
           return s;
        });
        setSubjects(mapped);
      }
    })();
  }, [supabase, geo]);

  useEffect(() => {
    (async () => {
      setLessons([]);
      setSelectedLessonIds(new Set());
      // Optionally filter by child's year/grade here too for better relevance
      const { data } = await supabase.from("lesson_editions")
         .select("id,title,topic")
         .eq("lesson_templates.subject_id", subjectId)
         .eq("lesson_templates.year_level", activeChild?.year_level || 3); // Defaults to child's level
         
      if (data) setLessons((data || []).map(r => ({
        id: r.edition_id,
        title: r.title,
        topic: r.lesson_templates?.topic,
        subject_id: r.lesson_templates?.subject_id,
        year_level: r.lesson_templates?.year_level,
        country: r.country_code
      })));
    })();
  }, [supabase, subjectId, activeChild]);

  const toggleLesson = (id) => {
    setSelectedLessonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onGenerate = () => {
    try { playUISound("tap"); haptic("medium"); } catch {}
    const selected = lessons.filter((l) => selectedLessonIds.has(l.id));
    const titles = selected.map((l) => l.title);
    const questions = generateHomeworkQuestions({ subjectId, lessonTitles: titles, count });
    setSheet({ subjectId, titles, questions, generatedAt: new Date().toISOString() });
  };

  return (
    <PageMotion className="max-w-6xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 no-print">
        <div className="flex items-center gap-4">
          <Link href="/app/tools" className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Homework Generator</h1>
            <p className="text-slate-600 font-medium">Create practice sheets for {geo.gradeTerm} {activeChild?.year_level || 3}.</p>
          </div>
        </div>
        {sheet && (
          <Button onClick={() => window.print()} className="shadow-lg hidden sm:flex">
            <Printer className="w-5 h-5 mr-2" /> Print Sheet
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-[380px_1fr] gap-8 items-start">
        
        {/* Controls */}
        <div className="space-y-6 no-print">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl">
             <div className="space-y-5">
               <div>
                 <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Subject</label>
                 <div className="flex flex-wrap gap-2">
                   {subjects.map(s => (
                     <button
                       key={s.id}
                       onClick={() => setSubjectId(s.id)}
                       className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                         subjectId === s.id 
                           ? "border-indigo-500 bg-indigo-50 text-indigo-700" 
                           : "border-slate-100 bg-white text-slate-600 hover:border-slate-300"
                       }`}
                     >
                       {s.name}
                     </button>
                   ))}
                 </div>
               </div>

               <div>
                 <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">Length</label>
                 <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                    {[10, 20, 30, 40].map(n => (
                      <button
                        key={n}
                        onClick={() => setCount(n)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          count === n ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
                        }`}
                      >
                        {n} Qs
                      </button>
                    ))}
                 </div>
               </div>

               <div>
                 <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
                   Include Content ({selectedLessonIds.size})
                 </label>
                 <div className="max-h-60 overflow-y-auto pr-2 space-y-2">
                   {lessons.length === 0 && <div className="text-sm text-slate-400 p-2">No lessons available for this subject.</div>}
                   {lessons.map(l => (
                     <button
                       key={l.id}
                       onClick={() => toggleLesson(l.id)}
                       className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-start gap-3 ${
                         selectedLessonIds.has(l.id)
                           ? "border-emerald-500 bg-emerald-50"
                           : "border-slate-100 bg-white hover:border-slate-300"
                       }`}
                     >
                       <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                         selectedLessonIds.has(l.id) ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
                       }`}>
                         {selectedLessonIds.has(l.id) && <CheckCircle2 className="w-3.5 h-3.5" />}
                       </div>
                       <div>
                         <div className="text-sm font-bold text-slate-900 leading-tight">{l.title}</div>
                         <div className="text-xs text-slate-500 mt-0.5">{l.topic || "General"}</div>
                       </div>
                     </button>
                   ))}
                 </div>
               </div>

               <Button onClick={onGenerate} size="lg" className="w-full shadow-lg">
                 <RefreshCw className="w-5 h-5 mr-2" /> Generate Sheet
               </Button>
             </div>
          </div>
        </div>

        {/* Preview */}
        <div className="min-h-[600px]">
          {!sheet ? (
            <div className="h-full rounded-[2.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12 bg-slate-50/50">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-sm mb-6">
                <Layers className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-black text-slate-400">Preview Area</h3>
              <p className="text-slate-400 font-medium mt-2 max-w-xs">
                Select options and click generate to see your custom worksheet here.
              </p>
            </div>
          ) : (
            <div className="bg-white text-black shadow-2xl rounded-xl overflow-hidden print:shadow-none print:rounded-none">
              <div className="bg-slate-900 text-white p-8 print:bg-white print:text-black print:p-0 print:border-b-2 print:border-black print:mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-black mb-1">Homework</h2>
                    <div className="text-indigo-200 print:text-slate-600 font-medium">
                      {sheet.questions.length} Questions • {sheet.subjectId === "MATH" ? geo.mathTerm : sheet.subjectId}
                    </div>
                  </div>
                  <div className="hidden print:block text-right">
                    <div className="text-sm font-bold text-slate-400">Name: _________________</div>
                    <div className="text-sm font-bold text-slate-400 mt-4">Score: ______ / {sheet.questions.length}</div>
                  </div>
                </div>
              </div>

              <div className="p-8 print:p-0">
                <div className="grid gap-8">
                  {sheet.questions.map((q, i) => (
                    <div key={i} className="break-inside-avoid">
                       <div className="flex gap-4">
                         <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 shrink-0 print:bg-transparent print:border print:border-slate-300">
                           {i + 1}
                         </div>
                         <div className="flex-1 pt-1">
                           <div className="text-lg font-bold text-slate-900 mb-4">{q.question}</div>
                           <div className="w-full border-b border-slate-200 h-8" />
                           <div className="w-full border-b border-slate-200 h-8" />
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-12 pt-6 border-t border-slate-200 text-center text-xs font-bold text-slate-400 uppercase tracking-widest print:mt-6">
                   Generated by SmartKidz
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style jsx global>{`
        @media print {
          @page { margin: 2cm; }
          body { background: white; }
          .no-print { display: none !important; }
          .skz-page { padding: 0 !important; }
        }
      `}</style>

    </PageMotion>
  );
}