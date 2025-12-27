"use client";

import { PageMotion } from "@/components/ui/PremiumMotion";
import { useTheme } from "@/components/ui/ThemeProvider";
import { THEME_PRESETS } from "@/lib/themePresets";
import { ChevronLeft, Check } from "lucide-react";
import { playUISound, haptic } from "@/components/ui/sound";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function ThemePickerPage() {
  const router = useRouter();
  const { themeId, setThemeId } = useTheme();

  const handleSelect = (id) => {
    if (id === themeId) return;
    setThemeId(id);
    playUISound("tap");
    haptic("light");
  };

  return (
    <PageMotion className="max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 px-4 md:px-0">
        <button 
          onClick={() => router.back()}
          className="h-12 w-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
        >
           <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pick a Theme</h1>
           <p className="text-slate-600 font-medium">Change how your dashboard looks.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 md:px-0">
        {THEME_PRESETS.map((t, i) => {
          const isActive = t.id === themeId;
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => handleSelect(t.id)}
              className={`group relative aspect-square rounded-[2rem] overflow-hidden border-4 transition-all duration-300 ${
                isActive 
                  ? "border-slate-900 scale-105 shadow-xl z-10" 
                  : "border-white hover:border-white/50 hover:scale-102 hover:shadow-lg"
              }`}
            >
              {/* Theme Preview Gradient */}
              <div 
                className="absolute inset-0"
                style={{ background: t.bgGradient }}
              />
              
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <span className="text-4xl filter drop-shadow-md group-hover:scale-110 transition-transform duration-300">
                  {t.emoji}
                </span>
                <span className={`text-sm font-black uppercase tracking-wider ${isActive ? "text-slate-900" : "text-slate-700/80"}`}>
                  {t.name}
                </span>
              </div>

              {isActive && (
                <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-sm">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </PageMotion>
  );
}