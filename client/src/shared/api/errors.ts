import { translations, type TranslationKey } from "@/i18n/translations";

export class ApiError extends Error {
  statusCode: number;
  raw: unknown;

  constructor(message: string, statusCode: number, raw: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.raw = raw;
  }
}

const readMessage = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim().length > 0) return value;
  if (!value || typeof value !== "object") return null;
  const candidate = value as { message?: unknown; error?: unknown };
  if (typeof candidate.message === "string" && candidate.message.trim().length > 0) return candidate.message;
  if (typeof candidate.error === "string" && candidate.error.trim().length > 0) return candidate.error;
  if (candidate.error && typeof candidate.error === "object") {
    const nested = candidate.error as { message?: unknown };
    if (typeof nested.message === "string" && nested.message.trim().length > 0) return nested.message;
  }
  return null;
};

export const parseBackendError = (payload: unknown, fallback = "Request failed") =>
  readMessage(payload) ?? fallback;

const isTranslationKey = (value: string): value is TranslationKey => value in translations.en;

export const normalizeError = (
  error: unknown,
  fallback: string,
  translate?: (key: TranslationKey) => string,
) => {
  const message = typeof error === "string"
    ? error
    : error && typeof error === "object" && "message" in error
      ? String((error as { message?: string }).message ?? "")
      : "";

  if (translate && message && isTranslationKey(message)) return translate(message);
  return message || fallback;
};
