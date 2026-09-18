import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ResolvedTheme, ThemeMode } from "./theme.types";
import { loadThemeMode, saveThemeMode } from "./theme.storage";
import {
  colorToHsl,
  getSystemTheme,
  getTelegramTheme,
  getTelegramThemeParams,
  type TelegramThemeParams,
} from "./theme.utils";
import { getTelegramWebApp } from "@/lib/telegram";

interface ThemeContextValue {
  mode: ThemeMode;
  effectiveTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const resolveTheme = (
  mode: ThemeMode,
  telegramTheme: ResolvedTheme | null,
  systemTheme: ResolvedTheme,
): ResolvedTheme => {
  if (mode === "light" || mode === "dark") {
    return mode;
  }

  if (mode === "telegram") {
    return telegramTheme ?? systemTheme;
  }

  return systemTheme;
};

const applyThemeParams = (
  params: TelegramThemeParams | null,
  enabled: boolean,
) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const setVar = (name: string, value?: string | null) => {
    if (value) {
      root.style.setProperty(name, value);
    } else {
      root.style.removeProperty(name);
    }
  };

  if (!enabled || !params) {
    setVar("--background", null);
    setVar("--foreground", null);
    setVar("--muted-foreground", null);
    setVar("--primary", null);
    setVar("--primary-foreground", null);
    setVar("--card", null);
    setVar("--secondary", null);
    setVar("--border", null);
    setVar("--destructive", null);
    return;
  }

  setVar("--background", colorToHsl(params.bg_color));
  setVar("--foreground", colorToHsl(params.text_color));
  setVar("--muted-foreground", colorToHsl(params.hint_color));
  setVar("--primary", colorToHsl(params.button_color));
  setVar("--primary-foreground", colorToHsl(params.button_text_color));
  setVar("--card", colorToHsl(params.secondary_bg_color));
  setVar("--secondary", colorToHsl(params.secondary_bg_color));
  setVar("--border", colorToHsl(params.hint_color));
  setVar("--destructive", colorToHsl(params.destructive_text_color));
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const storedMode = loadThemeMode();
  const [mode, setModeState] = useState<ThemeMode>(storedMode ?? "light");
  const [telegramTheme, setTelegramTheme] = useState<ResolvedTheme | null>(() =>
    getTelegramTheme(),
  );
  const [telegramParams, setTelegramParams] = useState<TelegramThemeParams | null>(() =>
    getTelegramThemeParams(),
  );
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setSystemTheme(media.matches ? "dark" : "light");
    handler();

    if (media.addEventListener) {
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }

    media.addListener(handler);
    return () => media.removeListener(handler);
  }, []);

  useEffect(() => {
    const webApp = getTelegramWebApp();
    if (!webApp?.onEvent) {
      return;
    }

    const handler = () => {
      setTelegramTheme(getTelegramTheme());
      setTelegramParams(getTelegramThemeParams());
    };

    webApp.onEvent("themeChanged", handler);
    return () => webApp.offEvent?.("themeChanged", handler);
  }, []);

  const effectiveTheme = useMemo(
    () => resolveTheme(mode, telegramTheme, systemTheme),
    [mode, telegramTheme, systemTheme],
  );

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    root.dataset.theme = effectiveTheme;
    root.classList.toggle("dark", effectiveTheme === "dark");
    root.classList.toggle("light", effectiveTheme === "light");
    applyThemeParams(telegramParams, mode === "telegram");
  }, [effectiveTheme, mode, telegramParams]);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);
    saveThemeMode(nextMode);
  };

  const value = useMemo(
    () => ({
      mode,
      effectiveTheme,
      setMode,
    }),
    [mode, effectiveTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};
