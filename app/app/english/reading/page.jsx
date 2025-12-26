import { Suspense } from "react";
import ReadingClient from "./ReadingClient";

import { Page } from "@/components/ui/PageScaffoldServer";
export default function Page() {
  return (
    
    <Page title="Reading">
<Suspense fallback={<div className="p-6">Loading…</div>}>
      <ReadingClient />
    </Suspense>
  
    </Page>
  );
}