import { Suspense } from "react";
import ExplainClient from "./ExplainClient";

import { Page } from "@/components/ui/PageScaffoldServer";
export default function Page() {
  return (
    
    <Page title="Explain">
<Suspense fallback={<div className="p-6">Loading…</div>}>
      <ExplainClient />
    </Suspense>
  
    </Page>
  );
}