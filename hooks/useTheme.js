"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/config/site";

const THEME_KEY = siteConfig.themeStorageKey;
const DEFAULT_THEME = siteConfig.defaultTheme;

function applyTheme(t) {
  const el = document.documentElement;
  el.classList.remove("dark", "light");
  el.classList.add(t);
  el.style.colorScheme = t;
  if (typeof window !== "undefined") localStorage.setItem(THEME_KEY, t);
}

export function useTheme() {
  const [theme, setThemeState] = useState(DEFAULT_THEME);

  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(THEME_KEY) : null;
    const preferred = saved === "light" || saved === "dark" ? saved : DEFAULT_THEME;
    setThemeState(preferred);
    applyTheme(preferred);
  }, []);

  const setTheme = (t) => {
    setThemeState(t);
    applyTheme(t);
  };

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return { theme, setTheme, toggle };
}
