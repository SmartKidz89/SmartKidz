"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import PaywallGate from '@/components/app/PaywallGate';

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
export default function EnglishHub() {
  return (
    
    <PageScaffold title="English">
<main className="bg-gradient-to-br from-fuchsia-50 via-white to-indigo-50 min-h-[70vh]">
      <div className="container-pad py-10">
        <PaywallGate>
          <div className="grid gap-6">
            <div>
              <div className="text-sm font-semibold text-slate-600">English</div>
              <h1 className="text-3xl font-extrabold tracking-tight">English Hub</h1>
              <p className="mt-2 text-slate-700 max-w-2xl">
                Choose an English learning area. This hub keeps Writing tools inside English (not separate from the curriculum),
                so progress and practice stay coherent.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-6">
                <div className="text-xl font-extrabold">Writing & Tracing Studio</div>
                <p className="mt-2 text-slate-700">
                  Trace letters (upper/lowercase) and practise writing sentences inside handwriting guidelines.
                  Calm repetition, unlimited practice, and saveable attempts.
                </p>
                <div className="mt-4">
                  <Button href="/app/english/writing">Open Writing Studio</Button>
                <div className="mt-3 flex gap-2 flex-wrap">
                  <Button href="/app/english/writing/review" variant="outline">Review attempts</Button>
                  <Button href="/app/english/writing/assign" variant="outline">Assign practice</Button>
                </div>
                </div>
              </Card>

      <Card className="p-6">
        <div className="text-xl font-extrabold">Reading Studio (Prep–Year 3)</div>
        <p className="mt-2 text-slate-700">
          Read along with voiceover, echo read sentence-by-sentence, practise sight words, and answer a few comprehension questions.
          Tap any word to hear it. Record your voice and listen back.
        </p>
        <div className="mt-4">
          <Button href="/app/english/reading">Open Reading Studio</Button>
        </div>
      </Card>

<Card className="p-6">
  <div className="text-xl font-extrabold">Coming next</div>

                <ul className="mt-2 text-slate-700 list-disc pl-5 space-y-1">
                  <li>Spelling practice (phonics patterns, sight words)</li>
                  <li>Sentence building (grammar + punctuation)</li>
                  <li>Reading comprehension worlds</li>
                </ul>
                <div className="mt-4">
                  <Button href="/app" variant="secondary">Back to App</Button>
                </div>
              </Card>
            </div>
          </div>
        </PaywallGate>
      </div>
    </main>
  
    </PageScaffold>
  );
}