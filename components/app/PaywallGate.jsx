"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function PaywallGate({ children, featureName = "this feature" }) {
  const [state, setState] = useState({ loading: true, isPremium: false });

  useEffect(() => {
    let mounted = true;
    fetch("/api/entitlements")
      .then((r) => r.json())
      .then((j) => {
        if (!mounted) return;
        setState({ loading: false, isPremium: Boolean(j?.isPremium) });
      })
      .catch(() => {
        if (!mounted) return;
        setState({ loading: false, isPremium: false });
      });
    return () => { mounted = false; };
  }, []);

  if (state.loading) return null;

  if (!state.isPremium) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-slate-900">Unlock {featureName}</h2>
        <p className="mt-2 text-sm text-slate-600">
          This is a premium feature. Start a subscription to enable full access across devices and keep progress in sync.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/pricing">
            <Button>View Plans</Button>
          </Link>
          <Link href="/app">
            <Button variant="ghost">Back to App</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return children;
}

export default PaywallGate;
