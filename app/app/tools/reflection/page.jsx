"use client";

import { useEffect, useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { useActiveChild } from "@/hooks/useActiveChild";
import { supabase } from "@/lib/supabase/client";
import { playUISound, haptic } from "@/components/ui/sound";
import { Smile, Frown, Meh, Star, ArrowRight, Save, History } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOODS = [
  { id: "happy", label: "Happy", icon: <Smile className="w-8 h-8" />, color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  { id: "ok", label: "Okay", icon: <Meh className="w-8 h-8" />, color: "bg-amber-100 text-amber-700 border-amber-200" },
  { id: "stuck", label: "Stuck", icon: <Frown className="w-8 h-8" />, color: "bg-rose-100 text-rose-700 border-rose-200" },
  { id: "proud", label: "Proud", icon: <Star className="w-8 h-8" />, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
];

function ReflectionHistory({ childId, refreshTrigger }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!childId) return;
    supabase
      .from("child_reflections")
      .select("*")
      .eq("child_id", childId)
      .order("created_at", { ascending: false })
      .limit(5)
      .then(({ data }) => setItems(data || []));
  }, [childId, refreshTrigger]);

  if (!items.length) return null;

  return (
    <div className="mt-8">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <History className="w-4 h-4" /> Past Thoughts
      </h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-white/60 p-4 rounded-2xl border border-slate-100 text-sm">
             <div className="flex items-center gap-2 mb-1">
                <span className="font-bold capitalize text-slate-900">{item.mood}</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500">{new Date(item.created_at).toLocaleDateString()}</span>
             </div>
             {item.proud && <div className="text-slate-700">🏆 {item.proud}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ReflectionToolPage() {
  const { activeChild } = useActiveChild();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({ mood: null, easy: "", tricky: "", proud: "" });
  const [saving, setSaving] = useState(false);
  const [completed, setCompleted] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await supabase.from("child_reflections").insert({
        child_id: activeChild?.id,
        ...data,
      });
      playUISound("complete");
      haptic("medium");
      setCompleted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  const next = () => {
    playUISound("tap");
    setStep(s => s + 1);
  };

  if (completed) {
    return (
      <PageMotion className="max-w-xl mx-auto py-20 text-center">
        <div className="bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100">
          <div className="text-6xl mb-6 animate-bounce">🌟</div>
          <h1 className="text-3xl font-black text-slate-900 mb-4">Saved!</h1>
          <p className="text-slate-600 font-medium text-lg mb-8">
            Great job reflecting on your learning today.
          </p>
          <button 
            onClick={() => { setCompleted(false); setStep(1); setData({ mood: null, easy: "", tricky: "", proud: "" }); }}
            className="w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg hover:scale-105 transition-transform"
          >
            Check in again
          </button>
        </div>
        <ReflectionHistory childId={activeChild?.id} refreshTrigger={completed} />
      </PageMotion>
    );
  }

  return (
    <PageMotion className="max-w-2xl mx-auto pb-20">
      {/* Progress Bar */}
      <div className="flex gap-2 mb-8 px-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${i <= step ? "bg-brand-primary" : "bg-slate-200"}`} />
        ))}
      </div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 shadow-xl border border-white/50 min-h-[400px] flex flex-col relative overflow-hidden">
        
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-center"
            >
              <h2 className="text-3xl font-black text-center text-slate-900 mb-8">How are you feeling?</h2>
              <div className="grid grid-cols-2 gap-4">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setData({...data, mood: m.id}); next(); }}
                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95 ${m.color} bg-opacity-10 border-opacity-20 hover:bg-opacity-20`}
                  >
                    {m.icon}
                    <span className="font-bold text-lg">{m.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-2">What felt easy today?</h2>
              <p className="text-slate-500 font-medium mb-6">Or something that was fun!</p>
              <textarea
                autoFocus
                value={data.easy}
                onChange={(e) => setData({...data, easy: e.target.value})}
                placeholder="I enjoyed..."
                className="w-full h-40 rounded-2xl border-2 border-slate-200 p-4 text-lg font-medium focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all resize-none bg-slate-50 focus:bg-white"
              />
              <div className="mt-auto pt-6 flex justify-end">
                <button onClick={next} className="px-8 py-3 rounded-2xl bg-slate-900 text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-2">What was tricky?</h2>
              <p className="text-slate-500 font-medium mb-6">It's okay to find things hard sometimes.</p>
              <textarea
                autoFocus
                value={data.tricky}
                onChange={(e) => setData({...data, tricky: e.target.value})}
                placeholder="I got stuck on..."
                className="w-full h-40 rounded-2xl border-2 border-slate-200 p-4 text-lg font-medium focus:border-rose-400 focus:ring-4 focus:ring-rose-100 outline-none transition-all resize-none bg-slate-50 focus:bg-white"
              />
              <div className="mt-auto pt-6 flex justify-end">
                <button onClick={next} className="px-8 py-3 rounded-2xl bg-slate-900 text-white font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                  Next <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-2">What are you proud of?</h2>
              <p className="text-slate-500 font-medium mb-6">Big or small, a win is a win!</p>
              <textarea
                autoFocus
                value={data.proud}
                onChange={(e) => setData({...data, proud: e.target.value})}
                placeholder="I am proud that I..."
                className="w-full h-40 rounded-2xl border-2 border-slate-200 p-4 text-lg font-medium focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all resize-none bg-slate-50 focus:bg-white"
              />
              <div className="mt-auto pt-6 flex justify-end">
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  {saving ? "Saving..." : "Save Reflection"} <Save className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="text-center mt-6">
        <button onClick={() => history.back()} className="text-slate-400 font-bold hover:text-slate-600 text-sm">
          Cancel & Exit
        </button>
      </div>
    </PageMotion>
  );
}