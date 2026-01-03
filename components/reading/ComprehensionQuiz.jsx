"use client";

import { useMemo, useState } from "react";
import { RileyAssistant } from "@/components/app/RileyAssistant";

export default function ComprehensionQuiz({ questions = [], onComplete }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [wrongStreak, setWrongStreak] = useState(0);
  const [showRiley, setShowRiley] = useState(false);

  const q = questions[index];

  const tips = useMemo(() => {
    const base = [
      "Look for key words in the question (who, what, when, where, why).",
      "Go back to the passage and find the sentence that supports the answer.",
      "Eliminate options that are too extreme (always/never) unless the text says so.",
    ];
    if (q?.explanation) return [q.explanation, ...base];
    return base;
  }, [q]);

  if (!q) {
    return (
      <div className="rounded-2xl border bg-white p-5 text-sm">
        No quiz questions available.
      </div>
    );
  }

  const submit = () => {
    if (selected == null) return;

    const correctIndex =
      typeof q.answerIndex === "number"
        ? q.answerIndex
        : Array.isArray(q.options)
          ? q.options.findIndex((o) => o === q.answer)
          : -1;

    const correct = selected === correctIndex;

    if (correct) {
      setFeedback("Correct. Nice work.");
      setWrongStreak(0);
    } else {
      const nextWrong = wrongStreak + 1;
      setWrongStreak(nextWrong);
      setFeedback("Not quite. Try again.");
      if (nextWrong >= 3) setShowRiley(true);
    }
  };

  const next = () => {
    const last = index >= questions.length - 1;
    if (last) {
      onComplete?.();
      setFeedback("Completed!");
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
    setFeedback("");
    setWrongStreak(0);
  };

  return (
    <div className="rounded-2xl border bg-white p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-slate-500">
          Question {index + 1} of {questions.length}
        </div>
        <div className="text-xs text-slate-500">
          Wrong attempts: {wrongStreak}/3
        </div>
      </div>

      <div className="text-base font-semibold text-slate-900">{q.question}</div>

      <div className="space-y-2">
        {(q.options ?? []).map((opt, i) => (
          <label key={i} className="flex items-start gap-3 rounded-xl border p-3 hover:bg-slate-50 cursor-pointer">
            <input
              type="radio"
              name={`q-${index}`}
              checked={selected === i}
              onChange={() => setSelected(i)}
              className="mt-1"
            />
            <div className="text-sm text-slate-800">{opt}</div>
          </label>
        ))}
      </div>

      {feedback ? (
        <div className="text-sm text-slate-700">{feedback}</div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          onClick={submit}
          disabled={selected == null}
        >
          Check
        </button>

        <button
          type="button"
          className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
          onClick={next}
        >
          Next
        </button>

        {showRiley ? (
          <button
            type="button"
            className="rounded-xl border px-4 py-2 text-sm hover:bg-slate-50"
            onClick={() => setShowRiley(true)}
          >
            Ask Riley
          </button>
        ) : null}
      </div>

      <RileyAssistant
        open={showRiley}
        onClose={() => setShowRiley(false)}
        title="Here are some tips"
        tips={tips}
      />
    </div>
  );
}
