import { useEffect, useMemo, useState } from "react";
import { Button } from "@/design-system/ui/button";
import { SkeletonLine } from "@/design-system/skeletons/Shimmer";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { TELEGRAM_MOCK } from "@/config/env";

const Splash = () => {
  const { initSession, retry, isLoading, isReady, error, user } = useAuth();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isReady && user) {
      return;
    }
    void initSession();
  }, [initSession, isReady, user]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeoutId = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const isMissingTelegram = error?.type === "missing_telegram";
  const isAuthError = error?.type === "auth_failed";

  const title = useMemo(() => {
    if (isMissingTelegram) {
      return "Open in Telegram";
    }
    if (isAuthError) {
      return "Couldn’t connect";
    }
    if (isReady && user) {
      return "Authentication complete";
    }
    return "Connecting to Telegram";
  }, [isAuthError, isMissingTelegram, isReady, user]);

  const subtitle = useMemo(() => {
    if (isMissingTelegram) {
      return "This mini app must be opened from Telegram.";
    }
    if (isAuthError) {
      return error?.message ?? "Could not connect to the server.";
    }
    if (isReady && user) {
      return "Auth architecture is ready to use as a template.";
    }
    return "Preparing authorization session…";
  }, [error?.message, isAuthError, isMissingTelegram, isReady, user]);

  const handleCopyDebug = async () => {
    const debugPayload = {
      error,
      mock: TELEGRAM_MOCK,
      timestamp: new Date().toISOString(),
    };
    await navigator.clipboard.writeText(JSON.stringify(debugPayload, null, 2));
    setCopied(true);
  };

  return (
    <div className="safe-area-top safe-area-bottom relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#F8F6FA] to-[#F3ECF7] px-6 py-8 text-foreground">
      <div className="pointer-events-none absolute -left-12 top-24 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-12 right-0 h-44 w-44 rounded-full bg-primary/20 blur-3xl" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col gap-6 rounded-[2rem] border border-white/60 bg-white/35 p-6 shadow-[0_12px_40px_rgba(31,19,40,0.08)] backdrop-blur-md lg:p-10">
        {TELEGRAM_MOCK ? (
          <span className="w-fit rounded-full border border-dashed border-primary/50 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.2em] text-primary">
            Dev mode — Telegram mock
          </span>
        ) : null}

        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
          PostgramX Template
        </p>

        <h1 className="text-4xl font-semibold leading-[1.05] sm:text-5xl">
          <span className="text-primary">Telegram auth</span> starter
        </h1>

        <p className="max-w-2xl text-base leading-relaxed text-foreground/80">
          We removed extra product screens and kept only the authorization
          architecture, so you can use this project as a clean template base.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/60 bg-white/50 px-4 py-3">
            <p className="text-xs text-foreground/60">Status</p>
            <p className="text-base font-semibold">{title}</p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/50 px-4 py-3">
            <p className="text-xs text-foreground/60">Session</p>
            <p className="text-base font-semibold">
              {isLoading
                ? "Initializing"
                : isReady && user
                  ? "Ready"
                  : "Waiting"}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{subtitle}</p>
        {error?.debug ? (
          <p className="text-xs text-muted-foreground">{error.debug}</p>
        ) : null}

        {!isMissingTelegram && !isAuthError ? (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <SkeletonLine className="h-2 w-32" />
            <span>{isLoading ? "Authorizing…" : "Session prepared"}</span>
          </div>
        ) : null}

        {(isMissingTelegram || isAuthError) && (
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={retry}
              className="min-w-[9rem] bg-primary text-white hover:bg-primary/90"
            >
              Retry
            </Button>
            {isAuthError ? (
              <Button
                onClick={handleCopyDebug}
                variant="outline"
                className="min-w-[9rem] border-primary/40 bg-white/70 hover:bg-white"
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
