export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

export interface TelegramInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface TelegramWebApp {
  initData?: string;
  initDataUnsafe?: {
    user?: TelegramUser;
  };
  MainButton?: {
    showProgress?: (leaveActive?: boolean) => void;
    hideProgress?: () => void;
  };
  BackButton?: {
    show?: () => void;
    hide?: () => void;
    onClick?: (handler: () => void) => void;
    offClick?: (handler: () => void) => void;
  };
  HapticFeedback?: TelegramHapticFeedback;
  CloudStorage?: TelegramCloudStorage;
  openTelegramLink?: (url: string) => void;
  safeAreaInset?: Partial<TelegramInsets>;
  contentSafeAreaInset?: Partial<TelegramInsets>;
  onEvent?: (
    event: "viewportChanged" | "safeAreaChanged" | "contentSafeAreaChanged",
    handler: () => void
  ) => void;
  offEvent?: (
    event: "viewportChanged" | "safeAreaChanged" | "contentSafeAreaChanged",
    handler: () => void
  ) => void;
  ready?: () => void;
  expand?: () => void;
  disableVerticalSwipes?: () => void;
  enableVerticalSwipes?: () => void;
}

export interface TelegramCloudStorage {
  getItem?: (
    key: string,
    callback: (error: string | null, value: string | null) => void
  ) => void;
  setItem?: (
    key: string,
    value: string,
    callback?: (error: string | null) => void
  ) => void;
}

export interface TelegramHapticFeedback {
  impactOccurred?: (
    style: "light" | "medium" | "heavy" | "rigid" | "soft"
  ) => void;
  notificationOccurred?: (type: "error" | "success" | "warning") => void;
  selectionChanged?: () => void;
}

export const DEFAULT_INSETS: TelegramInsets = {
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export const mockTelegramUser: TelegramUser = {
  id: 999999,
  first_name: "Local",
  last_name: "Tester",
  username: "localtester",
  language_code: "en",
  is_premium: false,
};

export const mockTelegramInitData =
  "user=%7B%22id%22%3A701831837%2C%22first_name%22%3A%22TesterTwo%22%2C%22last_name%22%3A%22%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FWAAqxD0XRTi2ZRg_jpupi5rmt6cyvdCRpEPWQQnDCRc.svg%22%7D&chat_instance=5325968562620564049&chat_type=sender&auth_date=1739958508&signature=QyNk2aUQUIw6aq2ppG5odd1UnZt41zL-j1Ulx9sHmGMADwGlQFyfHr5oij2d4__X-QdM7e84pb8wtwdDmuP1Dg&hash=66cd49b163827889fc650a5f64d775a6938ac3e0640bfc4cbe3501cd24da95b2";

export const mockTelegramAuth = {
  initData: mockTelegramInitData,
  user: mockTelegramUser,
};

export const getTelegramWebApp = (): TelegramWebApp | null => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.Telegram?.WebApp ?? null;
};

export const normalizeInsets = (
  insets?: Partial<TelegramInsets> | null
): TelegramInsets => ({
  top: insets?.top ?? 0,
  right: insets?.right ?? 0,
  bottom: insets?.bottom ?? 0,
  left: insets?.left ?? 0,
});

const parseUserFromInitData = (initData?: string): TelegramUser | null => {
  if (!initData) {
    return null;
  }

  const params = new URLSearchParams(initData);
  const rawUser = params.get("user");
  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as TelegramUser;
  } catch {
    try {
      return JSON.parse(decodeURIComponent(rawUser)) as TelegramUser;
    } catch {
      return null;
    }
  }
};

export const getTelegramUser = (webApp: TelegramWebApp | null): TelegramUser | null => {
  if (!webApp) {
    return null;
  }

  return webApp.initDataUnsafe?.user ?? parseUserFromInitData(webApp.initData);
};

export const ensureWebAppReady = (webApp: TelegramWebApp) => {
  webApp.ready?.();
  webApp.expand?.();
};

export const setInsetCssVars = (
  safe: TelegramInsets,
  content: TelegramInsets
) => {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.style.setProperty("--tg-safe-top", `${safe.top}px`);
  root.style.setProperty("--tg-safe-right", `${safe.right}px`);
  root.style.setProperty("--tg-safe-bottom", `${safe.bottom}px`);
  root.style.setProperty("--tg-safe-left", `${safe.left}px`);
  root.style.setProperty(
    "--tg-content-safe-area-inset-top",
    `${content.top}px`
  );
  root.style.setProperty(
    "--tg-content-safe-area-inset-right",
    `${content.right}px`
  );
  root.style.setProperty(
    "--tg-content-safe-area-inset-bottom",
    `${content.bottom}px`
  );
  root.style.setProperty(
    "--tg-content-safe-area-inset-left",
    `${content.left}px`
  );
};
