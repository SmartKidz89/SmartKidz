import { Suspense } from "react";
import WritingClient from "./WritingClient";

import { Page as PageScaffold } from "@/components/ui/PageScaffoldServer";
export default function Page() {
  return (
    
    <PageScaffold title="Writing">
<Suspense fallback={<div className="p-6">Loading…</div>}>
      <WritingClient />
    </Suspense>
  
    </PageScaffold>
  );
}