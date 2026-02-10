import type { ThemeMode } from "./theme.types";

const THEME_KEY = "app_theme_mode";

const isThemeMode = (value: string | null): value is ThemeMode =>
  value === "system" || value === "telegram" || value === "light" || value === "dark";

export const loadThemeMode = (): ThemeMode | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(THEME_KEY);
  return isThemeMode(value) ? value : null;
};

export const saveThemeMode = (mode: ThemeMode): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_KEY, mode);
};
