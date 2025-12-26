import { Suspense } from "react";
import WritingClient from "./WritingClient";

import { Page } from "@/components/ui/PageScaffoldServer";
export default function Page() {
  return (
    
    <Page title="Writing">
<Suspense fallback={<div className="p-6">Loading…</div>}>
      <WritingClient />
    </Suspense>
  
    </Page>
  );
}