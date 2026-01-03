import { Card } from "../ui/Card";

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4 bg-white">
      <div className="font-extrabold">{title}</div>
      <div className="mt-2 text-slate-700 whitespace-pre-wrap">{children}</div>
    </div>
  );
}

export default function LessonPreview({ lesson }) {
  if (!lesson) return null;

  return (
    <Card className="p-6">
      <div className="text-sm font-semibold text-slate-600">Preview</div>
      <div className="text-2xl font-extrabold mt-1">{lesson.title || "Custom Lesson"}</div>
      {lesson.learning_goal && (
        <div className="mt-2 text-slate-700"><span className="font-semibold">Learning goal:</span> {lesson.learning_goal}</div>
      )}

      <div className="mt-6 grid gap-4">
        {lesson.hook?.text && (
          <Section title="Hook">{lesson.hook.text}</Section>
        )}

        {lesson.explanation && (
          <Section title="Deep Explanation">{lesson.explanation}</Section>
        )}

        {Array.isArray(lesson.worked_examples) && lesson.worked_examples.length > 0 && (
          <Section title="Worked Examples">
            {lesson.worked_examples.map((ex, i) => (
              <div key={i} className="mt-2">
                <div className="font-semibold">Example {i + 1}</div>
                <div className="text-slate-700 whitespace-pre-wrap">{ex}</div>
              </div>
            ))}
          </Section>
        )}

        {lesson.memory_strategies && (
          <Section title="Memory Strategies">{lesson.memory_strategies}</Section>
        )}

        {Array.isArray(lesson.practice_activities) && lesson.practice_activities.length > 0 && (
          <Section title="Practice Activities">
            {lesson.practice_activities.map((a, i) => (
              <div key={i} className="mt-2">
                <div className="font-semibold">{a.title || `Activity ${i + 1}`}</div>
                <div className="text-slate-700 whitespace-pre-wrap">{a.instructions || ""}</div>
              </div>
            ))}
          </Section>
        )}

        {lesson.quiz?.question && (
          <Section title="Mini Quiz">
            <div className="font-semibold">{lesson.quiz.question}</div>
            {Array.isArray(lesson.quiz.options) && (
              <ul className="mt-2 list-disc pl-5">
                {lesson.quiz.options.map((o, i) => (
                  <li key={i} className="text-slate-700">{o.text}</li>
                ))}
              </ul>
            )}
          </Section>
        )}

        {lesson.explain_it_back && (
          <Section title="Explain It Back">{lesson.explain_it_back}</Section>
        )}

        {lesson.confidence_check && (
          <Section title="Confidence Check">{lesson.confidence_check}</Section>
        )}
      </div>
    </Card>
  );
}
