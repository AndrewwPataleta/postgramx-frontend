import type { Language } from "@/i18n/translations";
import { nanoToTonString } from "@/lib/ton";

const getLocale = (language: Language) => (language === "ru" ? "ru-RU" : "en-US");

export const formatNumber = (
  value: number,
  language: Language,
  options?: Intl.NumberFormatOptions
) => {
  return new Intl.NumberFormat(getLocale(language), options).format(value);
};

export const formatTon = (amountNano: string | bigint, language: Language) => {
  try {
    const s = nanoToTonString(amountNano); // "0.1" / "1.23456789"
    // ограничим до 2 знаков, но как строку (без float)
    const [whole, frac = ""] = s.split(".");
    const frac2 = frac.slice(0, 2).replace(/0+$/, "");
    const normalized = frac2 ? `${whole}.${frac2}` : whole;

    // красивое форматирование целой части по локали
    const wholeNumber = Number(whole); // тут safe, это целая часть
    const formattedWhole = new Intl.NumberFormat(getLocale(language)).format(
      Number.isNaN(wholeNumber) ? 0 : wholeNumber
    );

    // если whole было большим или отрицательным — проще:
    // return formatTonString(normalized) — но у тебя там запятые всегда по en
    return frac2 ? `${formattedWhole}.${frac2}` : formattedWhole;
  } catch {
    return String(amountNano);
  }
};


export const formatTonValue = (amount: number | string, language: Language) => {
  const value = typeof amount === "number" ? amount : Number(amount);
  if (Number.isNaN(value)) {
    return String(amount);
  }
  return formatNumber(value, language, { maximumFractionDigits: 2 });
};

export const formatDateTime = (iso: string | undefined | null, language: Language) => {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(getLocale(language), {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

export const formatDate = (iso: string | undefined | null, language: Language) => {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat(getLocale(language), {
    dateStyle: "medium",
  }).format(date);
};
