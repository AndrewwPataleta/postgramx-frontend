import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AUTH_EXPIRED_EVENT, clearAuthToken, setAuthToken } from "@/lib/api/auth";
import {
  getTelegramUser,
  getTelegramWebApp,
  mockTelegramAuth,
} from "@/lib/telegram";
import { TELEGRAM_MOCK } from "@/config/env";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authTelegram } from "@/api/features/authApi";
import type { ApiError } from "@/api/core/apiErrors";
import type { TelegramUserLike } from "@/types/auth";
import { ROUTES } from "@/constants/routes";

type AuthError = {
  type: "missing_telegram" | "auth_failed";
  message: string;
  debug?: string;
};

type AuthContextValue = {
  isReady: boolean;
  isLoading: boolean;
  user: unknown | null;
  accessToken: string | null;
  error: AuthError | null;
  initSession: () => Promise<{ ok: boolean }>;
  retry: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const extractAuthResult = (payload: unknown) => {
  const root = payload as Record<string, unknown> | null;
  const nested = (root?.data as Record<string, unknown> | null) ?? root;

  const accessToken =
    (nested?.accessToken as string | undefined) ??
    (nested?.token as string | undefined) ??
    (root?.accessToken as string | undefined) ??
    (root?.token as string | undefined) ??
    null;

  let user =
    (nested?.user as unknown) ??
    (nested?.profile as unknown) ??
    (root?.user as unknown) ??
    (root?.profile as unknown) ??
    null;

  if (!user) {
    const candidate = (nested ?? root) as Record<string, unknown> | null;
    if (
      candidate &&
      (typeof candidate.id === "string" ||
        typeof candidate.id === "number" ||
        typeof candidate.telegramId === "string" ||
        typeof candidate.telegramId === "number" ||
        typeof candidate.username === "string")
    ) {
      user = candidate;
    }
  }

  return { accessToken, user };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<unknown | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [error, setError] = useState<AuthError | null>(null);
  const inFlightRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();

  const initSession = useCallback(async () => {
    if (inFlightRef.current) {
      return { ok: false };
    }
    inFlightRef.current = true;
    setIsLoading(true);
    setIsReady(false);
    setError(null);

    try {
      const webApp = getTelegramWebApp();
      const telegramUser = TELEGRAM_MOCK
        ? mockTelegramAuth.user
        : getTelegramUser(webApp);

      const response = await authTelegram(
        (telegramUser ?? mockTelegramAuth.user) as TelegramUserLike
      );
      const { accessToken: nextToken, user: profile } = extractAuthResult(response);

      if (nextToken) {
        setAuthToken(nextToken);
        setAccessToken(nextToken);
      } else {
        setAccessToken(null);
      }

      setUser(profile ?? telegramUser ?? null);
      setIsReady(true);
      setError(null);
      return { ok: true };
    } catch (err) {
      const apiError = err as ApiError;
      setIsReady(false);
      setUser(null);
      setAccessToken(null);
      clearAuthToken();
      setError({
        type: "auth_failed",
        message: apiError.message || "Could not connect to the server.",
        debug: apiError.statusCode ? `${apiError.statusCode}` : undefined,
      });
      toast.error(apiError.message || "Could not connect to the server.");
      return { ok: false };
    } finally {
      setIsLoading(false);
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      clearAuthToken();
      setIsReady(false);
      setIsLoading(false);
      setUser(null);
      setAccessToken(null);
      setError({
        type: "auth_failed",
        message: "Session expired. Please sign in again.",
      });
      toast.error("Session expired. Please sign in again.");

      if (location.pathname !== ROUTES.SPLASH) {
        navigate(ROUTES.SPLASH, {
          replace: true,
          state: { returnTo: location.pathname },
        });
      }
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [location.pathname, navigate]);

  const retry = useCallback(() => {
    void initSession();
  }, [initSession]);

  const value = useMemo(
    () => ({
      isReady,
      isLoading,
      user,
      accessToken,
      error,
      initSession,
      retry,
    }),
    [isReady, isLoading, user, accessToken, error, initSession, retry]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
