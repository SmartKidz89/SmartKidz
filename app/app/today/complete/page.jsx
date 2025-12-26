import { Suspense } from "react";
import TodayCompleteClient from "./TodayCompleteClient";

import { Page } from "@/components/ui/PageScaffoldServer";
export default function Page() {
  return (
    
    <Page title="Complete">
<Suspense fallback={<div className="p-6">Loading…</div>}>
      <TodayCompleteClient />
    </Suspense>
  
    </Page>
  );
}