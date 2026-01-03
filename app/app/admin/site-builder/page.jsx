"use client";

import PaywallGate from "@/components/app/PaywallGate";
import { Page as PageScaffold } from "@/components/ui/PageScaffold";
import SiteBuilderEditor from "@/components/cms/SiteBuilderEditor";

export default function SiteBuilderPage() {
  return (
    <PageScaffold title="Site Builder">
      <main className="bg-gradient-to-br from-slate-50 to-white min-h-[70vh]">
        <div className="container-pad py-10">
          <PaywallGate featureName="Site Builder">
            <SiteBuilderEditor />
          </PaywallGate>
        </div>
      </main>
    </PageScaffold>
  );
}
