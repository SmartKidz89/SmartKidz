"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { ACTIVE_CHILD_COOKIE, getCookie, setCookie, clearCookie } from "@/lib/childCookie";

export const ActiveChildContext = createContext(null);

/**
 * Option B: Active child is stored in cookie + React context only.
 * - Per-device selection (cookie)
 * - No child id in URL
 * - Provider must not block login routes (it short-circuits when not authed)
 */
export function ActiveChildProvider({ children }) {
  const supabase = getSupabaseClient();

  const [kids, setKids] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const resolveActiveChild = useCallback(
    (kidList) => {
      const cookieId = getCookie(ACTIVE_CHILD_COOKIE);
      const found = cookieId && kidList.find((k) => k.id === cookieId);
      const nextId = found?.id || kidList[0]?.id || null;

      if (nextId) {
        setCookie(ACTIVE_CHILD_COOKIE, nextId);
      } else {
        clearCookie(ACTIVE_CHILD_COOKIE);
      }

      setActiveChildId(nextId);
      return nextId;
    },
    []
  );

  const refreshKids = useCallback(async () => {
    if (!supabase) {
      // During prerender/build or if env vars missing server-side
      setKids([]);
      setActiveChildId(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;

    if (!session?.user?.id) {
      // Not logged in: do not attempt to fetch children; do not block login screens
      setKids([]);
      setActiveChildId(null);
      setLoading(false);
      return;
    }

    const { data, error: kidsErr } = await supabase
      .from("children")
      .select("id,display_name,year_level,avatar_key,avatar_config")
      .order("created_at", { ascending: true });

    if (kidsErr) {
      setKids([]);
      setActiveChildId(null);
      setError(kidsErr.message || "Could not load children.");
      setLoading(false);
      return;
    }

    const list = data || [];
    setKids(list);
    resolveActiveChild(list);
    setLoading(false);
  }, [supabase, resolveActiveChild]);

  useEffect(() => {
    refreshKids();

    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, _session) => {
      // Re-sync after login/logout
      refreshKids();
    });

    return () => sub?.subscription?.unsubscribe?.();
  }, [supabase, refreshKids]);

  const setActiveChild = useCallback(
    (childId) => {
      setCookie(ACTIVE_CHILD_COOKIE, childId);
      setActiveChildId(childId);
    },
    []
  );

  const activeChild = useMemo(() => kids.find((k) => k.id === activeChildId) || null, [kids, activeChildId]);

  const value = useMemo(
    () => ({
      kids,
      activeChildId,
      activeChild,
      loading,
      error,
      refreshKids,
      setActiveChild,
    }),
    [kids, activeChildId, activeChild, loading, error, refreshKids, setActiveChild]
  );

  return <ActiveChildContext.Provider value={value}>{children}</ActiveChildContext.Provider>;
}
