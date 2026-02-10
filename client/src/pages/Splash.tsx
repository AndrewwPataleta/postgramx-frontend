import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { SkeletonLine } from "@/components/skeletons/Shimmer";
import { useAuth } from "@/components/auth/AuthProvider";
import { listMarketplaceChannels, listMyChannels } from "@/api/features/channelsApi";
import { listDeals } from "@/api/features/dealsApi";
import { getBalanceOverview } from "@/api/paymentsBalanceApi";
import { listTransactions } from "@/api/paymentsTransactionsApi";
import { TELEGRAM_MOCK } from "@/config/env";
import { ROUTES } from "@/constants/routes";
import {
  buildMarketplaceFiltersKey,
  buildMarketplaceQueryFilters,
  defaultMarketplaceFilters,
  marketplaceKeys,
} from "@/features/marketplace/viewmodels/marketplaceQuery";
import { buildTransactionsFiltersHash } from "@/hooks/useTransactions";

const Splash = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { initSession, retry, isLoading, isReady, error, user } = useAuth();
  const [copied, setCopied] = useState(false);
  const hasPrefetchedRef = useRef(false);
  const redirectTo =
    (location.state as { from?: string } | null)?.from ?? ROUTES.MARKETPLACE;

  useEffect(() => {
    if (isReady && user) {
      return;
    }
    void initSession();
  }, [initSession, isReady, user]);

  useEffect(() => {
    if (!isReady || !user) {
      return;
    }
    let isActive = true;

    const preloadMarketplace = async () => {
      if (!hasPrefetchedRef.current) {
        hasPrefetchedRef.current = true;
        const page = 1;
        const limit = 20;
        const sort = "recent" as const;
        const order = "desc" as const;
        const filtersKey = buildMarketplaceFiltersKey(
          defaultMarketplaceFilters,
          ""
        );
        const queryFilters = buildMarketplaceQueryFilters({
          filters: defaultMarketplaceFilters,
          query: "",
          page,
          limit,
          sort,
          order,
        });

        const channelsFilters = { sort: "recent", order: "desc" };
        const dealsParams = {
          role: "all" as const,
          pendingPage: 1,
          pendingLimit: 5,
          activePage: 1,
          activeLimit: 5,
          completedPage: 1,
          completedLimit: 5,
        };
        const transactionsFilters = { page: 1, limit: 10 };
        const transactionsFiltersHash = buildTransactionsFiltersHash(transactionsFilters);

        await Promise.allSettled([
          queryClient.prefetchQuery({
            queryKey: marketplaceKeys.channels(
              filtersKey,
              page,
              limit,
              sort,
              order
            ),
            queryFn: () => listMarketplaceChannels(queryFilters),
          }),
          queryClient.prefetchInfiniteQuery({
            queryKey: ["channelsList", channelsFilters],
            queryFn: ({ pageParam = 1 }) =>
              listMyChannels({
                ...channelsFilters,
                page: Number(pageParam),
                limit: 10,
              }),
            getNextPageParam: (lastPage) =>
              lastPage.hasNext ? lastPage.page + 1 : undefined,
            initialPageParam: 1,
          }),
          queryClient.prefetchQuery({
            queryKey: [
              "deals",
              dealsParams.role,
              dealsParams.pendingPage,
              dealsParams.activePage,
              dealsParams.completedPage,
            ],
            queryFn: () => listDeals(dealsParams),
          }),
          queryClient.prefetchQuery({
            queryKey: ["balanceOverview"],
            queryFn: () => getBalanceOverview(),
          }),
          queryClient.prefetchInfiniteQuery({
            queryKey: ["transactions", transactionsFiltersHash],
            queryFn: ({ pageParam = 1 }) =>
              listTransactions({ ...transactionsFilters, page: pageParam }),
            initialPageParam: 1,
          }),
        ]);
      }

      if (!isActive) {
        return;
      }
      navigate(redirectTo === ROUTES.SPLASH ? ROUTES.MARKETPLACE : redirectTo, {
        replace: true,
      });
    };

    void preloadMarketplace();

    return () => {
      isActive = false;
    };
  }, [isReady, navigate, queryClient, redirectTo, user]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeoutId = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const isMissingTelegram = error?.type === "missing_telegram";
  const isAuthError = error?.type === "auth_failed";

  const subtitle = useMemo(() => {
    if (isMissingTelegram) {
      return "This mini app must be opened from Telegram.";
    }
    if (isAuthError) {
      return error?.message ?? "Could not connect to the server.";
    }
    return "Connecting to Telegram…";
  }, [error?.message, isAuthError, isMissingTelegram]);

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
    <div className="safe-area-top safe-area-bottom flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-6 text-center">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        {TELEGRAM_MOCK ? (
          <span className="rounded-full border border-dashed border-primary/40 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.2em] text-primary">
            Dev mode — Telegram mock
          </span>
        ) : null}

        <div className="relative flex h-60 w-60 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/70 via-accent/70 to-primary/60 blur-2xl opacity-80" />
          <div className="relative z-10 flex h-40 w-40 items-center justify-center rounded-full shadow-[0_0_25px_hsl(var(--primary)/0.45)]">
            <img
              src="/logo.jpeg"
              alt="PostgramX logo"
              className="h-full w-full rounded-full object-cover"
            />
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
            <SkeletonLine className="h-3 w-20" />
            <span>{isLoading ? "Authorizing session…" : "Preparing session…"}</span>
          </div>
        ) : null}

        {(isMissingTelegram || isAuthError) && (
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
