"use client";

import { useMemo } from "react";
import { Hero, LogoStrip, FeatureGrid, SubjectTiles, CTA } from "@/components/marketing/LandingSections";
import SectionReveal from "@/components/marketing/SectionReveal";
import ScreenshotsShowcase from "@/components/marketing/ScreenshotsShowcase";
import TestimonialsCarousel from "@/components/marketing/TestimonialsCarousel";
import FAQAccordion from "@/components/marketing/FAQAccordion";
import CinematicScroll from "@/components/marketing/CinematicScroll";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import { useMarketingGeo } from "@/components/marketing/MarketingGeoProvider";

export default function MarketingHome() {
  const geo = useMarketingGeo();

  const testimonials = useMemo(() => [
    { id: "t1", quote: "My kids ask to do SmartKidz before screen time. That never happened with worksheets.", name: "Sarah M.", initials: "SM", meta: `Parent of 2 • ${geo.locations[0]}` },
    { id: "t2", quote: "The parent dashboard is the best part. I can see exactly what’s clicked for each child.", name: "Daniel K.", initials: "DK", meta: `Parent of 3 • ${geo.locations[1]}` },
    { id: "t3", quote: "Short lessons, instant feedback, and the rewards keep them going. It feels like a game.", name: "Aisha R.", initials: "AR", meta: `Parent of 1 • ${geo.locations[2]}` },
  ], [geo]);

  const faqs = useMemo(() => [
    { id: "f1", q: `Is SmartKidz aligned to the ${geo.name} curriculum?`, a: `Yes. Lessons are mapped to key ${geo.curriculum} outcomes and designed to build mastery with short practice loops and quizzes.` },
    { id: "f2", q: "Can multiple kids use the same account on different devices?", a: "Yes. One parent account can manage multiple child profiles, and each device can stay signed in at the same time." },
    { id: "f3", q: "Can kids choose what they learn?", a: `Yes. Kids can explore ${geo.mathTerm}, Reading and Science worlds and pick lessons that interest them. Parents can still guide and monitor progress.` },
    { id: "f4", q: "How do weekly email reports work?", a: "Parents receive a short weekly summary showing time spent, progress, and recommendations. You can disable or customise reports in the parent dashboard." },
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
          <SectionReveal className="py-16">
            <div className="container-pad text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Peek Inside the App</h2>
              <p className="text-lg text-slate-600">Designed for kids, built for learning.</p>
            </div>
            <div className="container-pad" data-reveal>
              <ScreenshotsShowcase />
            </div>
          </SectionReveal>
        </section>

        <section data-scene>
          <SubjectTiles />
        </section>

        <section data-scene>
          <SectionReveal className="py-20 bg-white/50 backdrop-blur-sm">
            <div className="container-pad grid lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5" data-reveal>
                <div className="inline-block rounded-full bg-amber-100 text-amber-800 px-4 py-1.5 text-xs font-bold mb-4 uppercase tracking-wider">
                  Community Love
                </div>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                  Parents love the calm,<br/> kids love the fun.
                </h2>
                <p className="mt-4 text-lg text-slate-600 font-medium leading-relaxed">
                  Join thousands of families in {geo.name} who have switched from fighting over homework to celebrating streaks.
                </p>
              </div>
              <div className="lg:col-span-7" data-reveal>
                <TestimonialsCarousel items={testimonials} />
              </div>
            </div>
          </SectionReveal>
        </section>

        <section data-scene>
          <SectionReveal className="py-20">
            <div className="container-pad grid lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5" data-reveal>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-slate-600 font-medium">Everything you need to know before you start.</p>
              </div>
              <div className="lg:col-span-7" data-reveal>
                <FAQAccordion items={faqs} />
              </div>
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