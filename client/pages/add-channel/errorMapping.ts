import { ApiError } from "@/api/core/errors";

const CHANNEL_ERROR_MESSAGES: Record<string, string> = {
  CHANNEL_NOT_FOUND: "Channel not found",
  NOT_A_CHANNEL: "This username is not a channel",
  CHANNEL_PRIVATE_OR_NO_USERNAME: "Channel must be public",
  USER_NOT_ADMIN: "You must be an admin of this channel",
  BOT_NOT_ADMIN: "Please add the bot as an admin",
  BOT_MISSING_RIGHTS: "Bot needs permission to post messages",
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
  fallback = "Something went wrong. Try again."
) => {
  const { apiError, details } = extractErrorDetails(error);
  const detailsRecord = details as Record<string, unknown>;
  const nestedError = (detailsRecord?.error ?? {}) as Record<string, unknown>;

  const code =
    (detailsRecord?.code as string | undefined) ||
    (nestedError?.code as string | undefined);
  const message =
    (apiError?.message as string | undefined) ||
    (detailsRecord?.message as string | undefined) ||
    (nestedError?.message as string | undefined);

  if (code && code in CHANNEL_ERROR_MESSAGES) {
    return CHANNEL_ERROR_MESSAGES[code];
  }

  if (message && message in CHANNEL_ERROR_MESSAGES) {
    return CHANNEL_ERROR_MESSAGES[message];
  }

  return message || fallback;
};
