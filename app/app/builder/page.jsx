"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from '@/components/app/PaywallGate';
import { useProfile } from '@/components/auth/useProfile';
import { getSupabaseClient } from "../../../lib/supabaseClient";
import LessonPreview from '@/components/builder/LessonPreview';

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
const subjects = [
  { id: "MATH", name: "Maths" },
  { id: "ENG", name: "English" },
  { id: "SCI", name: "Science" }
];

const goalTypes = [
  { id: "support", name: "Support (catch up)" },
  { id: "reinforce", name: "Reinforce" },
  { id: "extend", name: "Extend" }
];

const learningStyles = [
  { id: "story", name: "Story" },
  { id: "visual", name: "Visual" },
  { id: "voice", name: "Voice" },
  { id: "game", name: "Game-based" }
];

export default function LessonBuilder() {
  const { profile, loading: profileLoading } = useProfile();
  const supabase = useMemo(() => getSupabaseClient(), []);

  const [step, setStep] = useState(1);

  const [prompt, setPrompt] = useState("");
  const [yearLevel, setYearLevel] = useState(4);
  const [subject, setSubject] = useState("MATH");
  const [goalType, setGoalType] = useState("reinforce");
  const [style, setStyle] = useState("story");

  const [lesson, setLesson] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);

  const canUse = !profileLoading && ["parent", "teacher", "admin"].includes(profile?.role || "parent");

  async function generateLesson() {
    setBusy(true);
    setMsg(null);
    setLesson(null);

    try {
      const res = await fetch("/api/lesson-builder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          yearLevel,
          subject,
          goalType,
          style
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Generation failed");
      setLesson(data.lesson);
      setStep(3);
      setMsg("Lesson generated. Review and save if you like it.");
    } catch (e) {
      setMsg(e?.message || "Generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function saveLesson() {
    if (!lesson) return;
    setBusy(true);
    setMsg(null);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess?.session?.user?.id;
      if (!uid) throw new Error("Not logged in");

      const row = {
        created_by: uid,
        created_by_role: profile?.role ?? "parent",
        year_level: yearLevel,
        subject_id: subject,
        prompt,
        goal_type: goalType,
        preferred_style: style,
        lesson_json: lesson
      };

      const { error } = await supabase.from("custom_lessons").insert(row);
      if (error) throw error;

      setMsg("Saved! You can export these later or assign to a child once child/teacher mappings are set.");
    } catch (e) {
      setMsg(e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    
    <PageScaffold title="Builder">
<main className="bg-gradient-to-br from-slate-50 to-white min-h-[70vh]">
      <div className="container-pad py-10">
        <PaywallGate>
          <div className="grid gap-6">
            <div>
              <div className="text-sm font-semibold text-slate-600">Parents & Teachers</div>
              <h1 className="text-3xl font-extrabold tracking-tight">Lesson Builder</h1>
              <p className="mt-2 text-slate-700 max-w-2xl">
                Enter what you want a child to learn. Smart Kidz generates a curriculum-aligned interactive lesson plan with a detailed explanation,
                memory strategies, practice activities, and a mini quiz.
              </p>
            </div>

            {!canUse ? (
              <Card className="p-6">
                <div className="text-xl font-extrabold">Access restricted</div>
                <p className="mt-2 text-slate-700">
                  Lesson Builder is available to Parents and Teachers only.
                </p>
              </Card>
            ) : (
              <>
                <Card className="p-6">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="font-extrabold text-lg">Build a custom lesson</div>
                    <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                      Step {step} of 3
                    </div>
                  </div>

                  {step === 1 && (
                    <div className="mt-5 grid gap-4">
                      <label className="grid gap-2">
                        <span className="text-sm font-semibold text-slate-700">What do you want to learn?</span>
                        <textarea
                          className="min-h-[110px] rounded-2xl border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-900/20"
                          placeholder="Example: My Year 4 student struggles with equivalent fractions. Make it simple and confidence-building."
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                        />
                      </label>

                      <div className="flex justify-end">
                        <Button onClick={() => setStep(2)} disabled={!prompt.trim()}>
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="mt-5 grid gap-4">
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="grid gap-2">
                          <span className="text-sm font-semibold text-slate-700">Year level</span>
                          <select
                            className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                            value={yearLevel}
                            onChange={(e) => setYearLevel(Number(e.target.value))}
                          >
                            {[1,2,3,4,5,6].map((y) => <option key={y} value={y}>Year {y}</option>)}
                          </select>
                        </label>

                        <label className="grid gap-2">
                          <span className="text-sm font-semibold text-slate-700">Subject</span>
                          <select
                            className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                          >
                            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </label>

                        <label className="grid gap-2">
                          <span className="text-sm font-semibold text-slate-700">Learning goal</span>
                          <select
                            className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                            value={goalType}
                            onChange={(e) => setGoalType(e.target.value)}
                          >
                            {goalTypes.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                          </select>
                        </label>

                        <label className="grid gap-2">
                          <span className="text-sm font-semibold text-slate-700">Preferred learning style</span>
                          <select
                            className="h-11 rounded-2xl border border-slate-300 px-4 outline-none focus:ring-2 focus:ring-slate-900/20"
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                          >
                            {learningStyles.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </label>
                      </div>

                      <div className="flex justify-between">
                        <Button variant="secondary" onClick={() => setStep(1)}>Back</Button>
                        <Button onClick={generateLesson} disabled={busy || !prompt.trim()}>
                          {busy ? "Generating…" : "Generate Lesson"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-between">
                      <div className="text-sm text-slate-600">
                        Tip: If it’s not perfect, tweak the prompt and regenerate.
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" onClick={() => setStep(2)}>Edit inputs</Button>
                        <Button onClick={saveLesson} disabled={busy || !lesson}>
                          {busy ? "Saving…" : "Save Lesson"}
                        </Button>
                      </div>
                    </div>
                  )}

                  {msg && (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                      {msg}
                    </div>
                  )}
                </Card>

                <LessonPreview lesson={lesson} />
              </>
            )}
          </div>
        </PaywallGate>
      </div>
    </main>
  
    </PageScaffold>
  );
}