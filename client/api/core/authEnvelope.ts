import { getTelegramInitDataToken } from "@/telegram/getTelegramInitData";

export type AuthEnvelope<TData> = {
  platformType: "telegram";
  authType: "telegram";
  token: string;
  data: TData;
};

const AUTH_FIELD_KEYS = ["platformType", "authType", "token"] as const;

const containsAuthFields = (data: unknown): boolean => {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

  return AUTH_FIELD_KEYS.some((key) => key in (data as Record<string, unknown>));
};

export const buildAuthBody = <TData>(data: TData, token: string): AuthEnvelope<TData> => {
  if (import.meta.env.DEV && containsAuthFields(data)) {
    throw new Error("Do not pass auth fields in data. Use buildAuthBody instead.");
  }

  return {
    platformType: "telegram",
    authType: "telegram",
    token,
    data,
  };
};

export const getInitDataToken = (): string => {
  try {
    return getTelegramInitDataToken();
  } catch {
    return "";
  }
};

export const requireInitDataToken = (): string => {
  const token = getInitDataToken();
  if (!token) {
    throw new Error("Telegram initData token is missing");
  }
  return token;
};

export const assertAuthReady = () => {
  requireInitDataToken();
};
