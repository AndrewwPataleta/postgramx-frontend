import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
import { ROUTES } from "@/constants/routes";

const Splash = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { initSession, retry, isLoading, isReady, error, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? ROUTES.MARKETPLACE;
  const isLocalBuild = import.meta.env.DEV;
  const telegramAppUrl = "https://t.me/postgramx_bot";

  useEffect(() => {
    if (isReady && user) {
      return;
    }
    void initSession();
  }, [initSession, isReady, user]);

  useEffect(() => {
    if (isReady && user) {
      navigate(redirectTo === ROUTES.SPLASH ? ROUTES.MARKETPLACE : redirectTo, {
        replace: true,
      });
    }
  }, [isReady, navigate, redirectTo, user]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeoutId = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const isMissingTelegram = error?.type === "missing_telegram";
  const isAuthError = error?.type === "auth_failed";
  const showTelegramStub = isMissingTelegram && !isLocalBuild;

  const subtitle = useMemo(() => {
    if (showTelegramStub) {
      return "This app is only available inside Telegram.";
    }
    if (isMissingTelegram) {
      return "Telegram WebApp not detected.";
    }
    if (isAuthError) {
      return error?.message ?? "Could not connect to the server.";
    }
    return "Connecting to Telegram…";
  }, [error?.message, isAuthError, isMissingTelegram]);

  const handleCopyDebug = async () => {
    const debugPayload = {
      error,
      timestamp: new Date().toISOString(),
    };
    await navigator.clipboard.writeText(JSON.stringify(debugPayload, null, 2));
    setCopied(true);
  };

  return (
    <div className="safe-area-top safe-area-bottom flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-6 text-center">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="relative flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/70 via-accent/70 to-primary/60 blur-2xl opacity-80" />
          <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary via-accent to-primary shadow-[0_0_25px_hsl(var(--primary)/0.45)]">
            <span className="text-lg font-semibold tracking-[0.2em] text-primary-foreground">X</span>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-lg font-semibold">
            {isMissingTelegram
              ? "Open in Telegram"
              : isAuthError
                ? "Couldn’t connect"
                : ""}
          </h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
          {error?.debug ? (
            <p className="text-xs text-muted-foreground">{error.debug}</p>
          ) : null}
        </div>

        {!isMissingTelegram && !isAuthError ? (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary/40 border-t-primary" />
            <span>{isLoading ? "Authorizing session…" : "Preparing session…"}</span>
          </div>
        ) : null}

        {showTelegramStub ? (
          <div className="flex w-full flex-col gap-3">
            <Button asChild className="w-full">
              <a href={telegramAppUrl} target="_blank" rel="noreferrer">
                Open in Telegram
              </a>
            </Button>
            <p className="text-xs text-muted-foreground">
              The mini app is available only via Telegram.
            </p>
          </div>
        ) : null}

        {(isMissingTelegram || isAuthError) && !showTelegramStub && (
          <div className="flex w-full flex-col gap-3">
            <Button onClick={retry} className="w-full">
              Retry
            </Button>
            {isAuthError ? (
              <Button
                onClick={handleCopyDebug}
                variant="outline"
                className="w-full"
              >
                {copied ? "Copied" : "Copy debug info"}
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default Splash;
