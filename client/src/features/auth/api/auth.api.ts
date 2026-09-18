import { apiPost } from "@/api/core/http";
import { getDeviceTimeZone } from "@/shared/lib/time/timezone";
import type { AuthResponse, TelegramAuthData, TelegramUserLike } from "@/types/auth";

const resolveUserValue = (user: TelegramUserLike, key: keyof TelegramUserLike) =>
  user[key];

const normalizeUser = (user: TelegramUserLike): TelegramAuthData => {
  const username =
    (resolveUserValue(user, "username") as string | null | undefined) ?? "";
  const firstName =
    (resolveUserValue(user, "firstName") as string | null | undefined) ??
    (resolveUserValue(user, "first_name") as string | null | undefined) ??
    "";
  const lastName =
    (resolveUserValue(user, "lastName") as string | null | undefined) ??
    (resolveUserValue(user, "last_name") as string | null | undefined) ??
    "";
  const lang =
    (resolveUserValue(user, "lang") as string | null | undefined) ??
    (resolveUserValue(user, "language_code") as string | null | undefined) ??
    "en";
  const isPremium =
    (resolveUserValue(user, "isPremium") as boolean | null | undefined) ??
    (resolveUserValue(user, "is_premium") as boolean | null | undefined) ??
    false;

  const timeZone = getDeviceTimeZone();
  const utcOffsetMinutes = -new Date().getTimezoneOffset();

  return {
    id: user.id,
    username: username ?? "",
    firstName,
    lastName,
    lang,
    isPremium,
    timeZone,
    utcOffsetMinutes,
  };
};

export const authTelegram = async (
  user?: TelegramUserLike | null
): Promise<AuthResponse> => {
  if (!user) {
    const timeZone = getDeviceTimeZone();
    const utcOffsetMinutes = -new Date().getTimezoneOffset();
    return apiPost<AuthResponse, Pick<TelegramAuthData, "timeZone" | "utcOffsetMinutes">>("/auth", { timeZone, utcOffsetMinutes });
  }

  const payload = normalizeUser(user);
  return apiPost<AuthResponse, TelegramAuthData>("/auth", payload);
};

export const authApi = {
  authTelegram,
};
