"use client";

import { useMemo, useState } from "react";
import { LessonShell } from "@/components/app/lesson/LessonShell";
import Image from "next/image";
import { Volume2, Eye, Lightbulb, CheckCircle2, XCircle } from "lucide-react";

// Simplified text-to-speech for preview
function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(u);
}

// Reusable Markdown (simple version)
const MarkdownText = ({ value }) => <div className="prose prose-sm max-w-none whitespace-pre-wrap">{value}</div>;

export default function AdminLessonPlayer({ lessonData }) {
  const [screens, setScreens] = useState([]);

  // Transform JSON to Steps (mirrors LessonClient.jsx logic)
  useMemo(() => {
     if (!lessonData) return;
     
     const content = typeof lessonData.content_json === "string" 
        ? JSON.parse(lessonData.content_json) 
        : lessonData.content_json || {};

     const flow = [];

     // 1. Intro
     flow.push({
       type: "intro",
       heading: "Intro",
       sub: "Hook Phase",
       render: () => (
          <div className="text-center p-8">
             <div className="text-4xl mb-4">🚀</div>
             <h2 className="text-2xl font-black text-slate-900 mb-2">{lessonData.title}</h2>
             <p className="text-slate-600">{content.overview || content.objective || "Let's start!"}</p>
          </div>
       )
     });

     // 2. Activities
     let activities = [];
     
     // Normalized DB items take precedence
     if (lessonData.content_items && lessonData.content_items.length > 0) {
        activities = lessonData.content_items.map(it => ({
           ...it.content_json,
           type: it.type,
           phase: it.phase
        }));
     } else {
        // Fallback JSON adapters
        if (content.explanation) activities.push({ type: "learn", prompt: content.explanation, title: "Explanation" });
        if (content.worked_example) activities.push({ type: "learn", prompt: content.worked_example, title: "Example" });
        if (content.quiz) content.quiz.forEach(q => activities.push({ type: "multiple_choice", ...q }));
     }

     activities.forEach((act, i) => {
        flow.push({
           heading: act.title || `Activity ${i+1}`,
           sub: act.phase || "Practice",
           render: () => <ActivityRenderer activity={act} />
        });
     });

     // 3. Outro
     flow.push({
       type: "outro",
       heading: "Complete",
       sub: "Summary",
       render: () => (
         <div className="text-center p-8 text-emerald-700 bg-emerald-50 rounded-2xl">
            <h2 className="text-xl font-bold">Lesson Finished!</h2>
            <p>In the real app, this triggers confetti and rewards.</p>
         </div>
       )
     });

     setScreens(flow);
  }, [lessonData]);

  if (!lessonData) return <div className="p-8 text-center text-slate-400">Select a lesson to preview.</div>;

  return (
    <div className="bg-slate-100 rounded-3xl overflow-hidden border-4 border-slate-200 shadow-2xl max-w-md mx-auto h-[700px] relative">
       <div className="absolute inset-0 overflow-y-auto">
          <LessonShell title={lessonData.title} steps={screens} />
       </div>
    </div>
  );
}

function ActivityRenderer({ activity }) {
   const [selected, setSelected] = useState(null);
   const [revealed, setRevealed] = useState(false);

   const isQuiz = activity.type === "multiple_choice" || activity.type === "quiz";
   const text = activity.prompt || activity.question || activity.text;
   
   return (
      <div className="space-y-4">
         {/* Image */}
         {activity.image && (
            <div className="relative h-40 w-full bg-slate-100 rounded-xl overflow-hidden">
               <Image src={activity.image} alt="Visual" fill className="object-cover" />
            </div>
         )}

         {/* Text */}
         <div className="relative">
            <div className="text-lg font-bold text-slate-900 pr-8">{text}</div>
            <button onClick={() => speak(text)} className="absolute top-0 right-0 text-slate-400 hover:text-indigo-600">
               <Volume2 className="w-5 h-5" />
            </button>
         </div>

         {/* Interactions */}
         {isQuiz && (
            <div className="grid gap-2">
               {(activity.options || []).map((opt, i) => {
                  let style = "bg-white border-slate-200 hover:bg-slate-50";
                  if (revealed) {
                     if (opt === activity.answer || opt === activity.correct_answer) style = "bg-emerald-100 border-emerald-500 text-emerald-800";
                     else if (selected === opt) style = "bg-rose-100 border-rose-500 text-rose-800";
                     else style = "opacity-50";
                  } else if (selected === opt) {
                     style = "bg-indigo-50 border-indigo-500 text-indigo-800";
                  }

                  return (
                     <button 
                        key={i} 
                        onClick={() => !revealed && setSelected(opt)}
                        className={`w-full p-3 rounded-xl border-2 text-left text-sm font-semibold transition-all ${style}`}
                     >
                        {opt}
                     </button>
                  );
               })}
               <button 
                  onClick={() => setRevealed(true)} 
                  disabled={!selected || revealed}
                  className="mt-2 w-full py-3 bg-slate-900 text-white rounded-xl font-bold disabled:opacity-50"
               >
                  Check Answer
               </button>
               {revealed && activity.explanation && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                     <strong>Explanation:</strong> {activity.explanation}
                  </div>
               )}
            </div>
         )}
      </div>
   );
}