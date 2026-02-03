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
  colorScheme?: "light" | "dark";
  themeParams?: {
    bg_color?: string;
    text_color?: string;
    hint_color?: string;
    link_color?: string;
    button_color?: string;
    button_text_color?: string;
    secondary_bg_color?: string;
    destructive_text_color?: string;
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
    event:
      | "viewportChanged"
      | "safeAreaChanged"
      | "contentSafeAreaChanged"
      | "themeChanged",
    handler: () => void
  ) => void;
  offEvent?: (
    event:
      | "viewportChanged"
      | "safeAreaChanged"
      | "contentSafeAreaChanged"
      | "themeChanged",
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
