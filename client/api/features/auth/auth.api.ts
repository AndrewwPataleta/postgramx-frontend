import { postJson } from "@/api/core/apiClient";
import { buildAuthBody, requireInitDataToken } from "@/api/core/authEnvelope";
import type { AuthResponse, TelegramAuthData, TelegramUserLike } from "./auth.types";

const resolveUserValue = (user: TelegramUserLike, key: keyof TelegramUserLike) => user[key];

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

  return {
    id: user.id,
    username: username ?? "",
    firstName,
    lastName,
    lang,
    isPremium,
  };
};

export const authTelegram = async (user?: TelegramUserLike | null): Promise<AuthResponse> => {
  const token = requireInitDataToken();
  const payload = user ? normalizeUser(user) : ({} as TelegramAuthData);
  return postJson("/auth", buildAuthBody(payload, token));
};
