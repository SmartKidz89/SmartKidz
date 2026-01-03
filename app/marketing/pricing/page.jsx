"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Sparkles, Shield, Zap, Star, Infinity as InfinityIcon, HelpCircle, ArrowRight } from "lucide-react";
import CinematicScroll from "@/components/marketing/CinematicScroll";
import FAQAccordion from "@/components/marketing/FAQAccordion";
import { cn } from "@/lib/utils";
import { useMarketingGeo } from "@/components/marketing/MarketingGeoProvider";

// --- Components ---

function Container({ children, className = "" }) {
  return <div className={cn("container-pad px-6", className)}>{children}</div>;
}

function PricingCard({ plan, popular = false, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "relative flex flex-col p-8 rounded-[2.5rem] transition-all duration-300",
        popular 
          ? "bg-slate-900 text-white shadow-2xl scale-105 z-10 border border-slate-700" 
          : "bg-white text-slate-900 shadow-xl border border-slate-100 hover:-translate-y-1"
      )}
    >
      {popular && (
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-300 to-orange-400 text-slate-900 text-xs font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
          <Star className="w-3 h-3 fill-current" />
          Best Value
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-xl font-black opacity-90">{plan.name}</h3>
        <p className={cn("text-sm font-medium mt-1", popular ? "text-slate-400" : "text-slate-500")}>
          {plan.desc}
        </p>
      </div>

      <div className="flex items-baseline gap-1 mb-6">
        <span className="text-4xl sm:text-5xl font-black tracking-tight">{plan.price}</span>
        <span className={cn("font-bold", popular ? "text-slate-500" : "text-slate-400")}>
          {plan.period}
        </span>
      </div>

      <Link
        href="https://app.smartkidz.app/app/signup"
        className={cn(
          "w-full h-14 rounded-full flex items-center justify-center font-bold transition-all shadow-lg active:scale-95 text-lg",
          popular
            ? "bg-white text-slate-900 hover:bg-indigo-50"
            : "bg-slate-900 text-white hover:bg-slate-800"
        )}
      >
        Start 7-Day Free Trial
      </Link>

      <div className="mt-8 space-y-4 flex-1">
        {plan.features.map((feat) => (
          <div key={feat} className="flex items-start gap-3">
            <div className={cn("mt-0.5 rounded-full p-0.5 shrink-0", popular ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-600")}>
              <Check className="w-3.5 h-3.5" />
            </div>
            <span className={cn("text-sm font-semibold", popular ? "text-slate-300" : "text-slate-600")}>
              {feat}
            </span>
          </div>
        ))}
      </div>
      
      {plan.savings && (
        <div className="mt-6 pt-6 border-t border-white/10 text-center">
          <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
            {plan.savings}
          </span>
        </div>
      )}
    </motion.div>
  );
}

function FeatureItem({ icon: Icon, title, desc }) {
  return (
    <div className="flex gap-4 p-5 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="h-12 w-12 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="font-bold text-slate-900 mb-1">{title}</h4>
        <p className="text-sm text-slate-600 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

// --- Data ---

const INCLUDED_FEATURES = [
  { icon: InfinityIcon, title: "Unlimited Kids", desc: "One subscription covers the whole family. Add as many profiles as you need." },
  { icon: Shield, title: "100% Safe", desc: "No ads, no external links, no chat. A walled garden for learning." },
  { icon: Zap, title: "Offline Mode", desc: "Going on a road trip? Learning works seamlessly on tablets and desktops." },
  { icon: Star, title: "All Subjects", desc: "Maths, English, Science, and more. We don't charge extra for new worlds." },
];

const FAQS = [
  { id: "f1", q: "Does the free trial give full access?", a: "Yes. You get 7 days of unlimited access to everything: all subjects, all year levels, and the parent dashboard." },
  { id: "f2", q: "Can I change plans later?", a: "Absolutely. You can switch between Monthly and Annual or cancel at any time from your Parent Settings." },
  { id: "f3", q: "Is this per child?", a: "No! One subscription covers your entire family. You can create separate profiles for each child to track their individual progress." },
  { id: "f4", q: "What devices does it work on?", a: "SmartKidz works on any modern browser—desktops, laptops, iPads, and tablets." },
];

// --- Page ---

export default function PricingPage() {
  const geo = useMarketingGeo();

  const PLANS = [
    {
      name: "Monthly",
      price: `${geo.currency}${geo.priceMonthly}`,
      period: "/mo",
      desc: "Flexible. Cancel anytime.",
      features: [
        "Unlimited child profiles",
        `Full curriculum (${geo.curriculumShort})`,
        "Parent dashboard & insights",
        "No ads, ever"
      ],
    },
    {
      name: "Annual",
      price: `${geo.currency}${geo.priceAnnual}`,
      period: "/yr",
      desc: "Commit to confidence.",
      features: [
        "Everything in Monthly",
        "Save over 30%",
        "Price locked for life",
        "30-day money-back guarantee"
      ],
      savings: "🔥 Most Popular",
    },
  ];

  return (
    <div className="bg-slate-50/50">
      <CinematicScroll>
        
        {/* 1. HERO */}
        <section className="pt-24 pb-16 text-center">
          <Container className="max-w-4xl">
             <motion.div
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-4 py-1.5 text-xs font-extrabold text-slate-600 shadow-sm mb-8"
             >
               <Sparkles className="w-3.5 h-3.5 text-amber-500" />
               Invest in their future
             </motion.div>

             <motion.h1
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 }}
               className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6"
             >
               Simple pricing. <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-500">
                 Unlimited learning.
               </span>
             </motion.h1>
             
             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="text-xl text-slate-600 font-medium max-w-2xl mx-auto"
             >
               Start your <strong>7-day free trial</strong>. Cancel anytime.<br/>
               Prices in {geo.currency} {geo.name}.
             </motion.p>
          </Container>
        </section>

        {/* 2. PRICING CARDS */}
        <section className="pb-20">
          <Container className="max-w-5xl">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <PricingCard plan={PLANS[0]} delay={0.3} />
              <PricingCard plan={PLANS[1]} popular delay={0.4} />
            </div>
            
            <div className="mt-12 text-center">
               <p className="text-sm font-semibold text-slate-500 flex items-center justify-center gap-2">
                 <Shield className="w-4 h-4" />
                 Secure payment via Stripe • 256-bit SSL Encryption
               </p>
            </div>
          </Container>
        </section>

        {/* 3. VALUE GRID */}
        <section className="py-20 bg-white border-y border-slate-100">
          <Container className="max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-slate-900">Everything included</h2>
              <p className="text-slate-600 mt-2 font-medium">We don't nickel-and-dime. One price gets you the full platform.</p>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {INCLUDED_FEATURES.map((feat, i) => (
                <FeatureItem key={feat.title} {...feat} />
              ))}
            </div>
          </Container>
        </section>

        {/* 4. FAQ */}
        <section className="py-20">
          <Container className="max-w-3xl">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-black text-slate-900">Common Questions</h2>
            </div>
            <FAQAccordion items={FAQS} />
            
            <div className="mt-12 p-6 rounded-3xl bg-indigo-50 border border-indigo-100 text-center">
              <h4 className="font-bold text-indigo-900 mb-2">Still have questions?</h4>
              <p className="text-indigo-700 text-sm mb-4">We're here to help. Contact our friendly support team.</p>
              <a href="mailto:support@smartkidz.app" className="inline-flex items-center gap-2 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                <HelpCircle className="w-4 h-4" />
                Contact Support
              </a>
            </div>
          </Container>
        </section>

        {/* 5. FINAL CTA */}
        <section className="py-24">
          <Container>
            <div className="relative rounded-[3rem] bg-slate-900 overflow-hidden px-6 py-20 text-center">
              <div className="absolute inset-0">
                 <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-b from-indigo-600/30 to-transparent rounded-full blur-[80px] opacity-50" />
                 <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-t from-emerald-600/20 to-transparent rounded-full blur-[80px] opacity-50" />
              </div>
              
              <div className="relative z-10 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                  Join the club.
                </h2>
                <p className="text-lg sm:text-xl text-slate-300 font-medium mb-10">
                  Give your child the gift of confidence today.
                </p>
                <Link
                  href="https://app.smartkidz.app/app/signup"
                  className="inline-flex h-14 items-center justify-center rounded-full bg-white px-10 text-lg font-bold text-slate-900 shadow-xl hover:scale-105 hover:bg-indigo-50 transition-all"
                >
                  Start Your Free Trial
                </Link>
                <p className="mt-6 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Try it risk-free
                </p>
              </div>
            </div>
          </Container>
        </section>

      </CinematicScroll>
    </div>
  );
}