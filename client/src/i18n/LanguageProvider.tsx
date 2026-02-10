import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useTelegram } from "@/hooks/use-telegram";
import { Language, TranslationKey, translations } from "./translations";

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const STORAGE_KEY = "app_lang";

const isLanguage = (value: string | null): value is Language =>
  value === "ru" || value === "en";

const normalizeLanguage = (languageCode?: string | null): Language | null => {
  if (!languageCode) {
    return null;
  }
  const normalized = languageCode.trim().toLowerCase().split("-")[0];
  if (normalized === "ru") {
    return "ru";
  }
  if (normalized === "en") {
    return "en";
  }
  return null;
};

const getStoredLanguage = (): Language | null => {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLanguage(stored) ? stored : null;
};

const humanizeKey = (key: string) => {
  const parts = key.split(".");
  const tail = parts.length >= 3 ? parts.slice(-2).join(" ") : parts[parts.length - 1] ?? key;
  const spaced = tail
    .replace(/_/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
  if (!spaced) {
    return key;
  }
  const words = spaced.split(" ").map((word) => {
    if (!word) {
      return "";
    }
    const lettersOnly = word.replace(/[^a-zA-Z]/g, "");
    if (lettersOnly && lettersOnly === lettersOnly.toUpperCase()) {
      return word;
    }
    return word.toLowerCase();
  });
  const sentence = words.join(" ");
  return sentence.charAt(0).toUpperCase() + sentence.slice(1);
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useTelegram();
  const [language, setLanguageState] = useState<Language>(
    normalizeLanguage(user?.language_code) ?? getStoredLanguage() ?? "en"
  );

  useEffect(() => {
    const telegramLanguage = normalizeLanguage(user?.language_code);
    if (telegramLanguage) {
      setLanguageState(telegramLanguage);
      return;
    }

    const stored = getStoredLanguage();
    if (stored) {
      setLanguageState(stored);
    }
  }, [user?.language_code]);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, nextLanguage);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>) => {
      const resolved = translations[language][key] ?? translations.en[key] ?? key;
      const template = resolved === key ? humanizeKey(key) : resolved;
      if (!params) {
        return template;
      }
      return Object.entries(params).reduce(
        (result, [paramKey, paramValue]) =>
          result.replaceAll(`{${paramKey}}`, String(paramValue)),
        template
      );
    },
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
};
