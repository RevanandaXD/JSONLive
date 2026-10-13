"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  THEME_EVENT,
  applyTheme,
  getActiveTheme,
  type Theme,
  type ThemeOrigin,
} from "@/src/lib/theme";

function subscribeTheme(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

function getServerTheme(): Theme {
  return "dark";
}

export function useTheme() {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getActiveTheme,
    getServerTheme,
  );

  const toggleTheme = useCallback((origin?: ThemeOrigin) => {
    applyTheme(getActiveTheme() === "dark" ? "light" : "dark", origin);
  }, []);

  const setThemeMode = useCallback((mode: Theme, origin?: ThemeOrigin) => {
    applyTheme(mode, origin);
  }, []);

  return { theme, toggleTheme, setThemeMode };
}