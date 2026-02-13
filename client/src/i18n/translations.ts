import en from "./locales/en.json";
import ru from "./locales/ru.json";

export const translations = {
  en: en as Record<string, string>,
  ru: ru as Record<string, string>,
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.en;
