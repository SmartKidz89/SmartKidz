"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Star, ShieldCheck, ArrowRight } from "lucide-react";
import AuthCard from "@/components/auth/AuthCard";
import BrandMark from "@/components/BrandMark";

export default function SignupPage({ searchParams }) {
  const plan = searchParams?.plan ?? null;

  return (
    <div className="min-h-screen bg-white grid lg:grid-cols-[1fr_500px] xl:grid-cols-[1fr_560px]">
      
      {/* LEFT: Branding & Value Prop (Hidden on mobile, or stacked) */}
      <div className="hidden lg:flex flex-col justify-between bg-slate-50 p-12 relative overflow-hidden">
         
         {/* Brand Header */}
         <div className="relative z-10">
            <Link href="/" className="inline-block">
               <BrandMark />
            </Link>
         </div>

         {/* Content */}
         <div className="relative z-10 max-w-lg mt-12">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
               Join the club of confident learners.
            </h1>
            <p className="text-xl text-slate-600 font-medium mb-10 leading-relaxed">
               Start your 7-day free trial. Unlimited access to Maths, English, Science, and creative tools for the whole family.
            </p>

            <div className="space-y-4 mb-12">
               {[
                 "Unlimited child profiles included",
                 "Cancel anytime in 2 clicks",
                 "No ads, no external links"
               ].map(item => (
                 <div key={item} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                       <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <span className="font-bold text-slate-700">{item}</span>
                 </div>
               ))}
            </div>

            {/* Testimonial */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
               <div className="flex gap-1 text-amber-400 mb-2">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
               </div>
               <p className="text-slate-700 font-medium italic mb-4">
                  "My son actually asks to do his 'missions' now. It's not a fight anymore. Best investment we've made this year."
               </p>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-sm">SJ</div>
                  <div>
                     <div className="text-sm font-bold text-slate-900">Sarah Jenkins</div>
                     <div className="text-xs font-semibold text-slate-500">Parent of 2 (Year 3 & 5)</div>
                  </div>
               </div>
            </div>
         </div>

         {/* Footer */}
         <div className="relative z-10 mt-12 flex items-center gap-6 text-xs font-bold text-slate-400">
            <span>© SmartKidz</span>
            <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Secure & Private</span>
         </div>

         {/* Decoration */}
         <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100/50 rounded-full blur-[120px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-[100px] -ml-32 -mb-32" />
         </div>
      </div>

      {/* RIGHT: Form Area */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12 relative">
         <div className="w-full max-w-sm">
            <div className="lg:hidden mb-8 text-center">
               <Link href="/" className="inline-block mb-6">
                  <BrandMark />
               </Link>
               <h1 className="text-3xl font-black text-slate-900 mb-2">Create your account</h1>
               <p className="text-slate-600 font-medium">Free for 7 days, then just a low monthly price.</p>
            </div>

            <div className="bg-white lg:shadow-none lg:border-none p-0 rounded-3xl">
               <div className="mb-6 hidden lg:block">
                  <h2 className="text-2xl font-black text-slate-900">Get started</h2>
                  <p className="text-slate-500 font-medium">No credit card required for trial.</p>
               </div>
               
               <AuthCard mode="signup" initialPlan={plan} />
            </div>

            <div className="mt-8 text-center">
               <p className="text-sm text-slate-500 font-medium">
                  Already have an account?{" "}
                  <Link href="/login" className="text-indigo-600 font-bold hover:underline">
                     Log in
                  </Link>
               </p>
            </div>
         </div>
      </div>

    </div>
  );
}