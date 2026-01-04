import { Suspense } from "react";
import PracticeClient from "./PracticeClient";
import { Page as PageScaffold } from "@/components/ui/PageScaffoldServer";

export const metadata = {
  title: "Practice Gym",
};

export default function PracticePage() {
  return (
    <PageScaffold title="Practice Gym">
      <Suspense fallback={<div className="p-6">Loading gym...</div>}>
        <PracticeClient />
      </Suspense>
    </PageScaffold>
  );
}