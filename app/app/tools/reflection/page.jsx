"use client";

import { useEffect, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { supabase } from "@/lib/supabase/client";
import { playUISound, haptic } from "@/components/ui/sound";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, ChevronLeft } from "lucide-react";
import Link from "next/link";
import ConfettiBurst from "@/components/app/ConfettiBurst";

const MOODS = [
  { k: "happy", label: "Happy", icon: "😊", color: "bg-amber-100 text-amber-600" },
  { k: "ok", label: "Okay", icon: "🙂", color: "bg-blue-100 text-blue-600" },
  { k: "tired", label: "Tired", icon: "😴", color: "bg-slate-100 text-slate-600" },
  { k: "stuck", label: "Stuck", icon: "😟", color: "bg-rose-100 text-rose-600" },
  { k: "proud", label: "Proud", icon: "🌟", color: "bg-yellow-100 text-yellow-600" },
];

export default function ReflectionToolPage() {
  const { activeChild } = useActiveChild();
  const childId = activeChild?.id;

  const [step, setStep] = useState(0);
  const [data, setData] = useState({ mood: "", easy: "", tricky: "", proud: "" });
  const [saving, setSaving] = useState(false);
  const [complete, setComplete] = useState(false);

  const steps = [
    { id: "mood", title: "How are you feeling?", type: "mood" },
    { id: "proud", title: "What are you proud of today?", type: "text", placeholder: "I finished my maths lesson..." },
    { id: "tricky", title: "Was anything tricky?", type: "text", placeholder: "I got stuck on fractions..." },
    { id: "easy", title: "What felt easy?", type: "text", placeholder: "Reading was fun..." },
  ];

  const currentStep = steps[step];

  const handleNext = () => {
    try { playUISound("tap"); } catch {}
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      handleSave();
    }
  };

  const handleSave = async () => {
    if (!childId) return;
    setSaving(true);
    
    try {
      await supabase.from("child_reflections").insert({
        child_id: childId,
        mood: data.mood,
        proud: data.proud,
        tricky: data.tricky,
        easy: data.easy
      });
      setComplete(true);
      try { playUISound("levelup"); haptic("success"); } catch {}
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (complete) {
    return (
      <PageMotion className="min-h-[80vh] flex items-center justify-center">
        <ConfettiBurst show={true} />
        <div className="text-center p-10 bg-white rounded-[3rem] shadow-2xl border border-slate-100 max-w-lg mx-4">
          <div className="text-8xl mb-6 animate-bounce">🌱</div>
          <h2 className="text-3xl font-black text-slate-900 mb-4">Saved!</h2>
          <p className="text-lg text-slate-600 font-medium mb-8">
            Reflecting helps your brain grow. Great job taking a moment for yourself.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/app/tools" className="px-8 py-3 rounded-full bg-slate-100 text-slate-900 font-bold hover:bg-slate-200 transition-colors">
              Tools
            </Link>
            <Link href="/app" className="px-8 py-3 rounded-full bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors">
              Home
            </Link>
          </div>
        </div>
      </PageMotion>
    );
  }

  return (
    <PageMotion className="max-w-2xl mx-auto pb-20 pt-10">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 px-4">
        <Link href="/app/tools" className="p-2 rounded-full hover:bg-white/50 transition-colors">
          <ChevronLeft className="w-6 h-6 text-slate-500" />
        </Link>
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div 
              key={i} 
              className={`h-2 rounded-full transition-all duration-500 ${i <= step ? "w-8 bg-slate-900" : "w-2 bg-slate-200"}`} 
            />
          ))}
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden"
        >
          <div className="p-8 sm:p-12 min-h-[400px] flex flex-col">
            <h2 className="text-3xl font-black text-slate-900 mb-8 text-center">
              {currentStep.title}
            </h2>

            <div className="flex-1 flex flex-col justify-center">
              {currentStep.type === "mood" ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {MOODS.map((m) => (
                    <button
                      key={m.k}
                      onClick={() => { setData({ ...data, mood: m.k }); setTimeout(handleNext, 300); }}
                      className={`p-4 rounded-3xl border-2 transition-all hover:scale-105 active:scale-95 flex flex-col items-center gap-2 ${
                        data.mood === m.k 
                          ? "border-slate-900 bg-slate-50" 
                          : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl ${m.color}`}>
                        {m.icon}
                      </div>
                      <span className="font-bold text-slate-700">{m.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  autoFocus
                  value={data[currentStep.id]}
                  onChange={(e) => setData({ ...data, [currentStep.id]: e.target.value })}
                  placeholder={currentStep.placeholder}
                  className="w-full h-48 p-6 rounded-3xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white text-xl font-medium text-slate-900 outline-none resize-none transition-all placeholder:text-slate-300"
                />
              )}
            </div>

            <div className="mt-8 flex justify-end">
              {currentStep.type !== "mood" && (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-8 py-4 rounded-full bg-slate-900 text-white font-bold text-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-xl"
                >
                  {step === steps.length - 1 ? (saving ? "Saving..." : "Finish") : "Next"} 
                  {!saving && <ArrowRight className="w-5 h-5" />}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

    </PageMotion>
  );
}