import { Suspense } from "react";
import GrammarClient from "./GrammarClient";
import { Page as PageScaffold } from "@/components/ui/PageScaffoldServer";

export const metadata = {
  title: "Grammar Gym - SmartKidz",
};

export default function GrammarPage() {
  return (
    <PageScaffold title="Grammar Gym">
      <Suspense fallback={<div className="p-10 text-center font-bold text-slate-400">Loading Grammar Gym...</div>}>
        <GrammarClient />
      </Suspense>
    </PageScaffold>
  );
}