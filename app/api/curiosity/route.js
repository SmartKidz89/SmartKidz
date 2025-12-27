import { NextResponse } from "next/server";
import { validatePrompt } from "@/lib/safety/guardrails";

export const runtime = "nodejs";

// Smart fallbacks for when AI is unavailable
const FALLBACKS = [
  {
    keywords: ["plant", "flower", "tree", "grow", "drink", "water"],
    response: {
      title: "Thirsty Plants",
      explanation: "Plants drink water through their roots! Imagine using a straw—plants have tiny tubes inside their stems called 'xylem'. Water sticks to the sides of these tubes and climbs up from the dirt all the way to the leaves.",
      realWorld: "Put a celery stick in water with food colouring. In a few hours, the leaves will change colour as it drinks!",
      activity: "Check the soil of a houseplant. Is it dry? Give it a drink and watch it perk up.",
      quiz: [
        { question: "What part of the plant sucks up water?", answer: "The roots." },
        { question: "What are the tiny tubes called?", answer: "Xylem." }
      ]
    }
  },
  {
    keywords: ["sky", "blue", "colour", "color"],
    response: {
      title: "Blue Sky Science",
      explanation: "Sunlight looks white, but it's made of all colours of the rainbow. When sunlight hits our air, the blue light scatters (bounces around) more than red or yellow. So when you look up, you see blue light everywhere!",
      realWorld: "At sunset, the sun is lower. The light travels through more air, scattering the blue away and leaving red and orange.",
      activity: "Shine a torch through a glass of milky water. The water might look a bit blue, and the light coming out the end might look orange!",
      quiz: [
        { question: "Is sunlight just one colour?", answer: "No, it's all colours mixed together." },
        { question: "Which colour scatters the most?", answer: "Blue." }
      ]
    }
  },
  {
    keywords: ["sleep", "dream", "tired", "bed"],
    response: {
      title: "Brain Power",
      explanation: "Sleep is like a battery charger for your brain. While you sleep, your brain sorts out everything you learned today and stores it as memories. It also helps your body grow and fix itself.",
      realWorld: "Have you ever felt grumpy when you didn't sleep enough? That's your brain asking for a recharge.",
      activity: "Try to go to bed at the same time tonight. See if you wake up feeling faster and stronger.",
      quiz: [
        { question: "What does your brain do while you sleep?", answer: " It saves memories and recharges." },
        { question: "Does sleep help you grow?", answer: "Yes!" }
      ]
    }
  },
  {
    keywords: ["magnet", "stick", "metal"],
    response: {
      title: "Magic Magnets",
      explanation: "Magnets have an invisible force field! They have a North pole and a South pole. Opposites attract (pull together), but the same poles repel (push apart). They love sticking to metals like iron and steel.",
      realWorld: "Your fridge door stays closed because of magnets. Compass needles point North because Earth is a giant magnet!",
      activity: "Find a magnet and see what it sticks to. Does it stick to a coin? A spoon? A plastic toy?",
      quiz: [
        { question: "What happens if you put two North poles together?", answer: "They push apart (repel)." },
        { question: "Do magnets stick to plastic?", answer: "No, usually only specific metals." }
      ]
    }
  }
];

const GENERIC_FALLBACK = {
  title: "Good Question!",
  explanation: "That's a fascinating thing to wonder about. Scientists learn by asking questions just like this. Keep observing the world around you to find the answer!",
  realWorld: "Ask a parent or teacher to help you look this up in a book or online.",
  activity: "Draw a picture of what you think the answer might be.",
  quiz: [
    { question: "What do scientists do?", answer: "They ask questions and test ideas." }
  ]
};

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  if (!q) return NextResponse.json({ error: "No question provided" }, { status: 400 });

  try {
    // 1. Safety Check
    validatePrompt(q);

    // 2. Try OpenAI if configured
    if (process.env.OPENAI_API_KEY) {
      try {
        const res = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: [
              { 
                role: "system", 
                content: `You are a science teacher for a 7-year-old. Explain the answer simply.
                Return JSON: {
                  "title": "Short Fun Title",
                  "explanation": "2-3 sentences explaining simply.",
                  "realWorld": "A real life example.",
                  "activity": "A simple safe experiment or observation.",
                  "quiz": [{"question": "...", "answer": "..."}] (2 questions)
                }` 
              },
              { role: "user", content: q }
            ],
            temperature: 0.5
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            const json = JSON.parse(content.replace(/```json/g, "").replace(/```/g, "").trim());
            return NextResponse.json(json);
          }
        }
      } catch (e) {
        console.error("AI Curiosity failed", e);
      }
    }

    // 3. Fallback: Keyword Matching
    const lowerQ = q.toLowerCase();
    const match = FALLBACKS.find(f => f.keywords.some(k => lowerQ.includes(k)));
    
    return NextResponse.json(match ? match.response : GENERIC_FALLBACK);

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}