import { NextResponse } from "next/server";
import { validatePrompt } from "@/lib/safety/guardrails";

export const runtime = "nodejs";

const FALLBACK_TOPICS = {
  multiplication: {
    title: "Multiplication Mastery",
    theory: "Multiplication is repeated addition. 3 × 4 means '3 groups of 4'.\n\nTo solve bigger numbers, break them down. For 12 × 4, think: (10 × 4) + (2 × 4).",
    tips: [
      "Any number × 0 is always 0.",
      "Any number × 1 is the number itself.",
      "The order doesn't matter: 5 × 3 is the same as 3 × 5."
    ],
    generateQ: (i) => {
      const a = Math.floor(Math.random() * 12) + 1;
      const b = Math.floor(Math.random() * 12) + 1;
      return { q: `${a} × ${b} = ?`, a: `${a * b}` };
    }
  },
  addition: {
    title: "Awesome Addition",
    theory: "Addition is bringing two amounts together to make a total. Line up your numbers by place value (ones, tens, hundreds) to avoid mistakes.",
    tips: [
      "Look for pairs that make 10 (like 6 + 4, 7 + 3).",
      "Start adding from the ones column (right side).",
      "Double check your carrying."
    ],
    generateQ: (i) => {
      const a = Math.floor(Math.random() * 90) + 10;
      const b = Math.floor(Math.random() * 90) + 10;
      return { q: `${a} + ${b} = ?`, a: `${a + b}` };
    }
  },
  writing: {
    title: "Creative Writing",
    theory: "Good writing has a beginning, a middle, and an end. Use describing words (adjectives) to help the reader see what you see.",
    tips: [
      "Start sentences with a capital letter.",
      "End with a full stop, question mark, or exclamation mark.",
      "Read your sentence out loud to check if it makes sense."
    ],
    generateQ: (i) => {
      const prompts = ["The lost key", "A magic door", "The flying dog", "My best day", "A secret box"];
      return { q: `Write a sentence about: ${prompts[i % prompts.length]}`, a: "Answers will vary." };
    }
  }
};

function generateFallback(prompt, count) {
  const p = prompt.toLowerCase();
  let topic = FALLBACK_TOPICS.multiplication; 
  
  if (p.includes("add") || p.includes("sum") || p.includes("plus")) topic = FALLBACK_TOPICS.addition;
  else if (p.includes("writ") || p.includes("sent") || p.includes("story")) topic = FALLBACK_TOPICS.writing;

  const questions = [];
  const answers = [];
  
  for (let i = 0; i < count; i++) {
    const item = topic.generateQ(i);
    questions.push({ id: i + 1, text: item.q, space: 2 });
    answers.push({ id: i + 1, text: item.a });
  }

  return {
    title: topic.title,
    theory: topic.theory,
    tips: topic.tips,
    questions,
    answers
  };
}

export async function POST(req) {
  try {
    const { prompt, yearLevel, count = 10 } = await req.json();
    
    if (!prompt) {
      return NextResponse.json({ error: "Please enter a prompt." }, { status: 400 });
    }

    // Safety Check
    try {
      validatePrompt(prompt);
    } catch (err) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }

    // 1. Try OpenAI if key is present
    if (process.env.OPENAI_API_KEY) {
      try {
        const systemPrompt = `You are a teacher creating a worksheet for a Year ${yearLevel} student.
        User request: "${prompt}".
        
        ENSURE CONTENT IS G-RATED and age-appropriate.
        
        Return a valid JSON object with:
        - title: string
        - theory: string (short paragraph explaining the concept, markdown allowed)
        - tips: array of strings (3-4 helpful tips or memory tricks)
        - questions: array of { id: number, text: string, space: number (lines needed, 1-4) }
        - answers: array of { id: number, text: string }
        
        Generate exactly ${count} questions. Keep tone encouraging.`;

        const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemPrompt },
            ],
            temperature: 0.7
          })
        });

        if (aiRes.ok) {
          const data = await aiRes.json();
          const raw = data.choices?.[0]?.message?.content;
          if (raw) {
            const jsonStr = raw.replace(/```json/g, "").replace(/```/g, "").trim();
            const result = JSON.parse(jsonStr);
            return NextResponse.json(result);
          }
        }
      } catch (e) {
        console.error("AI Worksheet generation failed", e);
      }
    }

    // 2. Fallback
    const fallback = generateFallback(prompt, count);
    return NextResponse.json(fallback);

  } catch (e) {
    return NextResponse.json({ error: e.message || "Failed to generate worksheet" }, { status: 500 });
  }
}