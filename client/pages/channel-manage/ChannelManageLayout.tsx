import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import {
  getVerifyErrorMessage,
  getVerifyResponseErrorMessage,
  useVerifyChannel,
} from "@/features/channels/hooks/useVerifyChannel";
import { channelDetail } from "@/api/features/channelsApi";
import { PageContainer } from "@/components/layout/PageContainer";
import { formatNumber } from "@/i18n/formatters";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ROUTES } from "@/constants/routes";
import type { ChannelEntity, ListingEntity } from "@/models/entities";
import { ChannelStatus } from "@/models/enums";

export type ChannelManageContext = {
  channel: ChannelEntity & { listings?: ListingEntity[] };
};

const ChannelManageLayout = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { mutateAsync, isPending } = useVerifyChannel();
  const [inlineError, setInlineError] = useState<string | null>(null);
  const fallbackListItem = useMemo(() => {
    const state = location.state as { channel?: ChannelEntity } | null;
    return state?.channel ?? null;
  }, [location.state]);
  const rootBackTo = (location.state as { rootBackTo?: string } | null)?.rootBackTo;
  const fallbackChannel = useMemo(
    () => (fallbackListItem ? fallbackListItem : null),
    [fallbackListItem],
  );
  const [channel, setChannel] = useState<ChannelEntity & { listings?: ListingEntity[] } | null>(
    () => {
      if (!id) {
        return null;
      }
      return fallbackChannel ?? null;
    }
  );

  const detailQuery = useQuery({
    queryKey: ["channelDetail", id],
    queryFn: () => channelDetail({ id: id ?? "" }),
    enabled: Boolean(id) && !fallbackChannel,
    staleTime: 1000 * 60 * 2,
  });
  useEffect(() => {
    if (!id) {
      setChannel(null);
      return;
    }

    const resolvedChannel = fallbackChannel ?? detailQuery.data ?? null;
    setChannel((prev) => {
      if (resolvedChannel) {
        return resolvedChannel;
      }
      if (prev?.id === id) {
        return prev;
      }
      return null;
    });
  }, [detailQuery.data, fallbackChannel, id]);

  const isPendingVerification = channel?.status === ChannelStatus.PendingVerify;
  if (!channel) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <PageContainer className="py-6">
          <p className="text-muted-foreground">{t("channels.notFound")}</p>
        </PageContainer>
      </div>
    );
  }

  const handleRetryVerification = async () => {
    if (!id) {
      return;
    }

    setInlineError(null);
    try {
      const response = await mutateAsync(id);
      if (response.status === ChannelStatus.Verified) {
        const nextChannel = fallbackListItem
          ? { ...fallbackListItem, status: ChannelStatus.Verified }
          : undefined;
        navigate(ROUTES.CHANNEL_MANAGE_LISTINGS(id), {
          replace: true,
          state: nextChannel
            ? { channel: nextChannel, rootBackTo }
            : rootBackTo
              ? { rootBackTo }
              : undefined,
        });
        return;
      }

      const message = getVerifyResponseErrorMessage(
        response,
        t("channels.verifyFailed")
      );
      setInlineError(message);
    } catch (error) {
      const message = getVerifyErrorMessage(
        error,
        t("channels.verifyUnavailable")
      );
      setInlineError(message);
      toast.error(message);
    }
  };

  const basePath = ROUTES.CHANNEL_MANAGE(channel.id);

  const outletContext = {
    channel,
  } satisfies ChannelManageContext;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="pt-6">
        <div className="py-6 bg-gradient-to-b from-card/50 to-transparent">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/40 to-accent/40 flex items-center justify-center text-2xl flex-shrink-0">
            {channel.title.slice(0, 1) || t("channels.avatarFallback")}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-foreground">{channel.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-2">@{channel.username}</p>
            <p className="text-xs text-muted-foreground">
              {formatNumber(channel.subscribersCount ?? channel.memberCount ?? 0, language)} {t("marketplace.subscribers")}
            </p>
          </div>
        </div>
        {isPendingVerification ? (
          <div className="rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-xs text-warning">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-warning">{t("channels.pendingVerificationTitle")}</p>
                <p className="text-warning/80">
                  {t("channels.pendingVerificationSubtitle")}
                </p>
              </div>
              <button
                type="button"
                onClick={handleRetryVerification}
                disabled={isPending}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-warning/80 px-4 py-2 text-xs font-semibold text-warning-foreground transition disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                {t("channels.retryVerification")}
              </button>
            </div>
            {inlineError ? (
              <p className="mt-2 text-[11px] text-warning/80">{inlineError}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="border-b border-border/50 bg-card/80 backdrop-blur-glass">
        <div className="flex gap-6">
          {[
            { id: "listings", label: t("listings.title") },
            { id: "settings", label: t("channels.settingsTitle") },
          ].map((tab) => (
            <NavLink
              key={tab.id}
              to={`${basePath}/${tab.id}`}
              state={
                fallbackListItem || rootBackTo
                  ? { channel: fallbackListItem ?? undefined, rootBackTo }
                  : undefined
              }
              className={({ isActive }) =>
                `py-3 font-medium text-sm border-b-2 transition-colors ${
                  isActive
                    ? "text-primary border-b-primary"
                    : "text-muted-foreground border-b-transparent hover:text-foreground"
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="py-6 space-y-4">
        <Outlet context={outletContext} />
      </div>
      </PageContainer>
    </div>
  );
};

export default ChannelManageLayout;
