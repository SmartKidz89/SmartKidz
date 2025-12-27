"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { generateHomeworkQuestions } from "@/lib/homework/generate";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Calculator, BookOpen, FlaskConical, Printer, ArrowLeft, RefreshCw } from "lucide-react";

const SUBJECTS = [
  { id: "MAT", name: "Maths", icon: Calculator, color: "text-sky-600", bg: "bg-sky-50 border-sky-200" },
  { id: "ENG", name: "English", icon: BookOpen, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
  { id: "SCI", name: "Science", icon: FlaskConical, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
];

export default function HomeworkToolPage() {
  const supabase = useMemo(() => createClient(), []);
  const [subjectId, setSubjectId] = useState("MAT");
  const [lessons, setLessons] = useState([]);
  const [sheet, setSheet] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch recent completed lessons for context
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("lessons")
        .select("id,title,topic,subject_id")
        .eq("subject_id", subjectId)
        .limit(10);
      setLessons(data || []);
      setLoading(false);
    })();
  }, [supabase, subjectId]);

  const generate = () => {
    const questions = generateHomeworkQuestions({ 
      subjectId, 
      lessonTitles: lessons.map(l => l.title), 
      count: 20 
    });
    setSheet({
      subjectId,
      date: new Date().toLocaleDateString(),
      questions
    });
  };

  return (
    <PageMotion className="max-w-5xl mx-auto pb-20">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 no-print">
        <div className="flex items-center gap-4">
          <Link href="/app/tools" className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Homework Generator</h1>
            <p className="text-slate-600 font-medium">Instant practice sheets based on your subjects.</p>
          </div>
        </div>
        
        {sheet && (
          <Button onClick={() => window.print()} variant="secondary" className="hidden sm:flex">
            <Printer className="w-4 h-4 mr-2" /> Print
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-[320px_1fr] gap-8 items-start">
        
        {/* Controls */}
        <div className="space-y-6 no-print">
          <Card className="p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Choose Subject</div>
            <div className="grid gap-3">
              {SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSubjectId(s.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    subjectId === s.id ? `${s.bg} ring-2 ring-offset-2 ring-indigo-100` : "bg-white border-slate-100 hover:border-slate-200"
                  }`}
                >
                  <div className={`h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <span className={`font-bold text-lg ${subjectId === s.id ? "text-slate-900" : "text-slate-600"}`}>
                    {s.name}
                  </span>
                </button>
              ))}
            </div>

            <Button onClick={generate} size="lg" className="w-full mt-6 shadow-lg">
              <RefreshCw className="w-4 h-4 mr-2" /> Generate Sheet
            </Button>
          </Card>
        </div>

        {/* Output */}
        <div className="min-h-[600px]">
          {!sheet ? (
             <div className="h-full rounded-[2.5rem] border-4 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12 bg-slate-50/50">
               <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-sm mb-4">
                 <Printer className="w-8 h-8 text-slate-300" />
               </div>
               <h3 className="text-xl font-black text-slate-400">Ready to Create</h3>
               <p className="text-slate-400 mt-2 max-w-xs">Select a subject and hit generate to create a printable homework pack.</p>
             </div>
          ) : (
            <div className="bg-white text-slate-900 rounded-xl shadow-2xl p-8 sm:p-12 print:shadow-none print:p-0">
               <div className="flex justify-between items-end border-b-2 border-slate-900 pb-6 mb-8">
                  <div>
                    <h2 className="text-4xl font-black tracking-tight">{SUBJECTS.find(s=>s.id===sheet.subjectId)?.name} Pack</h2>
                    <p className="text-slate-500 font-medium mt-1">Generated {sheet.date}</p>
                  </div>
                  <div className="text-right hidden print:block">
                     <div className="text-sm font-bold text-slate-400 mb-2">Score: ______ / {sheet.questions.length}</div>
                  </div>
               </div>

               <div className="space-y-8">
                 {sheet.questions.map((q, i) => (
                   <div key={i} className="break-inside-avoid">
                      <div className="flex gap-4">
                         <span className="font-bold text-slate-400 text-lg w-8">{i + 1}.</span>
                         <div className="flex-1">
                            <div className="font-bold text-lg text-slate-900 mb-4">{q.question}</div>
                            <div className="w-full border-b border-slate-200 h-8 print:border-slate-300" />
                            <div className="w-full border-b border-slate-200 h-8 print:border-slate-300" />
                         </div>
                      </div>
                   </div>
                 ))}
               </div>

               <div className="mt-12 pt-8 border-t border-slate-100 text-center text-slate-400 text-xs font-bold uppercase tracking-widest no-print">
                  Generated by SmartKidz
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