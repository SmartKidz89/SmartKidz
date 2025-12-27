export const runtime = "nodejs";
/**
 * Lesson Builder API
 * - Generates a structured, curriculum-aligned lesson plan from a prompt.
 *
 * NOTE: This endpoint supports an optional OpenAI integration if you set OPENAI_API_KEY.
 * If not set, it returns a high-quality deterministic template so the app works out-of-the-box.
 */

const safeSubjectName = (id) => ({ MATH: "Maths", ENG: "English", SCI: "Science" }[id] || "Subject");

function templateLesson({ prompt, yearLevel, subject, goalType, style }) {
  const subjectName = safeSubjectName(subject);
  const goalName =
    goalType === "support" ? "Support" :
    goalType === "extend" ? "Extension" : "Reinforcement";

  const title = `${subjectName} · Year ${yearLevel} · Custom Lesson`;
  const learning_goal = `Build understanding and confidence in: ${prompt}`;

  return {
    title,
    learning_goal,
    meta: {
      subject,
      year_level: yearLevel,
      goal_type: goalType,
      preferred_style: style,
      generated_with: "template",
      notes: "Set OPENAI_API_KEY to enable AI generation."
    },
    hook: {
      text:
        style === "story"
          ? `Story Hook: Imagine you're helping a friend solve a real-life problem related to "${prompt}". What would you notice first?`
          : `Hook Question: Before we start, what do you already know about "${prompt}"?`
    },
    explanation:
`Deep Explanation (Year ${yearLevel}, ${subjectName})
1) What it means (kid-friendly):
- Define the idea in simple words.
- Explain why it matters in the real world.

2) How it works (step-by-step):
- Step A: Identify the key parts.
- Step B: Apply the rule or process.
- Step C: Check your answer.

3) Common mistakes (and how to avoid them):
- Mistake 1: Confusing similar terms.
- Fix: Use a quick check.
- Mistake 2: Skipping a step.
- Fix: Use a simple checklist.

4) Quick self-check:
- Can you explain the idea in one sentence?
- Can you show it with a picture or example?`,
    worked_examples: [
      `Example 1 (guided):
- Problem based on "${prompt}"
- Steps shown clearly
- Final answer + check`,
      `Example 2 (you try):
- Similar problem
- Hints included
- Answer explained`
    ],
    memory_strategies:
`Memory Strategies:
- Name it: Create a simple nickname for the idea.
- Picture it: Draw a tiny diagram that represents it.
- Say it: Use a short sentence you repeat each time.
- Spot it: “When you see ___, remember to ___.”`,
    practice_activities: [
      {
        title: "Activity 1: Multiple Scenarios",
        type: "practice_set",
        instructions:
          "Practise the same skill in 5 different mini-scenarios. Start easy and gradually increase difficulty."
      },
      {
        title: "Activity 2: Mixed Review",
        type: "mixed_review",
        instructions:
          "Mix this skill with a closely related skill so the learner must choose the right method."
      },
      {
        title: "Activity 3: Challenge Round",
        type: "challenge",
        instructions:
          "One slightly harder problem. If it’s tricky, use a hint and try again."
      }
    ],
    quiz: {
      question: `Quick check: Which option best matches the idea of "${prompt}"?`,
      options: [
        { text: "Option A (best answer)", correct: true, feedback: "Great — this matches the concept." },
        { text: "Option B", correct: false, feedback: "Close, but it misses a key detail." },
        { text: "Option C", correct: false, feedback: "Not quite — try the explanation again." }
      ]
    },
    explain_it_back:
      "Explain it back (voice or text): Teach this idea to someone younger in 3 sentences. Use one example.",
    confidence_check:
      "How did this feel? 😊 Easy · 😐 Tricky · 🤔 Confusing"
  };
}

// Optional OpenAI generation (kept simple, safe defaults)
async function openAIGenerate(input) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  // Minimal OpenAI REST call (no SDK). If you prefer the SDK, replace later.
  const system = `You are Smart Kidz Lesson Builder. Output valid JSON only.
Rules:
- Australian Curriculum aligned, age-appropriate for the given year level.
- Calm tone. No grades. Encourage confidence.
- Use this exact JSON shape:
{title, learning_goal, meta, hook:{text}, explanation, worked_examples:[...], memory_strategies, practice_activities:[{title,type,instructions}], quiz:{question, options:[{text,correct,feedback}]}, explain_it_back, confidence_check}
- explanation must be detailed and step-by-step.
- include memory_strategies with “When you see ___, remember ___”.
- practice_activities must include multiple scenarios and one challenge.
`;

  const user = `Build a custom lesson with:
prompt: ${input.prompt}
year_level: ${input.yearLevel}
subject: ${input.subject}
goal_type: ${input.goalType}
preferred_style: ${input.style}
Return JSON only.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    })
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI error: ${t}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content || "";
  return JSON.parse(text);
}

export async function POST(req) {
  try {
    const input = await req.json();

    const required = ["prompt","yearLevel","subject","goalType","style"];
    for (const k of required) {
      if (input[k] === undefined || input[k] === null || input[k] === "") {
        return Response.json({ error: `Missing ${k}` }, { status: 400 });
      }
    }

    let lesson = null;

    // Try OpenAI if configured, otherwise fallback to template
    try {
      lesson = await openAIGenerate(input);
    } catch (e) {
      // If OpenAI fails, return template (do not break UX)
      lesson = null;
    }

    if (!lesson) {
      lesson = templateLesson(input);
    }

    return Response.json({ lesson });
  } catch (err) {
    return Response.json({ error: err?.message || "Failed to build lesson" }, { status: 500 });
  }
}
