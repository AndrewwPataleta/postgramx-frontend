import { getTelegramInitDataToken } from "@/telegram/getTelegramInitData";

export type TelegramEnvelope<T> = {
  platformType: "telegram";
  authType: "telegram";
  token: string;
  data: T;
};

const AUTH_FIELD_KEYS = ["platformType", "authType", "token"] as const;

const containsAuthFields = (data: unknown): boolean => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

  return AUTH_FIELD_KEYS.some((key) => key in (data as Record<string, unknown>));
};

export const buildTelegramEnvelope = <T>(data: T): TelegramEnvelope<T> => {
  if (import.meta.env.DEV && containsAuthFields(data)) {
    throw new Error(
      "Do not pass auth fields in data. Envelope is added automatically."
    );
  }

  return {
    platformType: "telegram",
    authType: "telegram",
    token: getTelegramInitDataToken(),
    data,
  };
};
