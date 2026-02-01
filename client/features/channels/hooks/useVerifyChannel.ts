import { useMutation, useQueryClient } from "@tanstack/react-query";
import { verifyChannel } from "@/api/features/channelsApi";
import type { ChannelEntity } from "@/models/entities";
import type { ApiError } from "@/api/core/apiErrors";

const VERIFY_ERROR_MESSAGES: Record<string, string> = {
  BOT_NOT_ADMIN: "Please add the bot as admin in channel settings",
  BOT_MISSING_RIGHTS: "Enable 'Post messages' permission for the bot",
  USER_NOT_ADMIN: "You must be an admin of the channel",
};

const extractErrorCode = (error: unknown): string | undefined => {
  if (!error || typeof error !== "object") {
    return undefined;
  }

  if ("code" in error && typeof (error as { code?: unknown }).code === "string") {
    return (error as { code?: string }).code;
  }

  if (
    "details" in error &&
    (error as { details?: unknown }).details &&
    typeof (error as { details?: unknown }).details === "object" &&
    "code" in (error as { details?: Record<string, unknown> }).details!
  ) {
    const details = (error as { details?: Record<string, unknown> }).details;
    if (typeof details?.code === "string") {
      return details.code;
    }
  }

  return undefined;
};

export const getVerifyErrorMessage = (error: unknown, fallback: string) => {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && "message" in error) {
    const code = extractErrorCode(error);
    if (code && code in VERIFY_ERROR_MESSAGES) {
      return VERIFY_ERROR_MESSAGES[code];
    }
    return String((error as { message?: string }).message ?? fallback);
  }

  const code = extractErrorCode(error);
  if (code && code in VERIFY_ERROR_MESSAGES) {
    return VERIFY_ERROR_MESSAGES[code];
  }

  return fallback;
};

export const getVerifyResponseErrorMessage = (_response: ChannelEntity, fallback: string) => fallback;

export const useVerifyChannel = () => {
  const queryClient = useQueryClient();

  return useMutation<ChannelEntity, ApiError, string>({
    mutationFn: (id) => verifyChannel({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channelsList"] });
    },
  });
};
