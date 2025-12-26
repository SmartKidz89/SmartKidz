"use client";
import Link from "next/link";

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
export default function ProfilePage() {
  return (
    
    <PageScaffold title="Profile">
<div className="space-y-4">
      <h1 className="text-2xl font-extrabold">🙂 Profile</h1>
      <div className="rounded-3xl bg-white border border-slate-200 shadow-soft p-4">
        <p className="text-slate-700 font-semibold">
          This area is coming next. For now, jump into a lesson.
        </p>
        <Link href="/app/lesson/1" className="mt-3 inline-flex rounded-full bg-brand-primary px-5 py-2.5 text-white font-extrabold shadow-soft">
          Start a lesson
        </Link>
      </div>
    </div>
  
    </PageScaffold>
  );
}