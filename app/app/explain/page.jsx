import { Suspense } from "react";
import ExplainClient from "./ExplainClient";

import { Page as PageScaffold } from "@/components/ui/PageScaffoldServer";
export default function Page() {
  return (
    
    <PageScaffold title="Explain">
<Suspense fallback={<div className="p-6">Loading…</div>}>
      <ExplainClient />
    </Suspense>
  
    </PageScaffold>
  );
}