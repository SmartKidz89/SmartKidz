"use client";

import { Hero, LogoStrip, FeatureGrid, SubjectTiles, CTA } from "@/components/marketing/LandingSections";
import SectionReveal from "@/components/marketing/SectionReveal";
import ScreenshotsShowcase from "@/components/marketing/ScreenshotsShowcase";
import TestimonialsCarousel from "@/components/marketing/TestimonialsCarousel";
import FAQAccordion from "@/components/marketing/FAQAccordion";
import CinematicScroll from "@/components/marketing/CinematicScroll";

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
const testimonials = [
  { id: "t1", quote: "My kids ask to do SmartKidz before screen time. That never happened with worksheets.", name: "Sarah M.", initials: "SM", meta: "Parent of 2 • Melbourne" },
  { id: "t2", quote: "The parent dashboard is the best part. I can see exactly what’s clicked for each child.", name: "Daniel K.", initials: "DK", meta: "Parent of 3 • Brisbane" },
  { id: "t3", quote: "Short lessons, instant feedback, and the rewards keep them going. It feels like a game.", name: "Aisha R.", initials: "AR", meta: "Parent of 1 • Sydney" },
];

const faqs = [
  { id: "f1", q: "Is SmartKidz aligned to the Australian Curriculum?", a: "Yes. Lessons are mapped to key outcomes (Prep–Year 6) and designed to build mastery with short practice loops and quizzes." },
  { id: "f2", q: "Can multiple kids use the same account on different devices?", a: "Yes. One parent account can manage multiple child profiles, and each device can stay signed in at the same time." },
  { id: "f3", q: "Can kids choose what they learn?", a: "Yes. Kids can explore Maths, Reading and Science worlds and pick lessons that interest them. Parents can still guide and monitor progress." },
  { id: "f4", q: "How do weekly email reports work?", a: "Parents receive a short weekly summary showing time spent, progress, and recommendations. You can disable or customise reports in the parent dashboard." },
];

export default function MarketingHome() {
  return (
    
    <PageScaffoldScaffold title="Marketing">
<CinematicScroll>
      <section data-scene>
        <Hero />
      </section>

      <section data-scene>
        <SectionReveal className="py-10">
          <LogoStrip />
        </SectionReveal>
      </section>

      <section data-scene data-pin>
        <SectionReveal className="py-14">
          <FeatureGrid />
        </SectionReveal>
      </section>

      <section data-scene>
        <SectionReveal className="py-14">
          <div className="container-pad" data-reveal>
            <ScreenshotsShowcase />
          </div>
        </SectionReveal>
      </section>

      <section data-scene>
        <SectionReveal className="py-14">
          <SubjectTiles />
        </SectionReveal>
      </section>

      <section data-scene>
        <SectionReveal className="py-14">
          <div className="container-pad grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5" data-reveal>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">Parents love the calm, kids love the fun.</h2>
              <p className="mt-3 text-slate-600">SmartKidz is built to feel playful without feeling chaotic — and to keep learning moving forward.</p>
            </div>
            <div className="lg:col-span-7" data-reveal>
              <TestimonialsCarousel items={testimonials} />
            </div>
          </div>
        </SectionReveal>
      </section>

      <section data-scene>
        <SectionReveal className="py-14">
          <div className="container-pad grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5" data-reveal>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">FAQ</h2>
              <p className="mt-3 text-slate-600">Everything you need to know before you start.</p>
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