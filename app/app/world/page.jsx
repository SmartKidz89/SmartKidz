import { Suspense } from "react";
import WorldClient from "./WorldClient";

import { Page } from "@/components/ui/PageScaffoldServer";
export default function Page() {
  return (
    
    <Page title="World">
<Suspense fallback={<div className="p-6">Loading…</div>}>
      <WorldClient />
    </Suspense>
  
    </Page>
  );
}