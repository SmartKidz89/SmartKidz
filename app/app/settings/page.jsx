"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useMemo, useState } from "react";
import { getSupabaseClient } from "../../../lib/supabaseClient";

import { Page as PageScaffold } from "@/components/ui/PageScaffold";;
export default function Settings() {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    
    <PageScaffold title="Settings">
<main className="bg-gradient-to-br from-slate-50 to-white min-h-[70vh]">
      <div className="container-pad py-10">
        <div className="grid gap-6 max-w-3xl">
          <Card className="p-6">
            <div className="text-2xl font-extrabold">Settings</div>
            <p className="text-slate-700 mt-2">Accessibility and learning preferences will be persisted per child profile.</p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Button href="/app/children" variant="secondary">Manage children</Button>
              <Button href="/app/redeem" variant="secondary">Redeem access code</Button>
              <Button variant="outline" onClick={logout}>Log out</Button>
              <Button href="/pricing" variant="secondary">Manage subscription</Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  
    </PageScaffold>
  );
}