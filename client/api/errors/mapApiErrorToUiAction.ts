import { ApiError } from "@/api/core/apiErrors";

type BottomSheetPayload = {
  titleKey: string;
  bodyKey: string;
  primaryActionKey: string;
};

export type ApiErrorUiAction =
  | { type: "bottomSheet"; payload: BottomSheetPayload };

export type ApiErrorUiActionResult =
  | { handled: true; action: ApiErrorUiAction }
  | { handled: false };

const BOT_FORBIDDEN_MESSAGE_KEY = "channels.errors.bot_forbidden";

const readString = (value: unknown): string | undefined => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }
  return undefined;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object";

const collectCandidateObjects = (value: unknown) => {
  if (!isRecord(value)) {
    return [] as Record<string, unknown>[];
  }

  const candidates: Record<string, unknown>[] = [value];
  const nestedKeys = ["data", "details", "error", "response"];

  nestedKeys.forEach((key) => {
    const nested = value[key];
    if (isRecord(nested)) {
      candidates.push(nested);
      if (key === "response" && isRecord(nested.data)) {
        candidates.push(nested.data as Record<string, unknown>);
      }
      if (key === "error") {
        if (isRecord(nested.data)) {
          candidates.push(nested.data as Record<string, unknown>);
        }
        if (isRecord(nested.details)) {
          candidates.push(nested.details as Record<string, unknown>);
        }
      }
    }
  });

  return candidates;
};

const extractCodeAndMessage = (error: unknown) => {
  const candidates = collectCandidateObjects(error);
  if (error instanceof ApiError) {
    candidates.push(...collectCandidateObjects(error.raw));
  }

  let code: string | undefined;
  let message: string | undefined;

  for (const candidate of candidates) {
    if (!code) {
      code = readString(candidate.code);
    }
    if (!message) {
      message = readString(candidate.message);
    }
    if (code && message) {
      break;
    }
  }

  if (!message && isRecord(error)) {
    message = readString(error.message);
  }

  return { code, message };
};

export const mapApiErrorToUiAction = (error: unknown): ApiErrorUiActionResult => {
  const { code, message } = extractCodeAndMessage(error);

  if (code === "BOT_FORBIDDEN" || message === BOT_FORBIDDEN_MESSAGE_KEY) {
    return {
      handled: true,
      action: {
        type: "bottomSheet",
        payload: {
          titleKey: "channels.ownerLinkSheet.title",
          bodyKey: "channels.ownerLinkSheet.body",
          primaryActionKey: "channels.ownerLinkSheet.primaryAction",
        },
      },
    };
  }

  return { handled: false };
};
