"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RileyAssistant } from "@/components/app/RileyAssistant";
import { playUISound, haptic } from "@/components/ui/sound";
import { Check, RefreshCw, AlertCircle, Wand2, ChevronLeft } from "lucide-react";
import Link from "next/link";
import ConfettiBurst from "@/components/app/ConfettiBurst";

const CHALLENGES = [
  "Fix this: i like to eat pizza",
  "Fix this: where is the dog",
  "Fix this: The cat runned fast.",
  "Make a sentence with: happy, dog, park",
  "Fix this: my friend sarah is nice",
];

export default function GrammarClient() {
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showRiley, setShowRiley] = useState(false);
  const [rileyTips, setRileyTips] = useState([]);
  const [isCorrect, setIsCorrect] = useState(false);

  function checkSentence() {
    const t = text.trim();
    if (!t) return;

    let errors = [];
    let tips = [];

    // 1. Capitalization
    if (t.length > 0 && t[0] !== t[0].toUpperCase()) {
      errors.push("Start with a capital letter.");
      tips.push("Sentences always start with a big letter! Try changing '" + t[0] + "' to '" + t[0].toUpperCase() + "'.");
    }

    // 2. Ending punctuation
    if (!/[.!?]$/.test(t)) {
      errors.push("Missing end punctuation.");
      tips.push("Don't forget to put a full stop (.), question mark (?), or exclamation mark (!) at the end.");
    }

    // 3. 'I' rule
    if (/\bi\b/.test(t)) {
      errors.push("Capitalize 'I'.");
      tips.push("When you talk about yourself, 'I' is always a capital letter.");
    }

    // 4. Basic grammar (very simple heuristics)
    if (/\brunned\b/i.test(t)) {
      errors.push("Incorrect verb: 'runned'.");
      tips.push("The past tense of 'run' is 'ran'.");
    }

    if (errors.length === 0) {
      setFeedback({ status: "correct", msg: "Great sentence!" });
      setIsCorrect(true);
      setRileyTips(["Perfect! No errors found.", "You remembered your capital letters and punctuation."]);
      playUISound("success");
      haptic("medium");
      // Delay Riley slightly for celebration effect
      setTimeout(() => setShowRiley(true), 500);
    } else {
      setFeedback({ status: "error", msg: "Found a few things to fix." });
      setIsCorrect(false);
      setRileyTips(tips);
      playUISound("error");
      haptic("light");
      setShowRiley(true);
    }
  }

  function pickChallenge() {
    const c = CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
    setText(c.startsWith("Fix this: ") ? c.replace("Fix this: ", "") : "");
    setFeedback(null);
    setIsCorrect(false);
    setShowRiley(false);
  }

  return (
    <PageMotion className="max-w-3xl mx-auto pb-20">
      <ConfettiBurst show={isCorrect} />
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/app/tools" className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Grammar Gym</h1>
          <p className="text-slate-600 font-medium">Build strong sentences.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="p-6 md:p-8 bg-white/80 backdrop-blur-xl border-slate-200 shadow-xl">
          <div className="mb-4 flex justify-between items-center">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Your Sentence
            </label>
            <button 
              onClick={pickChallenge}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> New Challenge
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setFeedback(null);
              setIsCorrect(false);
            }}
            placeholder="Type a sentence here..."
            className={`w-full h-40 text-2xl font-medium p-4 rounded-2xl bg-slate-50 border-2 outline-none transition-all resize-none ${
              feedback?.status === "error" ? "border-rose-200 focus:border-rose-400 bg-rose-50/30" : 
              feedback?.status === "correct" ? "border-emerald-200 focus:border-emerald-400 bg-emerald-50/30" : 
              "border-slate-200 focus:border-indigo-400"
            }`}
          />

          <div className="mt-6 flex items-center justify-between">
            <div className="flex-1">
              {feedback && (
                <div className={`flex items-center gap-2 font-bold ${
                  feedback.status === "correct" ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {feedback.status === "correct" ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                  {feedback.msg}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setRileyTips(["Try starting with a capital letter.", "Make sure to end with a full stop."]);
                  setShowRiley(true);
                }}
              >
                Ask Riley
              </Button>
              <Button onClick={checkSentence} disabled={!text.trim()} className="shadow-lg px-8">
                <Wand2 className="w-4 h-4 mr-2" /> Check
              </Button>
            </div>
          </div>
        </Card>

        <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-start gap-4">
           <div className="text-3xl">💡</div>
           <div>
             <h3 className="font-bold text-indigo-900 text-lg">Pro Tip</h3>
             <p className="text-indigo-700 leading-relaxed">
               A sentence needs a <strong>Subject</strong> (who) and a <strong>Verb</strong> (action).
               <br/>
               Example: <span className="font-bold">The cat</span> (who) <span className="font-bold">sat</span> (action).
             </p>
           </div>
        </div>
      </div>

      <RileyAssistant 
        open={showRiley} 
        onClose={() => setShowRiley(false)} 
        title={isCorrect ? "Way to go!" : "Let's fix it together"}
        tips={rileyTips}
      />
    </PageMotion>
  );
}