import { Suspense } from "react";
import SpellingClient from "./SpellingClient";
import { Page as PageScaffold } from "@/components/ui/PageScaffoldServer";

export const metadata = {
  title: "Spelling Bee - SmartKidz",
};

export default function SpellingPage() {
  return (
    <PageScaffold title="Spelling Bee">
      <Suspense fallback={<div className="p-10 text-center font-bold text-slate-400">Loading Spelling Bee...</div>}>
        <SpellingClient />
      </Suspense>
    </PageScaffold>
  );
}