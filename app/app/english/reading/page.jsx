import { Suspense } from "react";
import ReadingClient from "./ReadingClient";

import { Page as PageScaffold } from "@/components/ui/PageScaffoldServer";
export default function Page() {
  return (
    
    <PageScaffold title="Reading">
<Suspense fallback={<div className="p-6">Loading…</div>}>
      <ReadingClient />
    </Suspense>
  
    </PageScaffold>
  );
}