"use client";

import { useMemo, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { playUISound, haptic } from "@/components/ui/sound";
import { Sparkles, ArrowLeft, Send, BookOpen, Lightbulb, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Reusing existing logic but with new UI wrapper
function buildAnswer(question, year) {
  // Offline mock logic from previous implementation
  const y = typeof year === "number" ? year : 2;
  const q = (question || "").trim();
  const s = q.toLowerCase();
  
  const topic =
    s.includes("sky") || s.includes("plant") || s.includes("magnet") || s.includes("sleep") ? "science"
    : s.includes("fraction") || s.includes("add") || s.includes("minus") || s.match(/\d/) ? "maths"
    : "words";

  const explanation =
    topic === "science"
      ? `The sky looks blue because sunlight is made of many colours. When light goes through the air, blue light scatters more than other colours, so we see more blue.`
      : topic === "maths"
      ? `Math helps us solve real problems. We can break big numbers into smaller parts and combine them.`
      : `Words are tools. When you know a word’s meaning and can use it in a sentence, you really own it.`;

  const activity =
    topic === "science" ? "Shine a torch through a glass of water with a tiny drop of milk to see light scatter."
    : topic === "maths" ? "Pick two 2-digit numbers. Split into tens and ones. Add tens, then ones."
    : "Make a ‘word card’: word, meaning, and a sentence you wrote.";

  return { topic, explanation, activity };
}

export default function CuriosityExplorerPage() {
  const { activeChild } = useActiveChild();
  const year = activeChild?.year_level || 2;
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]); // { type: 'user'|'bot', content: ... }
  const [loading, setLoading] = useState(false);

  async function handleAsk(e) {
    e?.preventDefault();
    if (!input.trim()) return;

    const q = input;
    setInput("");
    setMessages(prev => [...prev, { type: "user", content: q }]);
    setLoading(true);
    playUISound("tap");

    // Simulate think time
    setTimeout(() => {
      const ans = buildAnswer(q, year);
      setMessages(prev => [...prev, { type: "bot", content: ans }]);
      setLoading(false);
      playUISound("success");
    }, 1200);
  }

  return (
    <PageMotion className="max-w-3xl mx-auto h-[calc(100vh-140px)] flex flex-col">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <Button variant="ghost" onClick={() => history.back()} className="h-12 w-12 rounded-full p-0">
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-500 fill-current" />
            Wonder Box
          </h1>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 pb-6 scroll-smooth">
        {messages.length === 0 && (
          <div className="text-center py-20 opacity-50">
             <div className="text-6xl mb-4">🤔</div>
             <p className="text-xl font-bold">What are you wondering about?</p>
             <div className="flex flex-wrap justify-center gap-2 mt-6">
                {["Why is the sky blue?", "How do plants eat?", "What is a fraction?"].map(s => (
                  <button key={s} onClick={() => { setInput(s); }} className="px-4 py-2 bg-white rounded-full border border-slate-200 text-sm font-bold hover:bg-purple-50 hover:text-purple-700 transition-colors">
                    {s}
                  </button>
                ))}
             </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.type === 'user' ? (
              <div className="bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] rounded-tr-none text-lg font-medium shadow-md max-w-[80%]">
                {m.content}
              </div>
            ) : (
              <div className="bg-white border border-purple-100 p-6 rounded-[2rem] rounded-tl-none shadow-xl max-w-[90%] w-full">
                 <div className="mb-4 text-lg text-slate-800 leading-relaxed font-medium">
                   {m.content.explanation}
                 </div>
                 
                 <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                      <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wide mb-2">
                        <Lightbulb className="w-4 h-4" /> Try This
                      </div>
                      <p className="text-sm text-slate-700">{m.content.activity}</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                      <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wide mb-2">
                        <GraduationCap className="w-4 h-4" /> Topic
                      </div>
                      <p className="text-sm text-slate-700 capitalize">{m.content.topic}</p>
                    </div>
                 </div>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
           <div className="flex justify-start">
             <div className="bg-white px-6 py-4 rounded-[1.5rem] rounded-tl-none shadow-sm border border-slate-100">
               <div className="flex gap-1">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
               </div>
             </div>
           </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleAsk} className="relative shrink-0 mt-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="w-full h-16 pl-6 pr-16 rounded-[2rem] border-2 border-slate-200 bg-white text-lg font-medium shadow-lg focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all"
        />
        <button 
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2 top-2 h-12 w-12 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors"
        >
          <Send className="w-5 h-5 ml-0.5" />
        </button>
      </form>
    </PageMotion>
  );
}