"use client";

import { useMemo, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { playUISound, haptic } from "@/components/ui/sound";

const SUGGESTIONS = [
  "Why is the sky blue?",
  "How do plants drink water?",
  "What is a fraction?",
  "Why do we need sleep?",
  "How do magnets work?",
  "What does 'predict' mean?",
  "How do I add 27 + 15?",
];

function levelLabel(y){
  if (y === 0) return "Prep / Foundation";
  return `Year ${y}`;
}

function buildAnswer(question, year) {
  // Offline, kid-safe answer builder: explanation + example + activity + quiz.
  const y = typeof year === "number" ? year : 2;
  const q = (question || "").trim();

  const kidStyle = y <= 1
    ? {
        explain: "Use very simple spoken sentences. Keep it short and friendly. Add audio prompts.",
        quizCount: 3,
      }
    : {
        explain: "Use simple language. Add one real-world example and a short quiz.",
        quizCount: 5,
      };

  // crude topic detection
  const s = q.toLowerCase();
  const topic =
    s.includes("sky") || s.includes("plant") || s.includes("magnet") || s.includes("sleep") ? "science"
    : s.includes("fraction") || s.includes("add") || s.includes("minus") || s.match(/\d/) ? "maths"
    : "words";

  const title =
    topic === "science" ? "Curiosity Science"
    : topic === "maths" ? "Curiosity Maths"
    : "Curiosity Words";

  const explanation =
    topic === "science"
      ? (y <= 1
          ? `Let’s wonder together! The sky looks blue because sunlight gets scattered in the air. Blue light spreads out more.`
          : `The sky looks blue because sunlight is made of many colours. When light goes through the air, blue light scatters more than other colours, so we see more blue.`)
      : topic === "maths"
      ? (y <= 1
          ? `Math is like building blocks. We can put numbers together to make a bigger number.`
          : `Math helps us solve real problems. We can break big numbers into smaller parts and combine them.`)
      : (y <= 1
          ? `Words help us share ideas. A word can have a meaning and an example.`
          : `Words are tools. When you know a word’s meaning and can use it in a sentence, you really own it.`);

  const realWorld =
    topic === "science"
      ? "Real world: Look at the sky at morning and afternoon. Is the colour the same?"
      : topic === "maths"
      ? "Real world: Adding helps when shopping (prices), sharing snacks, and counting points in games."
      : "Real world: Knowing word meanings helps you read stories and understand school instructions.";

  const activity =
    topic === "science"
      ? (y <= 1
          ? "Mini activity: Shine a torch through a clear bottle of water. Wiggle it. Notice the light spreads."
          : "Mini activity: Shine a torch through a glass of water with a tiny drop of milk. The light will scatter more—similar idea to the sky.")
      : topic === "maths"
      ? (y <= 1
          ? "Mini activity: Use 10 toys. Put 3 in one pile and 2 in another. Count them together."
          : "Mini activity: Pick two 2-digit numbers. Split into tens and ones. Add tens, then ones, then combine.")
      : (y <= 1
          ? "Mini activity: Pick 3 words from a book. Point to them. Say what you think they mean."
          : "Mini activity: Make a ‘word card’: word, meaning, and a sentence you wrote.");

  const remember =
    topic === "science"
      ? "Remember: Ask, notice, test. Science starts with curiosity."
      : topic === "maths"
      ? "Remember: Break it, solve it, check it. Small steps win."
      : "Remember: Meaning + example sentence = new word learned.";

  const quiz = [];
  const addQ = (question, answer) => quiz.push({ question, answer });

  if (topic === "science") {
    addQ("What does it mean to ‘observe’?", "To look carefully and notice details.");
    addQ("True or false: Sunlight has many colours.", "True.");
    addQ("What is one thing you could test about the sky?", "Example: Is it bluer at midday than at sunset?");
    if (kidStyle.quizCount === 5) {
      addQ("Why do we see more blue in the sky?", "Because blue light scatters more in the air.");
      addQ("What tool could you use for a mini experiment?", "A torch/flashlight, water, paper, etc.");
    }
  } else if (topic === "maths") {
    addQ("What should you do first with a big number problem?", "Break it into smaller parts.");
    addQ("If you add 10 to a number, what changes?", "The tens increase by one.");
    addQ("Why is checking your answer helpful?", "It catches mistakes.");
    if (kidStyle.quizCount === 5) {
      addQ("Solve: 27 + 15", "42");
      addQ("What is one real-world place you use addition?", "Shopping, games, cooking, etc.");
    }
  } else {
    addQ("What helps you remember a new word?", "Knowing the meaning and using it in a sentence.");
    addQ("What is an example sentence?", "A sentence that shows how the word is used.");
    addQ("Where can you find new words?", "Books, lessons, conversations.");
    if (kidStyle.quizCount === 5) {
      addQ("Make a sentence with the word ‘because’.", "Any correct sentence using because.");
      addQ("What should you do if you don’t know a word?", "Ask, look it up, or use context clues.");
    }
  }

  // Audio prompts: short lines a parent can read aloud or TTS can speak later.
  const audioPrompts = y <= 1
    ? [
        "Let’s learn together.",
        "Point to the picture or the numbers.",
        "Say it with me.",
        "Great try. Let’s do one more."
      ]
    : [
        "Let’s unpack the idea step by step.",
        "Now you try it.",
        "Check your thinking.",
        "Nice work—let’s quiz it."
      ];

  return {
    title,
    topic,
    explanation,
    realWorld,
    activity,
    remember,
    quiz,
    audioPrompts
  };
}

export default function CuriosityExplorerPage() {
  const { activeChild } = useActiveChild();
  const year = typeof activeChild?.year_level === "number" ? activeChild.year_level : 2;
  const [q, setQ] = useState("");
  const [picked, setPicked] = useState("");

  const question = picked || q;
  const out = useMemo(() => buildAnswer(question, year), [question, year]);

  function useSuggestion(s){
    try { playUISound("tap"); haptic("light"); } catch {}
    setPicked(s);
    setQ("");
  }

  return (
    <PageMotion className="max-w-6xl mx-auto space-y-6">
      <div className="skz-glass p-6 md:p-8 skz-border-animate skz-shine">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
          <div>
            <div className="text-sm text-slate-500">Ask anything (kid-safe)</div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Curiosity explorer</h1>
            <p className="mt-2 text-sm md:text-base text-slate-700">
              Type a question and get a simple explanation, a mini activity, and a quick quiz.
            </p>
            <div className="mt-3 text-xs text-slate-500">
              For {activeChild?.display_name || "your child"} · {levelLabel(year)}
            </div>
          </div>
          <button className="skz-chip px-4 py-3 skz-press" onClick={() => history.back()}>Back</button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 skz-card p-4">
            <div className="text-xs text-slate-500">Your question</div>
            <input
              value={q}
              onChange={(e) => { setPicked(""); setQ(e.target.value); }}
              placeholder="e.g., Why is the sky blue?"
              className="mt-2 w-full skz-glass p-3 outline-none"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} className="skz-chip px-3 py-2 text-sm skz-press" onClick={() => useSuggestion(s)}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="skz-card p-4">
            <div className="text-xs text-slate-500">Safety</div>
            <div className="mt-2 text-sm text-slate-700">
              This tool gives kid-friendly, offline explanations and activities.
              No chat, no external links, no unsafe content.
            </div>
            <div className="mt-3 skz-glass p-3 text-xs text-slate-600">
              Tip: Ask your child to say their answer out loud before revealing the “answer”.
            </div>
          </div>
        </div>
      </div>

      <div className="skz-card p-6 md:p-8 skz-glow skz-shine">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-slate-500">{out.title}</div>
            <h2 className="text-2xl font-semibold mt-1">{question ? question : "Ask a question to begin"}</h2>
            <div className="mt-3 text-sm text-slate-700 leading-relaxed">{out.explanation}</div>
          </div>
          <div className="skz-chip px-3 py-2 text-sm">
            {out.topic === "science" ? "🔬 Science" : out.topic === "maths" ? "➕ Maths" : "📚 Words"}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="skz-glass p-4">
            <div className="text-xs text-slate-500">Real-world</div>
            <div className="mt-1 text-sm text-slate-700">{out.realWorld}</div>
          </div>
          <div className="skz-glass p-4">
            <div className="text-xs text-slate-500">Mini activity</div>
            <div className="mt-1 text-sm text-slate-700">{out.activity}</div>
          </div>
          <div className="skz-glass p-4">
            <div className="text-xs text-slate-500">Remember</div>
            <div className="mt-1 text-sm text-slate-700">{out.remember}</div>
          </div>
        </div>

        <div className="mt-6 skz-divider" />

        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="skz-glass p-4">
            <div className="text-sm font-semibold">Quick quiz</div>
            <div className="mt-3 space-y-3">
              {out.quiz.map((it, idx) => (
                <div key={idx} className="skz-card p-4">
                  <div className="font-semibold text-slate-800">{idx+1}. {it.question}</div>
                  <details className="mt-2">
                    <summary className="text-sm text-slate-600 cursor-pointer">Show answer</summary>
                    <div className="mt-2 text-sm text-slate-700">{it.answer}</div>
                  </details>
                </div>
              ))}
            </div>
          </div>

          <div className="skz-glass p-4">
            <div className="text-sm font-semibold">Audio prompts</div>
            <div className="text-xs text-slate-500 mt-1">
              Parent can read these out loud (or connect to voice later).
            </div>
            <div className="mt-3 space-y-2">
              {out.audioPrompts.map((p, idx) => (
                <div key={idx} className="skz-chip px-3 py-2 text-sm">{p}</div>
              ))}
            </div>

            <div className="mt-4 skz-divider" />
            <div className="mt-4 text-sm text-slate-700">
              Want to go deeper? Turn this into a custom lesson in the Lesson Builder.
            </div>
            <a href="/app/tools/lesson-builder" className="mt-3 inline-block skz-glass skz-border-animate skz-shine px-4 py-2 skz-press text-sm">
              Open lesson builder →
            </a>
          </div>
        </div>
      </div>
    </PageMotion>
  );
}
