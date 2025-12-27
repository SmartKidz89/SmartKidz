"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function RileyAvatar({ className }) {
  return (
    <div className={className}>
      <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Antenna */}
        <path d="M60 18V28" stroke="#6366F1" strokeWidth="6" strokeLinecap="round" />
        <circle cx="60" cy="14" r="6" fill="#F43F5E" className="animate-pulse" />
        
        {/* Head */}
        <rect x="25" y="28" width="70" height="60" rx="16" fill="#4F46E5" />
        <rect x="25" y="28" width="70" height="60" rx="16" stroke="#4338CA" strokeWidth="4" />
        
        {/* Face Screen */}
        <rect x="36" y="40" width="48" height="32" rx="8" fill="#1E1B4B" />
        
        {/* Eyes (animated blink?) */}
        <circle cx="50" cy="54" r="5" fill="#22D3EE" />
        <circle cx="70" cy="54" r="5" fill="#22D3EE" />
        
        {/* Mouth */}
        <path d="M48 64 Q60 70 72 64" stroke="#22D3EE" strokeWidth="3" strokeLinecap="round" />

        {/* Ears */}
        <path d="M25 50H18C15.7909 50 14 51.7909 14 54V62C14 64.2091 15.7909 66 18 66H25" fill="#6366F1" />
        <path d="M95 50H102C104.209 50 106 51.7909 106 54V62C106 64.2091 104.209 66 102 66H95" fill="#6366F1" />
      </svg>
    </div>
  );
}

export function RileyAssistant({ open, onClose, title = "Riley can help", tips = [] }) {
  const [visible, setVisible] = useState(open);

  useEffect(() => setVisible(open), [open]);

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 md:items-center pointer-events-none">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" 
            onClick={() => { setVisible(false); onClose?.(); }} 
          />
          
          {/* Card */}
          <motion.div 
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 pointer-events-auto"
          >
            <div className="flex items-start gap-5">
              <div className="shrink-0 relative">
                <div className="absolute -inset-1 bg-indigo-100 rounded-full animate-pulse" />
                <div className="relative h-16 w-16 rounded-2xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center overflow-hidden">
                   <RileyAvatar className="w-12 h-12" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Assistant</div>
                    <div className="text-xl font-black text-slate-900">{title}</div>
                  </div>
                  <button
                    type="button"
                    className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
                    onClick={() => { setVisible(false); onClose?.(); }}
                  >
                    ×
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  {tips.length > 0 ? (
                    <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100/50">
                      <ul className="space-y-3">
                        {tips.map((t, i) => (
                          <li key={i} className="flex gap-3 text-slate-700 text-sm font-medium leading-relaxed">
                            <span className="shrink-0 w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center text-xs font-bold mt-0.5">{i + 1}</span>
                            {t}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-slate-600 font-medium">
                      I'm here to help! Try breaking the problem down into smaller steps.
                    </p>
                  )}
                </div>

                <div className="mt-5 flex justify-end">
                  <button
                    type="button"
                    className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 shadow-lg shadow-slate-900/10 active:scale-95 transition-all"
                    onClick={() => { setVisible(false); onClose?.(); }}
                  >
                    Thanks Riley!
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}