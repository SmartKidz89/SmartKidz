"use client";
import Link from "next/link";

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
export default function Page() {
  return (
    
    <PageScaffold title="Controls">
<div className="space-y-4">
      <h1 className="text-2xl font-black text-slate-900">Parent Controls</h1>
      <div className="rounded-3xl bg-white/85 backdrop-blur border border-slate-200 shadow-soft p-5">
        <p className="text-slate-700 font-semibold">
          This section is ready for deeper controls. Next step: wire these settings to Supabase per child and parent.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/app/parent" className="sk-btn-muted !rounded-full !px-6 !py-3">Back</Link>
          <Link href="/app" className="sk-btn-primary !rounded-full !px-6 !py-3">Kid Dashboard</Link>
        </div>
      </div>
    </div>
  
    </PageScaffold>
  );
}