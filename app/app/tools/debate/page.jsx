"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Mic, RefreshCw, ChevronLeft, StopCircle, Clock, Check } from "lucide-react";
import Link from "next/link";
import ConfettiBurst from "@/components/app/ConfettiBurst";

const TOPICS = [
  "Is summer better than winter?",
  "Should homework be banned?",
  "Are cats smarter than dogs?",
  "Is it better to read the book or watch the movie?",
  "Should kids have later bedtimes?",
  "Is pizza the best food in the world?",
  "Should video games be a school subject?"
];

export default function DebateClubPage() {
  const [topic, setTopic] = useState(TOPICS[0]);
  const [timer, setTimer] = useState(0); // seconds
  const [active, setActive] = useState(false);
  const [finished, setFinished] = useState(false);

  function newTopic() {
    const next = TOPICS[Math.floor(Math.random() * TOPICS.length)];
    setTopic(next);
    setTimer(0);
    setActive(false);
    setFinished(false);
  }

  // Simple Timer Effect
  useState(() => {
    const int = setInterval(() => {
      if (active) setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(int);
  }, [active]);

  function toggleTimer() {
    setActive(!active);
    if (!active && timer > 0) return; // Resume
  }

  function finish() {
    setActive(false);
    setFinished(true);
  }

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <PageMotion className="max-w-2xl mx-auto pb-20 pt-10 px-4">
      <ConfettiBurst show={finished} />

      <div className="flex items-center gap-4 mb-8">
        <Link href="/app/tools" className="p-3 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-600" />
        </Link>
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Debate Club</h1>
           <p className="text-slate-600 font-medium">Pick a side. Make your case.</p>
        </div>
      </div>

      <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-indigo-50 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <Mic className="w-48 h-48" />
        </div>

        <div className="relative z-10">
           <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4">Current Topic</div>
           <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-8 leading-tight">
             "{topic}"
           </h2>

           <div className="flex justify-center gap-4 mb-10">
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 w-32">
                <div className="text-xs font-bold text-slate-400 uppercase">For</div>
                <div className="text-2xl">👍</div>
             </div>
             <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 w-32">
                <div className="text-xs font-bold text-slate-400 uppercase">Against</div>
                <div className="text-2xl">👎</div>
             </div>
           </div>

           <div className="bg-slate-900 text-white rounded-full inline-flex items-center px-6 py-3 font-mono text-xl font-bold mb-8 shadow-lg">
             <Clock className="w-5 h-5 mr-3 text-emerald-400" />
             {formatTime(timer)}
           </div>

           <div className="flex flex-wrap justify-center gap-3">
              {!active && !finished && (
                <Button onClick={() => setActive(true)} className="h-14 px-8 text-lg bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20">
                   Start Talking
                </Button>
              )}
              {active && (
                <Button onClick={finish} className="h-14 px-8 text-lg bg-rose-500 hover:bg-rose-600 shadow-rose-500/20">
                   <StopCircle className="w-5 h-5 mr-2" /> Finish
                </Button>
              )}
              {finished && (
                <div className="flex gap-2">
                  <Button disabled className="h-14 px-6 bg-slate-100 text-slate-400 border-none shadow-none">
                    <Check className="w-5 h-5 mr-2" /> Done
                  </Button>
                  <Button onClick={newTopic} variant="secondary" className="h-14 px-6">
                    Next Topic
                  </Button>
                </div>
              )}
              
              {!active && !finished && (
                <Button onClick={newTopic} variant="ghost" className="h-14 w-14 p-0 rounded-full border-2">
                   <RefreshCw className="w-5 h-5" />
                </Button>
              )}
           </div>
        </div>
      </Card>

      <div className="mt-8 bg-amber-50 border border-amber-100 p-6 rounded-3xl text-center text-amber-900 text-sm font-medium">
         <strong>Tip:</strong> Use words like "Firstly", "However", and "In my opinion" to make your argument stronger!
      </div>
    </PageMotion>
  );
}