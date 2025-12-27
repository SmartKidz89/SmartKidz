import { Suspense } from "react";
import TodayCompleteClient from "./TodayCompleteClient";

import { Page as PageScaffold } from "@/components/ui/PageScaffoldServer";
export default function Page() {
  return (
    
    <PageScaffold title="Complete">
<Suspense fallback={<div className="p-6">Loading…</div>}>
      <TodayCompleteClient />
    </Suspense>
  
    </PageScaffold>
  );
}