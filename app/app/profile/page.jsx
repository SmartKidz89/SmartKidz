import { Suspense } from "react";
import ProfileClient from "./ProfileClient";
import { Page as PageScaffold } from "@/components/ui/PageScaffoldServer";

export const metadata = {
  title: "My Profile",
};

export default function ProfilePage() {
  return (
    <PageScaffold title="My Profile">
      <Suspense fallback={<div className="p-6">Loading profile...</div>}>
        <ProfileClient />
      </Suspense>
    </PageScaffold>
  );
}