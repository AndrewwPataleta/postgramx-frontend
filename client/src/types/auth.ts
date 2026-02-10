export type TelegramUserLike = {
  id: number;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  lang?: string | null;
  isPremium?: boolean | null;
  first_name?: string | null;
  last_name?: string | null;
  language_code?: string | null;
  is_premium?: boolean | null;
};

export type TelegramAuthData = {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  lang: string;
  isPremium: boolean;
};

export type AuthRequest = {
  platformType: "telegram";
  authType: "telegram";
  token: string;
  data: TelegramAuthData;
};

export type AuthResponseData = {
  accessToken?: string;
  token?: string;
  user?: unknown;
  profile?: unknown;
};

export type AuthResponse = AuthResponseData & {
  data?: AuthResponseData;
};
