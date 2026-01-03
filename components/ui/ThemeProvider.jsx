"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { THEME_PRESETS, getThemePreset } from "@/lib/themePresets";

const ThemeContext = createContext({
  themeId: "rainbow",
  theme: THEME_PRESETS[0],
  setThemeId: () => {},
});

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState("rainbow");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("skz_theme_id");
      if (saved && THEME_PRESETS.some(t => t.id === saved)) {
        setThemeId(saved);
      }
    } catch {}
  }, []);

  const handleSetTheme = (id) => {
    setThemeId(id);
    try { localStorage.setItem("skz_theme_id", id); } catch {}
  };

  const theme = getThemePreset(themeId);

  return (
    <ThemeContext.Provider value={{ themeId, theme, setThemeId: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}