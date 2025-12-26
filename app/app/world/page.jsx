import { Suspense } from "react";
import WorldClient from "./WorldClient";

import { Page as PageScaffold } from "@/components/ui/PageScaffoldServer";
export default function Page() {
  return (
    
    <PageScaffold title="World">
<Suspense fallback={<div className="p-6">Loading…</div>}>
      <WorldClient />
    </Suspense>
  
    </PageScaffold>
  );
}