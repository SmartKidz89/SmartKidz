"use client";

import { useState } from "react";
import { PageMotion } from "@/components/ui/PremiumMotion";
import { motion } from "framer-motion";
import Link from "next/link";
import { ChevronLeft, Wind } from "lucide-react";

export default function ZenZonePage() {
  const [active, setActive] = useState(false);

  return (
    <PageMotion className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-sky-50">
      {/* Dynamic BG */}
      <motion.div 
        animate={{ opacity: active ? 0.6 : 0.2 }}
        transition={{ duration: 4, repeat: Infinity, repeatType: "mirror" }}
        className="absolute inset-0 bg-gradient-to-b from-teal-100 to-sky-100 pointer-events-none" 
      />

      <div className="absolute top-6 left-6 z-20">
         <Link href="/app/tools" className="p-3 rounded-full bg-white/50 hover:bg-white transition-colors backdrop-blur-md flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-slate-600" />
         </Link>
      </div>

      <div className="relative z-10 text-center">
         <h1 className="text-3xl font-black text-slate-800/80 mb-12 tracking-tight">Zen Zone</h1>

         {/* Breathing Circle */}
         <div className="relative w-64 h-64 mx-auto mb-12 flex items-center justify-center">
            <motion.div
              animate={active ? { scale: [1, 2, 2, 1], opacity: [0.5, 0.8, 0.8, 0.5] } : { scale: 1, opacity: 0.5 }}
              transition={{ duration: 8, repeat: Infinity, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
              className="absolute inset-0 bg-teal-300 rounded-full blur-2xl"
            />
            <motion.div
               animate={active ? { scale: [1, 1.5, 1.5, 1] } : { scale: 1 }}
               transition={{ duration: 8, repeat: Infinity, times: [0, 0.4, 0.6, 1], ease: "easeInOut" }}
               className="w-32 h-32 bg-white rounded-full shadow-2xl flex items-center justify-center relative z-10"
            >
               <Wind className="w-10 h-10 text-teal-500" />
            </motion.div>
            
            {active && (
              <motion.div 
                className="absolute -bottom-16 text-lg font-bold text-teal-700 uppercase tracking-widest"
                animate={{ opacity: [0, 1, 1, 0], y: [0, 5, 5, 0] }}
                transition={{ duration: 8, repeat: Infinity, times: [0, 0.2, 0.8, 1] }}
              >
                <motion.span 
                   animate={{ content: ["Breathe In...", "Hold...", "Breathe Out..."] }} 
                   transition={{ duration: 8, times: [0, 0.4, 0.6] }} 
                >
                   Breathe In...
                </motion.span>
              </motion.div>
            )}
         </div>

         <button
           onClick={() => setActive(!active)}
           className="px-10 py-4 rounded-full bg-teal-600 text-white font-bold text-lg shadow-xl hover:scale-105 active:scale-95 transition-all"
         >
            {active ? "Stop" : "Start Breathing"}
         </button>
      </div>
    </PageMotion>
  );
}