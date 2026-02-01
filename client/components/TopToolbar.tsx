import { useCallback, useEffect, useMemo } from "react";
import { ArrowLeft, X } from "lucide-react";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { getTelegramWebApp } from "@/lib/telegram";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ROUTES } from "@/constants/routes";

const mainNavPaths = [ROUTES.MARKETPLACE, ROUTES.DEALS, ROUTES.CHANNELS, ROUTES.PROFILE];

const titleMatchers = [
  { path: `${ROUTES.MARKETPLACE}/channels/:channelId/request`, key: "marketplace.requestPlacement" },
  { path: `${ROUTES.MARKETPLACE}/channels/:channelId`, key: "marketplace.channelTitle" },
  { path: `${ROUTES.CHANNELS}/:channelId`, key: "marketplace.channelTitle" },
  { path: ROUTES.MARKETPLACE, key: "marketplace.title" },
  { path: `${ROUTES.DEALS}/create/:listingId`, key: "deals.scheduleTitle" },
  { path: `${ROUTES.DEALS}/predeal/:id`, key: "deals.preDealTitle" },
  { path: `${ROUTES.DEALS}/:dealId`, key: "deals.detailTitle" },
  { path: ROUTES.DEALS, key: "deals.title" },
  { path: `${ROUTES.CHANNEL_MANAGE(":id")}/listings/create`, key: "listings.createTitle" },
  { path: `${ROUTES.CHANNEL_MANAGE(":id")}/listings/preview`, key: "listings.previewTitle" },
  { path: `${ROUTES.CHANNEL_MANAGE(":id")}/listings/:listingId/edit`, key: "listings.editTitle" },
  { path: `${ROUTES.CHANNEL_MANAGE(":id")}/listings/success`, key: "listings.publishedTitle" },
  { path: `${ROUTES.CHANNEL_MANAGE(":id")}/listings`, key: "listings.title" },
  { path: `${ROUTES.CHANNEL_MANAGE(":id")}/settings`, key: "channels.settingsTitle" },
  { path: ROUTES.ADD_CHANNEL, key: "channels.add.title" },
  { path: ROUTES.ADD_CHANNEL_STEP("step-1"), key: "channels.add.title" },
  { path: ROUTES.ADD_CHANNEL_STEP("step-2"), key: "channels.add.title" },
  { path: ROUTES.ADD_CHANNEL_STEP("step-3"), key: "channels.add.title" },
  { path: ROUTES.CHANNELS, key: "channels.title" },
  { path: `${ROUTES.ESCROW(":dealId")}`, key: "deals.securePaymentTitle" },
  { path: ROUTES.FUNDS_LOCKED, key: "deals.fundsLockedTitle" },
  { path: ROUTES.PROFILE, key: "profile.title" },
];

const actionCloseMatchers = [
  ROUTES.ADD_CHANNEL,
  ROUTES.ADD_CHANNEL_STEP("step-1"),
  ROUTES.ADD_CHANNEL_STEP("step-2"),
  ROUTES.ADD_CHANNEL_STEP("step-3"),
];

const getFallbackPath = (pathname: string) => {
  if (pathname.startsWith(ROUTES.MARKETPLACE)) {
    return ROUTES.MARKETPLACE;
  }
  if (
    pathname.startsWith(ROUTES.DEALS) ||
    pathname.startsWith(ROUTES.ESCROW_BASE) ||
    pathname.startsWith(ROUTES.FUNDS_LOCKED)
  ) {
    return ROUTES.DEALS;
  }
  if (
    pathname.startsWith(ROUTES.CHANNELS) ||
    pathname.startsWith(ROUTES.CHANNEL_MANAGE_BASE) ||
    pathname.startsWith(ROUTES.ADD_CHANNEL)
  ) {
    return ROUTES.CHANNELS;
  }
  if (pathname.startsWith(ROUTES.PROFILE)) {
    return ROUTES.PROFILE;
  }
  return ROUTES.MARKETPLACE;
};

const TopToolbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const pathname = location.pathname;
  const rootBackTo = (location.state as { rootBackTo?: string } | null)?.rootBackTo;
  const dealRole = (location.state as { dealRole?: "advertiser" | "publisher" } | null)?.dealRole;

  const title = useMemo(() => {
    for (const matcher of titleMatchers) {
      if (matchPath({ path: matcher.path, end: true }, pathname)) {
        return t(matcher.key);
      }
    }
    return t("common.appName");
  }, [pathname, t]);

  const isMainNavRoute = mainNavPaths.includes(pathname);
  const showBack = !isMainNavRoute;
  const fallbackPath = getFallbackPath(pathname);

  const showActionClose = actionCloseMatchers.some((pattern) =>
    matchPath({ path: pattern, end: true }, pathname),
  );

  const handleBack = useCallback(() => {
    if (rootBackTo) {
      navigate(rootBackTo, { replace: true });
      return;
    }
    if (matchPath({ path: `${ROUTES.DEALS}/:dealId`, end: true }, pathname)) {
      if (dealRole === "advertiser") {
        navigate(ROUTES.MARKETPLACE, { replace: true });
        return;
      }
      if (dealRole === "publisher") {
        navigate(ROUTES.CHANNELS, { replace: true });
        return;
      }
    }
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(fallbackPath);
  }, [dealRole, fallbackPath, navigate, pathname, rootBackTo]);

  const handleClose = () => {
    navigate(fallbackPath, { replace: true });
  };

  useEffect(() => {
    const webApp = getTelegramWebApp();
    const backButton = webApp?.BackButton;
    if (!backButton) {
      return;
    }
    if (showBack) {
      backButton.show?.();
      backButton.onClick?.(handleBack);
    } else {
      backButton.hide?.();
    }
    return () => {
      backButton.offClick?.(handleBack);
    };
  }, [handleBack, showBack]);

  return (
    <header
      className="fixed left-0 right-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-glass"
      style={{
        top: "max(var(--tg-safe-top), var(--tg-content-safe-area-inset-top))",
        paddingLeft: "max(var(--tg-safe-left), var(--tg-content-safe-area-inset-left))",
        paddingRight: "max(var(--tg-safe-right), var(--tg-content-safe-area-inset-right))",
      }}
    >
      <div className="mx-auto flex h-[var(--app-toolbar-height)] max-w-2xl items-center gap-3 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {showBack ? (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center justify-center rounded-full p-1 text-foreground transition-colors hover:bg-secondary/50"
              aria-label={t("common.back")}
            >
              <ArrowLeft size={20} />
            </button>
          ) : null}

        </div>
        {showActionClose ? (
          <button
            type="button"
            onClick={handleClose}
            className="inline-flex items-center justify-center rounded-full p-1 text-foreground transition-colors hover:bg-secondary/50"
            aria-label={t("common.close")}
          >
            <X size={18} />
          </button>
        ) : null}
      </div>
    </header>
  );
};

export default TopToolbar;
