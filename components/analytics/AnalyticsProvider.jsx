"use client";

import { useEffect } from "react";
import posthog from "posthog-js";
import { usePathname, useSearchParams } from "next/navigation";
import { Events } from "@/lib/telemetry/events";
import { track } from "@/lib/telemetry/track";

function getCfg() {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";
  return { key, host };
}

export default function AnalyticsProvider({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Init once
  useEffect(() => {
    const { key, host } = getCfg();
    if (!key) return;

    // Prevent double-init in Fast Refresh
    if (posthog.__loaded) return;

    posthog.init(key, {
      api_host: host,
      capture_pageview: false,
      capture_pageleave: true,
      persistence: "localStorage+cookie",
      disable_session_recording: true, // enable only for parent/marketing if desired
    });
  }, []);

  // Track page views
  useEffect(() => {
    if (!pathname) return;
    const url = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;
    track(Events.PageView, { url, pathname });
  }, [pathname, searchParams]);

  return children;
}
