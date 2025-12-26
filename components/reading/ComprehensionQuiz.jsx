"use client";

import { useMemo, useState } from "react";
import { Card } from "../ui/Card";

export default function ComprehensionQuiz({ questions = [], onComplete }) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [results, setResults] = useState([]); // per-question correctness

  const q = questions[idx];

  const done = useMemo(() => idx >= (questions?.length || 0), [idx, questions]);

  function choose(opt) {
    setSelected(opt.t);
    setFeedback(opt.f);
    setResults((prev) => {
      const next = [...prev];
      next[idx] = !!opt.c;
      return next;
    });
  }

  function next() {
    setSelected(null);
    setFeedback(null);
    const nextIdx = idx + 1;
    if (nextIdx >= questions.length) {
      const correct = (results || []).filter(Boolean).length;
      onComplete?.({ total: questions.length, correct });
      setIdx(nextIdx);
      return;
    }
    setIdx(nextIdx);
  }

  if (!questions?.length) {
    return (
      <Card className="p-6">
        <div className="font-extrabold">Comprehension</div>
        <p className="mt-2 text-slate-700">No questions for this passage yet.</p>
      </Card>
    );
  }

  if (done) {
    return (
      <Card className="p-6">
        <div className="font-extrabold">Comprehension complete</div>
        <p className="mt-2 text-slate-700">Nice work. You can read again or choose a new passage.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="text-sm font-semibold text-slate-600">Comprehension</div>
      <div className="text-xl font-extrabold mt-1">{q.q}</div>

      <div className="mt-4 grid gap-2">
        {q.options.map((o, i) => (
          <button
            key={i}
            onClick={() => choose(o)}
            disabled={!!selected}
            className={`text-left rounded-2xl border p-3 font-semibold transition ${
              selected === o.t ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:bg-slate-50"
            }`}
          >
            {o.t}
          </button>
        ))}
      </div>

      {feedback && (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          {feedback}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={next}
          disabled={!selected}
          className="h-10 px-4 rounded-2xl bg-brand-primary text-white font-semibold disabled:opacity-50"
        >
          {idx === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </Card>
  );
}
