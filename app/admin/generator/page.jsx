"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Sparkles, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const SUBJECTS = [
  { id: "MATH", label: "Maths" },
  { id: "ENG", label: "English" },
  { id: "SCI", label: "Science" },
  { id: "HASS", label: "HASS" },
];

export default function GeneratorPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    topic: "Volcanoes",
    year: "3",
    subject: "SCI",
    locale: "Australia"
  });
  const [status, setStatus] = useState("idle"); // idle, generating, success, error
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);

  async function handleGenerate() {
    setStatus("generating");
    setLogs(["Starting generator...", "Contacting AI..."]);
    
    try {
      const res = await fetch("/api/admin/generate-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: form.topic,
          year: Number(form.year),
          subject: form.subject,
          locale: form.locale,
          duration: 15
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Generation failed");
      }

      const data = await res.json();
      setResult(data);
      setStatus("success");
      setLogs(prev => [...prev, "Lesson generated!", "Images created.", "Saved to database."]);
    } catch (e) {
      setStatus("error");
      setLogs(prev => [...prev, `Error: ${e.message}`]);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <PageMotion className="max-w-2xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link href="/app/login" className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-6 h-6 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-900">Lesson Generator</h1>
            <p className="text-slate-600 font-medium">Create premium curriculum content with AI.</p>
          </div>
        </div>

        <Card className="p-8 space-y-6 bg-white shadow-xl border-slate-200">
          
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
               <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Topic</span>
               <input 
                 className="w-full mt-1 h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-900"
                 value={form.topic}
                 onChange={e => setForm({...form, topic: e.target.value})}
               />
            </label>

            <label className="block">
               <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Year Level</span>
               <select 
                 className="w-full mt-1 h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-900 bg-white"
                 value={form.year}
                 onChange={e => setForm({...form, year: e.target.value})}
               >
                 {[1,2,3,4,5,6].map(y => <option key={y} value={y}>Year {y}</option>)}
               </select>
            </label>

            <label className="block">
               <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Subject</span>
               <select 
                 className="w-full mt-1 h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-900 bg-white"
                 value={form.subject}
                 onChange={e => setForm({...form, subject: e.target.value})}
               >
                 {SUBJECTS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
               </select>
            </label>

            <label className="block">
               <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Locale</span>
               <select 
                 className="w-full mt-1 h-12 rounded-xl border border-slate-200 px-4 font-bold text-slate-900 bg-white"
                 value={form.locale}
                 onChange={e => setForm({...form, locale: e.target.value})}
               >
                 <option value="Australia">Australia</option>
                 <option value="United States">USA</option>
                 <option value="United Kingdom">UK</option>
               </select>
            </label>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-xs font-mono text-slate-600 min-h-[100px] max-h-[200px] overflow-y-auto">
             {logs.length === 0 ? "Ready to generate..." : logs.map((l, i) => <div key={i}>&gt; {l}</div>)}
          </div>

          {status === "success" ? (
             <div className="flex gap-3">
               <Button onClick={() => setStatus("idle")} variant="secondary" className="flex-1">
                 Create Another
               </Button>
               <Button onClick={() => router.push(`/app/lesson/${result.lessonId}`)} className="flex-1">
                 <CheckCircle2 className="w-5 h-5 mr-2" /> View Lesson
               </Button>
             </div>
          ) : (
             <Button 
               onClick={handleGenerate} 
               disabled={status === "generating"} 
               className="w-full h-14 text-lg shadow-lg bg-indigo-600 hover:bg-indigo-700 text-white"
             >
               {status === "generating" ? (
                 <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating (approx 45s)...</>
               ) : (
                 <><Sparkles className="w-5 h-5 mr-2" /> Generate Lesson</>
               )}
             </Button>
          )}

        </Card>
      </PageMotion>
    </div>
  );
}