import { ApiError } from "@/api/core/apiErrors";
import { translations, type TranslationKey } from "@/i18n/translations";

const CHANNEL_ERROR_MESSAGES: Record<string, string> = {
  CHANNEL_NOT_FOUND: "Channel not found",
  NOT_A_CHANNEL: "This username is not a channel",
  CHANNEL_PRIVATE_OR_NO_USERNAME: "Channel must be public",
  USER_NOT_ADMIN: "You must be an admin of this channel",
  BOT_NOT_ADMIN: "Please add the bot as an admin",
  BOT_MISSING_RIGHTS: "Bot needs permission to post messages",
  CHANNEL_ALREADY_LINKED: "channels.errors.channel_already_linked",
  "channels.errors.channel_already_linked": "channels.errors.channel_already_linked",
};

const shouldLogChannelErrors =
  Boolean(import.meta.env.DEV) && import.meta.env.VITE_API_LOG === "true";

const readString = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return undefined;
};

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

const extractErrorDetails = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return {};
  }

  const apiError = error instanceof ApiError ? error : null;
  const details = apiError?.raw ?? {};
  return { apiError, details };
};

export const getChannelErrorMessage = (
  error: unknown,
  fallback = "Something went wrong. Try again.",
  translate?: (key: TranslationKey) => string
) => {
  const { apiError, details } = extractErrorDetails(error);
  const detailsRecord = details as Record<string, unknown>;
  const nestedError = (detailsRecord?.error ?? {}) as Record<string, unknown>;
  const nestedDetails = (nestedError?.details ?? {}) as Record<string, unknown>;
  const nestedData = (nestedError?.data ?? {}) as Record<string, unknown>;
  const topDetails = (detailsRecord?.details ?? {}) as Record<string, unknown>;

  const code =
    readString(detailsRecord?.code) ||
    readString(topDetails?.code) ||
    readString(nestedError?.code) ||
    readString(nestedDetails?.code) ||
    readString(nestedData?.code);
  const message =
    readString(apiError?.message) ||
    readString(detailsRecord?.message) ||
    readString(topDetails?.message) ||
    readString(nestedError?.message) ||
    readString(nestedDetails?.message) ||
    readString(nestedData?.message);

  if (shouldLogChannelErrors) {
    // eslint-disable-next-line no-console
    console.warn("[channels] verify error payload", {
      error,
      apiError,
      details,
      code,
      message,
    });
  }

  if (code && code in CHANNEL_ERROR_MESSAGES) {
    return resolveMessage(CHANNEL_ERROR_MESSAGES[code], fallback, translate);
  }

  if (message && message in CHANNEL_ERROR_MESSAGES) {
    return resolveMessage(CHANNEL_ERROR_MESSAGES[message], fallback, translate);
  }

  if (message) {
    return resolveMessage(message, fallback, translate);
  }

  return fallback;
};
