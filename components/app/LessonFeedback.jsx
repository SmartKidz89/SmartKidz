"use client";
import { useEffect } from "react";

export default function LessonFeedback({ correct, onNext, onRetry }) {
  useEffect(() => {
    if (correct) {
      const t = setTimeout(onNext, 900);
      return () => clearTimeout(t);
    }
  }, [correct, onNext]);

  return (
    <div className={`fixed inset-x-0 bottom-0 z-50 p-4 border-t
      ${correct ? "bg-emerald-600 border-emerald-700" : "bg-rose-600 border-rose-700"} text-white`}>
      <div className="mx-auto max-w-3xl flex items-center justify-between gap-3">
        <div className="font-extrabold text-base">
          {correct ? "Correct! Keep going." : "Not quite — try again."}
        </div>
        <div className="flex items-center gap-2">
          {!correct && (
            <button
              onClick={onRetry}
              className="rounded-full bg-white/15 px-4 py-2 text-sm font-extrabold hover:bg-white/20"
            >
              Retry
            </button>
          )}
          {correct && (
            <button
              onClick={onNext}
              className="rounded-full bg-white text-emerald-700 px-4 py-2 text-sm font-extrabold"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
