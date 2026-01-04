import { getOpenAICompatConfig, openaiChatCompletions } from "@/lib/ai/openaiCompat";

export const runtime = "nodejs";

const safeSubjectName = (id) => ({ MATH: "Maths", ENG: "English", SCI: "Science" }[id] || "Subject");

function templateLesson({ prompt, yearLevel, subject, goalType, style }) {
  const subjectName = safeSubjectName(subject);
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
      notes: "AI generation failed or not configured; using fallback template."
    },
    hook: {
      text: `Hook Question: Before we start, what do you already know about "${prompt}"?`
    },
    explanation:
`Deep Explanation (Year ${yearLevel}, ${subjectName})
1) What it means:
- ${prompt} is an important concept.

2) How it works:
- Step 1: Look at the problem.
- Step 2: Think about the rules.
- Step 3: Check your answer.`,
    worked_examples: [
      `Example 1:
- Problem based on "${prompt}"
- Steps shown clearly`
    ],
    memory_strategies: `Remember: Take your time and check your work.`,
    practice_activities: [
      {
        title: "Activity 1",
        type: "practice_set",
        instructions: "Try 3 practice questions."
      }
    ],
    quiz: {
      question: `Quick check: What is "${prompt}"?`,
      options: [
        { text: "The correct answer", correct: true, feedback: "Correct!" },
        { text: "A wrong answer", correct: false, feedback: "Try again." }
      ]
    },
    explain_it_back: "Tell someone what you learned today.",
    confidence_check: "How did this feel? 😊 Easy · 😐 Tricky · 🤔 Confusing"
  };
}

function extractJson(text) {
  if (!text) return null;
  const s = String(text).trim();
  const cleaned = s.replace(/```json/gi, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const first = cleaned.indexOf("{");
    const last = cleaned.lastIndexOf("}");
    if (first === -1 || last === -1 || last <= first) return null;
    try { return JSON.parse(cleaned.slice(first, last + 1)); } catch { return null; }
  }
}

async function openAIGenerate(input) {
  // If no API key/URL is set, return null to trigger fallback
  if (!process.env.OPENAI_API_KEY && !process.env.OPENAI_BASE_URL && !process.env.LLM_BASE_URL) return null;

  const cfg = getOpenAICompatConfig();
  const model = process.env.LLM_MODEL || cfg.model || "llama3.2:latest";

  const system = `You are Smart Kidz Lesson Builder. Output valid JSON only.
Rules:
- Australian Curriculum aligned, age-appropriate for Year ${input.yearLevel}.
- Calm tone. No grades. Encourage confidence.
- Use this exact JSON shape:
{title, learning_goal, meta, hook:{text}, explanation, worked_examples:[...], memory_strategies, practice_activities:[{title,type,instructions}], quiz:{question, options:[{text,correct,feedback}]}, explain_it_back, confidence_check}
`;

  const user = `Build a custom lesson:
Prompt: ${input.prompt}
Subject: ${input.subject}
Goal: ${input.goalType}
Style: ${input.style}
Return JSON only.`;

  const data = await openaiChatCompletions({
    model,
    temperature: 0.4,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ]
  });
  
  const text = data?.choices?.[0]?.message?.content || "";
  const parsed = extractJson(text);
  if (!parsed) throw new Error("AI returned invalid JSON");
  return parsed;
}

export async function POST(req) {
  try {
    const input = await req.json();
    let lesson = null;

    try {
      lesson = await openAIGenerate(input);
    } catch (e) {
      console.warn("AI generation failed, falling back to template:", e.message);
    }

    if (!lesson) {
      lesson = templateLesson(input);
    }

    return new Response(JSON.stringify({ lesson }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || "Failed" }), { status: 500 });
  }
}