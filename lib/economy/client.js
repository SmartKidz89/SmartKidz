"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const LS_PREFIX = "skz_economy_v1";

function lsKey(childId) {
  return `${LS_PREFIX}:${childId}`;
}

function defaultEconomy() {
  return { coins: 0, xp: 0, level: 1, inventory: [], updatedAt: Date.now() };
}

export function useEconomy(childId) {
  const [state, setState] = useState(null);
  const [loading, setLoading] = useState(!!childId);

  const refresh = useCallback(async () => {
    if (!childId) { setState(null); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/economy?child=${encodeURIComponent(childId)}`);
      if (res.ok) {
        const json = await res.json();
        setState(json);
        try { localStorage.setItem(lsKey(childId), JSON.stringify(json)); } catch {}
        return;
      }
      throw new Error("economy http error");
    } catch {
      // Fallback to local
      try {
        const raw = localStorage.getItem(lsKey(childId));
        setState(raw ? JSON.parse(raw) : defaultEconomy());
      } catch {
        setState(defaultEconomy());
      }
    } finally {
      setLoading(false);
    }
  }, [childId]);

  useEffect(() => { refresh(); }, [refresh]);

  const mutate = useCallback(async (op, payload) => {
    if (!childId) return null;
    const body = { childId, op, ...payload };
    // Optimistic update for responsiveness
    setState((prev) => {
      const base = prev || defaultEconomy();
      if (op === "award") {
        return {
          ...base,
          coins: base.coins + (payload?.coins || 0),
          xp: base.xp + (payload?.xp || 0),
          level: payload?.level || base.level,
          updatedAt: Date.now(),
        };
      }
      return base;
    });

    try {
      const res = await fetch(`/api/economy`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { error: json?.error || "Request failed" };
      }
      setState(json);
      try { localStorage.setItem(lsKey(childId), JSON.stringify(json)); } catch {}
      return json;
    } catch {
      // If server fails, keep optimistic local state
      try {
        const raw = localStorage.getItem(lsKey(childId));
        setState(raw ? JSON.parse(raw) : defaultEconomy());
      } catch {}
      return { error: "Offline" };
    }
  }, [childId]);

  const value = useMemo(() => ({
    ...state,
    loading,
    refresh,
    award: async (coins, xp) => {
      const res = await mutate("award", { coins, xp });
      if (res?.error) throw new Error(res.error);
      return res;
    },
    purchase: async (itemId) => {
      const res = await mutate("purchase", { itemId });
      if (res?.error) return res;
      return res;
    },
  }), [state, loading, refresh, mutate]);

  return value;
}
