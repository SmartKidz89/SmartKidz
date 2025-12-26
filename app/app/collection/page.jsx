"use client";

import Body from "@/components/app/CollectionBook";
import { Page, BentoGrid, BentoCard } from "@/components/ui/PageScaffold";

export default function CollectionPage() {
  return (
    <Page
      badge="Collection"
      title="Collection Book"
      subtitle="Collect stickers and achievements as you learn. Every lesson adds something shiny."
    >
      <BentoGrid>
        <BentoCard className="col-span-12 p-4 sm:p-6">
          <Body />
        </BentoCard>
      </BentoGrid>
    </Page>
  );
}
