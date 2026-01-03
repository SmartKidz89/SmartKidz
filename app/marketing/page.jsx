"use client";

import { useMemo } from "react";
import { Hero, LogoStrip, FeatureGrid, SubjectTiles, CTA } from "@/components/marketing/LandingSections";
import SectionReveal from "@/components/marketing/SectionReveal";
import ScreenshotsShowcase from "@/components/marketing/ScreenshotsShowcase";
import FAQAccordion from "@/components/marketing/FAQAccordion";
import CinematicScroll from "@/components/marketing/CinematicScroll";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { useMarketingGeo } from "@/components/marketing/MarketingGeoProvider";
import { Heart } from "lucide-react";

export default function MarketingHome() {
  const geo = useMarketingGeo();

  const faqs = useMemo(() => [
    { 
      id: "f1", 
      q: `Is SmartKidz aligned to the ${geo.name} curriculum?`, 
      a: `Yes. Lessons are mapped to key ${geo.curriculum} outcomes for Years 1–6. We cover ${geo.mathTerm}, English, Science, HASS, Technologies, The Arts, Health & PE, and Languages.` 
    },
    { 
      id: "f2", 
      q: "Is the platform safe for children?", 
      a: "Absolutely. SmartKidz is a walled garden. There are no ads, no external links, and no open chat features. Automated features are safety-guarded to keep experiences age-appropriate." 
    },
    { 
      id: "f3", 
      q: "Does it replace school?", 
      a: "No. SmartKidz is designed to support and reinforce school learning, not replace it. It helps children practice concepts they learn in class to build mastery and confidence." 
    },
    { 
      id: "f4", 
      q: "Can multiple kids use one account?", 
      a: "Yes. One parent subscription covers the whole family. You can create separate profiles for each child to track their individual progress." 
    },
    { 
      id: "f5", 
      q: "Can I print worksheets?", 
      a: "Printable practice sheets are on the roadmap. The current build focuses on interactive lessons and parent visibility into progress." 
    },
    { 
      id: "f6", 
      q: "How do weekly email reports work?", 
      a: "Parents receive a short weekly summary showing time spent, progress, and recommendations. You can disable or customise reports in the parent dashboard." 
    },
  ], [geo]);

  return (
    <PageScaffold title={null}>
      <CinematicScroll>
        <section data-scene>
          <Hero />
        </section>

        <section data-scene>
          <LogoStrip />
        </section>

        <section data-scene>
          <FeatureGrid />
        </section>

        <section data-scene>
          <SubjectTiles />
        </section>

        <section data-scene>
          <SectionReveal className="py-20 bg-white border-y border-slate-100">
            <div className="container-pad">
              <ScreenshotsShowcase />
            </div>
          </SectionReveal>
        </section>

        <section data-scene>
          <SectionReveal className="py-20">
            <div className="container-pad grid lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5" data-reveal>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-slate-600 font-medium">Common questions about learning, safety, and technical details.</p>
              </div>
              <div className="lg:col-span-7" data-reveal>
                <FAQAccordion items={faqs} />
              </div>
            </div>
          </SectionReveal>
        </section>

        {/* ABOUT SECTION */}
        <section data-scene>
          <SectionReveal className="py-24 bg-slate-50 text-center">
            <div className="container-pad max-w-3xl mx-auto">
               <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mx-auto mb-6">
                  <Heart className="w-8 h-8 text-rose-500 fill-rose-500" />
               </div>
               <h2 className="text-3xl font-black text-slate-900 mb-6">Our Mission</h2>
               <p className="text-xl text-slate-700 font-medium leading-relaxed">
                 SmartKidz is built by educators and designers who believe children deserve 
                 <strong> calm, high-quality learning</strong>. We stripped away the ads, the noise, and the addictive tricks to create a space where confidence grows naturally.
               </p>
            </div>
          </SectionReveal>
        </section>

        <section data-scene>
          <CTA />
        </section>
      </CinematicScroll>
    </PageScaffold>
  );
}