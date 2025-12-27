"use client";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import Body from "@/components/app/RecommendationsPanel";

export default function Page() {
  return (
    <div className="space-y-6">
      <PageScaffoldHeader title="Recommended Next" subtitle="Personalised learning based on your progress." />
      <Card className="p-4">
        <Body />
      </Card>
    </div>
  );
}
