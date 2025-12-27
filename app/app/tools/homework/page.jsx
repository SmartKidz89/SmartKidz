"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { generateHomeworkQuestions } from "@/lib/homework/generate";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";

export default function HomeworkToolPage() {
  const supabase = useMemo(() => createClient(), []);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("MAT");
  const [lessons, setLessons] = useState([]);
  const [selectedLessonIds, setSelectedLessonIds] = useState(new Set());
  const [count, setCount] = useState(25);
  const [sheet, setSheet] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      const { data, error: e } = await supabase
        .from("subjects")
        .select("id,name,sort_order,status")
        .eq("status", "active")
        .order("sort_order", { ascending: true });

      if (!cancelled) {
        if (e) setError(e.message);
        else setSubjects(data ?? []);
      }
    })();
    return () => { cancelled = true; };
  }, [supabase]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError("");
      setLessons([]);
      setSelectedLessonIds(new Set());
      const { data, error: e } = await supabase
        .from("lessons")
        .select("id,title,topic,subject_id")
        .eq("subject_id", subjectId)
        .order("title", { ascending: true });

      if (!cancelled) {
        if (e) setError(e.message);
        else setLessons(data ?? []);
      }
    })();
    return () => { cancelled = true; };
  }, [supabase, subjectId]);

  const toggleLesson = (id) => {
    setSelectedLessonIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const onGenerate = () => {
    setError("");
    const selected = lessons.filter((l) => selectedLessonIds.has(l.id));
    const titles = selected.map((l) => l.title);
    const questions = generateHomeworkQuestions({ subjectId, lessonTitles: titles, count });
    setSheet({ subjectId, titles, questions, generatedAt: new Date().toISOString() });
  };

  return (
    <PageScaffold title="Homework" subtitle="Generate a fresh practice sheet from completed lessons.">
      <main className="p-6 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link href="/app/tools" className="text-sm text-slate-600 hover:text-slate-900">
            ← Back to tools
          </Link>
          <button
            onClick={() => window.print()}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
            type="button"
            disabled={!sheet}
          >
            Print
          </button>
        </div>

        {error ? (
          <div className="rounded-xl border bg-white p-4 text-sm text-red-700">{error}</div>
        ) : null}

        <section className="rounded-2xl border bg-white p-5 space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2">
              <div className="text-sm font-medium">Subject</div>
              <select
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <div className="text-sm font-medium">Questions (20–40)</div>
              <input
                type="number"
                min={20}
                max={40}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value || "20", 10))}
                className="w-full rounded-xl border px-3 py-2 text-sm"
              />
            </label>

            <div className="flex items-end">
              <button
                type="button"
                onClick={onGenerate}
                className="w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Generate homework
              </button>
            </div>
          </div>

          <div className="text-sm text-slate-600">
            Select the lessons the homework should be based on. (If you select none, it will still generate a general sheet for the subject.)
          </div>

          <div className="max-h-64 overflow-auto rounded-xl border">
            <div className="divide-y">
              {lessons.map((l) => (
                <label key={l.id} className="flex items-start gap-3 p-3 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedLessonIds.has(l.id)}
                    onChange={() => toggleLesson(l.id)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-medium text-slate-900">{l.title}</div>
                    {l.topic ? <div className="text-slate-600">{l.topic}</div> : null}
                  </div>
                </label>
              ))}
              {!lessons.length ? <div className="p-3 text-sm text-slate-600">No lessons found for this subject.</div> : null}
            </div>
          </div>
        </section>

        {sheet ? (
          <section className="rounded-2xl border bg-white p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-lg font-semibold">Homework Sheet</div>
                <div className="text-sm text-slate-600">
                  Generated {new Date(sheet.generatedAt).toLocaleString()}
                </div>
              </div>
              <div className="text-sm text-slate-600">
                {sheet.titles.length ? <>Lessons: {sheet.titles.join(", ")}</> : <>Lessons: (not specified)</>}
              </div>
            </div>

            <ol className="list-decimal pl-5 space-y-3">
              {sheet.questions.map((q, idx) => (
                <li key={idx} className="text-sm">
                  <div className="font-medium text-slate-900">{q.question}</div>
                  <div className="mt-2 h-10 border-b border-dashed border-slate-300" />
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </main>
    </PageScaffold>
  );
}
