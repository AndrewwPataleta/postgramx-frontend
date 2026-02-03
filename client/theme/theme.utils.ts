import type { ResolvedTheme } from "./theme.types";
import { getTelegramWebApp } from "@/lib/telegram";

export type TelegramThemeParams = {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  destructive_text_color?: string;
};

export const getSystemTheme = (): ResolvedTheme => {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

export const getTelegramTheme = (): ResolvedTheme | null => {
  const webApp = getTelegramWebApp();
  if (!webApp?.colorScheme) {
    return null;
  }

  return webApp.colorScheme === "dark" ? "dark" : "light";
};

export const getTelegramThemeParams = (): TelegramThemeParams | null => {
  const webApp = getTelegramWebApp();
  return webApp?.themeParams ?? null;
};

const parseHex = (hex: string): [number, number, number] | null => {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length === 3) {
    const r = parseInt(normalized[0] + normalized[0], 16);
    const g = parseInt(normalized[1] + normalized[1], 16);
    const b = parseInt(normalized[2] + normalized[2], 16);
    return [r, g, b];
  }

  if (normalized.length === 6) {
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return [r, g, b];
  }

  return null;
};

const parseRgb = (value: string): [number, number, number] | null => {
  const match = value
    .replace(/\s+/g, "")
    .match(/rgba?\((\d{1,3}),(\d{1,3}),(\d{1,3})(?:,[\d.]+)?\)/i);
  if (!match) {
    return null;
  }

  const r = Number(match[1]);
  const g = Number(match[2]);
  const b = Number(match[3]);
  if ([r, g, b].some((channel) => Number.isNaN(channel))) {
    return null;
  }

  return [r, g, b];
};

const rgbToHsl = (r: number, g: number, b: number): string => {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case red:
        h = (green - blue) / delta + (green < blue ? 6 : 0);
        break;
      case green:
        h = (blue - red) / delta + 2;
        break;
      case blue:
        h = (red - green) / delta + 4;
        break;
      default:
        h = 0;
    }

    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

export const colorToHsl = (value?: string): string | null => {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  let rgb: [number, number, number] | null = null;

  if (normalized.startsWith("#")) {
    rgb = parseHex(normalized);
  } else if (normalized.startsWith("rgb")) {
    rgb = parseRgb(normalized);
  }

  if (!rgb) {
    return null;
  }

  return rgbToHsl(rgb[0], rgb[1], rgb[2]);
};
