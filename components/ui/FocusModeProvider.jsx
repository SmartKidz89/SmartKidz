"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const FocusContext = createContext({
  focus: false,
  toggle: () => {},
  setFocus: () => {},
});

export function FocusModeProvider({ children }) {
  const [focus, setFocus] = useState(false);

  useEffect(() => {
    try {
      const v = localStorage.getItem("skz_focus_mode");
      if (v === "1") setFocus(true);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("skz_focus_mode", focus ? "1" : "0"); } catch {}
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("skz-focus", focus);
    }
  }, [focus]);

  const value = useMemo(() => ({
    focus,
    toggle: () => setFocus((f) => !f),
    setFocus,
  }), [focus]);

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>;
}

export function useFocusMode() {
  return useContext(FocusContext);
}
