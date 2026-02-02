import { translations, type TranslationKey } from "@/i18n/translations";

const isTranslationKey = (value: string): value is TranslationKey => value in translations.en;

const resolveMessage = (
  message: string,
  fallback: string,
  translate?: (key: TranslationKey) => string
) => {
  if (translate && isTranslationKey(message)) {
    return translate(message);
  }

  return message || fallback;
};

export const getErrorMessage = (
  error: unknown,
  fallback: string,
  translate?: (key: TranslationKey) => string
) => {
  if (typeof error === "string") {
    return resolveMessage(error, fallback, translate);
  }

  if (error && typeof error === "object" && "message" in error) {
    return resolveMessage(String((error as { message?: string }).message || ""), fallback, translate);
  }

  return fallback;
};
