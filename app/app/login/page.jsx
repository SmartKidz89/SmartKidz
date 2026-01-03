"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import AuthCard from "@/components/auth/AuthCard";
import BrandMark from "@/components/BrandMark";

export default function Login() {
  return (
    <main className="min-h-screen grid lg:grid-cols-[45%_55%] bg-white overflow-hidden">
      
      {/* Left: Form Area */}
      <div className="relative flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 z-10">
        <div className="absolute top-8 left-6 sm:left-12">
           <Link href="/marketing">
             <BrandMark />
           </Link>
        </div>

        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">
              Welcome back
            </h1>
            <p className="text-lg text-slate-600 font-medium">
              Log in to continue your learning adventure.
            </p>
          </div>

          <AuthCard mode="login" />

          <div className="text-center">
            <p className="text-sm font-bold text-slate-500">
              New to SmartKidz?{" "}
              <Link href="/marketing/signup" className="text-indigo-600 hover:text-indigo-800 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
          
          <div className="pt-8 border-t border-slate-100 flex flex-wrap gap-6 text-xs font-bold text-slate-400 justify-center items-center">
             <Link href="/marketing/terms" className="hover:text-slate-600">Terms</Link>
             <Link href="/marketing/privacy" className="hover:text-slate-600">Privacy</Link>
             <Link href="mailto:support@smartkidz.app" className="hover:text-slate-600">Help</Link>
             <span className="text-slate-300">|</span>
             <Link href="/setup/generate" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
               ⚡ Generator
             </Link>
             <Link href="/setup/generate" className="hover:text-emerald-600 transition-colors flex items-center gap-1">
               🔍 Asset Scanner
             </Link>
             <Link href="/setup/generate" className="hover:text-fuchsia-600 transition-colors flex items-center gap-1">
               🎨 Forge
             </Link>
          </div>
        </div>
      </div>

      {/* Right: Visual Area */}
      <div className="relative hidden lg:block bg-slate-50 p-6">
        <div className="relative h-full w-full rounded-[3rem] overflow-hidden bg-slate-900 shadow-2xl ring-1 ring-black/5">
           {/* Animated Background */}
           <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
              <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen" />
              <Image
                src="/illustrations/scenes/home-hero.webp"
                alt="SmartKidz World"
                fill
                className="object-cover opacity-80"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/10" />
           </div>

           {/* Floating Content */}
           <div className="absolute bottom-0 left-0 right-0 p-12 text-white z-10">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="max-w-lg"
              >
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-6">
                   ✨ Daily Learning
                </div>
                <h2 className="text-5xl font-black leading-tight mb-4">
                  Make screen time count.
                </h2>
                <p className="text-xl text-slate-300 font-medium leading-relaxed">
                  Join thousands of parents building confidence through calm, mastery-based practice.
                </p>
                
                {/* Floating Avatars */}
                <div className="flex items-center gap-3 mt-8">
                   <div className="flex -space-x-4">
                      {['lion', 'cat', 'robot', 'astro'].map((k, i) => (
                        <div key={k} className="w-12 h-12 rounded-full border-[3px] border-slate-900 bg-white shadow-lg overflow-hidden relative z-0 hover:z-10 hover:scale-110 transition-transform">
                           <div 
                             className="w-full h-full flex items-center justify-center text-xl"
                             style={{ backgroundColor: ['#fcd34d', '#f472b6', '#cbd5e1', '#60a5fa'][i] }}
                           >
                              {['🦁', '🐱', '🤖', '🧑‍🚀'][i]}
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="text-sm font-bold text-white/80">
                      +12k Learners
                   </div>
                </div>
              </motion.div>
           </div>
        </div>
      </div>
    </main>
  );
}