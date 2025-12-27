"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from '@/components/app/PaywallGate';

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
export default function WritingAssign() {
  return (
    
    <PageScaffold title="Assign">
<main className="bg-gradient-to-br from-indigo-50 via-white to-cyan-50 min-h-[70vh]">
      <div className="container-pad py-10">
        <PaywallGate>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-sm font-semibold text-slate-600">English</div>
              <h1 className="text-3xl font-extrabold tracking-tight">Assign Writing Practice</h1>
              <p className="mt-2 text-slate-700 max-w-2xl">
                This is the assignment hub (Phase 3). Next, we’ll connect child profiles and teacher-student mappings so parents/teachers can assign:
                letter sets, sentence sets, and spacing/guideline settings.
              </p>
            </div>
            <div className="flex gap-2">
              <Button href="/app/english/writing" variant="secondary">Back</Button>
              <Button href="/app/english" variant="outline">English Hub</Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <div className="text-xl font-extrabold">Parents</div>
              <p className="mt-2 text-slate-700">
                Select your child, choose a practice set, and schedule a short daily routine.
              </p>
              <ul className="mt-3 text-sm text-slate-700 list-disc pl-5 space-y-1">
                <li>Letter sets (A–E, F–J, …)</li>
                <li>Sentence prompts (levelled)</li>
                <li>Guideline presets</li>
              </ul>
            </Card>

            <Card className="p-6">
              <div className="text-xl font-extrabold">Teachers</div>
              <p className="mt-2 text-slate-700">
                Assign practice to mapped students and review saved attempts.
              </p>
              <ul className="mt-3 text-sm text-slate-700 list-disc pl-5 space-y-1">
                <li>Class sets</li>
                <li>Rubric-style review</li>
                <li>Progress over time</li>
              </ul>
            </Card>
          </div>
        </PaywallGate>
      </div>
    </main>
  
    </PageScaffold>
  );
}