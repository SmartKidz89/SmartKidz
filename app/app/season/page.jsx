"use client";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import Body from "@/components/app/SeasonPassPanel";

export default function Page() {
  return (
    <div className="space-y-6">
      <PageScaffoldHeader title="Season Pass" subtitle="Earn XP and unlock seasonal rewards." />
      <Card className="p-4">
        <Body />
      </Card>
    </div>
  );
}
