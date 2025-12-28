"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { ACTIVE_CHILD_COOKIE, getCookie, setCookie, clearCookie } from "@/lib/childCookie";

export const ActiveChildContext = createContext(null);

export function ActiveChildProvider({ children }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  
  const [kids, setKids] = useState([]);
  const [activeChildId, setActiveChildId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to pick the best default child if none selected
  const resolveActiveChild = useCallback(
    (kidList) => {
      const cookieId = getCookie(ACTIVE_CHILD_COOKIE);
      
      // 1. Try cookie
      let found = cookieId && kidList.find((k) => k.id === cookieId);
      
      // 2. Fallback to first child
      if (!found && kidList.length > 0) {
        found = kidList[0];
      }

      const nextId = found?.id || null;

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
    setLoading(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData?.session;

      if (!session?.user?.id) {
        setKids([]);
        setActiveChildId(null);
        setLoading(false);
        return;
      }

      // Query matched exactly to the provided schema
      const { data, error: kidsErr } = await supabase
        .from("children")
        .select(`
          id,
          display_name,
          year_level,
          country,
          avatar_key,
          avatar_config,
          accessibility_settings
        `)
        .eq("parent_id", session.user.id)
        .order("created_at", { ascending: true });

      if (kidsErr) throw kidsErr;

      // Safe defaults if columns are null (schema says defaults exist, but good to be safe)
      const list = (data || []).map(k => ({
        ...k,
        country: k.country || "AU",
        avatar_key: k.avatar_key || "robot",
        year_level: k.year_level || 1
      }));

      setKids(list);
      resolveActiveChild(list);
    } catch (e) {
      console.error("Failed to load children:", e);
      setError(e.message);
      setKids([]);
    } finally {
      setLoading(false);
    }
  }, [supabase, resolveActiveChild]);

  // Initial load
  useEffect(() => {
    refreshKids();

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        refreshKids();
      } else if (event === "SIGNED_OUT") {
        setKids([]);
        setActiveChildId(null);
        setLoading(false);
      }
    });

    return () => sub?.subscription?.unsubscribe();
  }, [refreshKids, supabase]);

  const setActiveChild = useCallback(
    (childId) => {
      setCookie(ACTIVE_CHILD_COOKIE, childId);
      setActiveChildId(childId);
    },
    []
  );

  const updateActiveChild = useCallback(async (patch) => {
      if (!activeChildId) return { ok: false };
      
      setKids(prev => prev.map(k => k.id === activeChildId ? { ...k, ...patch } : k));

      try {
          const { error } = await supabase.from("children").update(patch).eq("id", activeChildId);
          if (error) throw error;
          return { ok: true };
      } catch (e) {
          console.error("Update failed", e);
          refreshKids();
          return { ok: false, error: e.message };
      }
  }, [activeChildId, supabase, refreshKids]);

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
      updateActiveChild
    }),
    [kids, activeChildId, activeChild, loading, error, refreshKids, setActiveChild, updateActiveChild]
  );

  return <ActiveChildContext.Provider value={value}>{children}</ActiveChildContext.Provider>;
}