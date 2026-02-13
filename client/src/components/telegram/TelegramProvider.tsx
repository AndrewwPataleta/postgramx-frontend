import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  DEFAULT_INSETS,
  ensureWebAppReady,
  getTelegramUser,
  getTelegramWebApp,
  mockTelegramAuth,
  normalizeInsets,
  setInsetCssVars,
  TelegramInsets,
  TelegramUser,
} from "@/lib/telegram";
import { TELEGRAM_MOCK } from "@/config/env";

interface TelegramContextValue {
  webAppDetected: boolean;
  user: TelegramUser | null;
  isAuthenticated: boolean;
  safeAreaInset: TelegramInsets;
  contentSafeAreaInset: TelegramInsets | null;
}

const TelegramContext = createContext<TelegramContextValue | undefined>(undefined);

let hasWarnedMissingWebApp = false;

export const TelegramProvider = ({ children }: { children: ReactNode }) => {
  const [webAppDetected, setWebAppDetected] = useState(false);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [safeAreaInset, setSafeAreaInset] = useState<TelegramInsets>(DEFAULT_INSETS);
  const [contentSafeAreaInset, setContentSafeAreaInset] =
    useState<TelegramInsets | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) {
      return;
    }
    initializedRef.current = true;

    const webApp = getTelegramWebApp();
    if (!webApp && !TELEGRAM_MOCK) {
      setWebAppDetected(false);
      setUser(null);
      setSafeAreaInset(DEFAULT_INSETS);
      setContentSafeAreaInset(null);
      setInsetCssVars(DEFAULT_INSETS, DEFAULT_INSETS);
      if (!hasWarnedMissingWebApp) {
        console.warn("Telegram WebApp not detected.");
        hasWarnedMissingWebApp = true;
      }
      return;
    }

    if (!webApp && TELEGRAM_MOCK) {
      setWebAppDetected(true);
      setUser(mockTelegramAuth.user);
      setSafeAreaInset(DEFAULT_INSETS);
      setContentSafeAreaInset(null);
      setInsetCssVars(DEFAULT_INSETS, DEFAULT_INSETS);
      return;
    }

    if (!webApp) {
      return;
    }

    setWebAppDetected(true);
    ensureWebAppReady(webApp);
    setUser(getTelegramUser(webApp));

    webApp.disableVerticalSwipes?.();

    const updateInsets = () => {
      const safeInsets = normalizeInsets(webApp.safeAreaInset);
      const contentInsets = webApp.contentSafeAreaInset
        ? normalizeInsets(webApp.contentSafeAreaInset)
        : null;
      setSafeAreaInset(safeInsets);
      setContentSafeAreaInset(contentInsets);
      setInsetCssVars(safeInsets, contentInsets ?? safeInsets);
    };

    updateInsets();
    webApp.onEvent?.("viewportChanged", updateInsets);
    webApp.onEvent?.("safeAreaChanged", updateInsets);
    webApp.onEvent?.("contentSafeAreaChanged", updateInsets);

    return () => {
      webApp.enableVerticalSwipes?.();
      webApp.offEvent?.("viewportChanged", updateInsets);
      webApp.offEvent?.("safeAreaChanged", updateInsets);
      webApp.offEvent?.("contentSafeAreaChanged", updateInsets);
    };
  }, []);

  const value = useMemo(
    () => ({
      webAppDetected,
      user,
      isAuthenticated: Boolean(webAppDetected && user),
      safeAreaInset,
      contentSafeAreaInset,
    }),
    [webAppDetected, user, safeAreaInset, contentSafeAreaInset]
  );

  return (
    <TelegramContext.Provider value={value}>{children}</TelegramContext.Provider>
  );
};

export const useTelegramContext = () => {
  const context = useContext(TelegramContext);
  if (!context) {
    throw new Error("useTelegramContext must be used within TelegramProvider");
  }
  return context;
};
