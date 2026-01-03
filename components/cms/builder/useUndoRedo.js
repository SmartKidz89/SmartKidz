"use client";

import { useCallback, useMemo, useRef, useState } from "react";

/**
 * Simple undo/redo state manager for JSON-ish data.
 *
 * - Stores snapshots (by value) in memory.
 * - Designed for page-builder draft editing.
 */
export function useUndoRedoState(initialValue, { limit = 50 } = {}) {
  const [present, setPresent] = useState(initialValue);
  const pastRef = useRef([]);
  const futureRef = useRef([]);

  const set = useCallback(
    (next) => {
      setPresent((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        if (Object.is(prev, resolved)) return prev;
        pastRef.current = [...pastRef.current, prev].slice(-limit);
        futureRef.current = [];
        return resolved;
      });
    },
    [limit]
  );

  const reset = useCallback((nextValue) => {
    pastRef.current = [];
    futureRef.current = [];
    setPresent(nextValue);
  }, []);

  const undo = useCallback(() => {
    const past = pastRef.current;
    if (!past.length) return;
    setPresent((prev) => {
      const previous = past[past.length - 1];
      pastRef.current = past.slice(0, -1);
      futureRef.current = [prev, ...futureRef.current].slice(0, limit);
      return previous;
    });
  }, [limit]);

  const redo = useCallback(() => {
    const future = futureRef.current;
    if (!future.length) return;
    setPresent((prev) => {
      const next = future[0];
      futureRef.current = future.slice(1);
      pastRef.current = [...pastRef.current, prev].slice(-limit);
      return next;
    });
  }, [limit]);

  // Compute flags on every render so they stay in sync with refs.
  const meta = useMemo(() => {
    return {
      canUndo: pastRef.current.length > 0,
      canRedo: futureRef.current.length > 0,
      undo,
      redo,
      reset,
    };
  });

  return [present, set, meta];
}
