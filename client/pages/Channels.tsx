import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import MyChannelsChannelCard from "@/components/channels/MyChannelsChannelCard";
import ChannelListingsPreview from "@/features/channels/components/ChannelListingsPreview";
import { useChannelsList } from "@/features/channels/hooks/useChannelsList";
import ErrorState from "@/components/feedback/ErrorState";
import BottomSheet from "@/components/BottomSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { unlinkChannel } from "@/api/features/channelsApi";
import { getErrorMessage } from "@/lib/api/errors";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ROUTES } from "@/constants/routes";
import type {
  ChannelEntity,
  ListingEntity,
} from "@/models/entities";
import { ChannelStatus } from "@/models/enums";

const DEFAULT_SORT = "recent";
const DEFAULT_ORDER = "desc";

const pendingStatuses: ChannelStatus[] = [
  ChannelStatus.Draft,
  ChannelStatus.PendingVerify,
  ChannelStatus.Failed,
  ChannelStatus.Revoked,
];

const ChannelCardSkeleton = () => (
  <div className="rounded-2xl border border-border/50 bg-card/80 p-4">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-5 w-24 rounded-full" />
    </div>
    <div className="mt-4">
      <Skeleton className="h-16 rounded-xl" />
    </div>
  </div>
);

const getListingSummary = (listings?: ListingEntity[]) => {
  if (!listings) {
    return null;
  }
  const activeListings = listings.filter((listing) => listing.isActive !== false);
  const minPriceNano = activeListings.reduce<bigint | null>((currentMin, listing) => {
    try {
      const price = BigInt(listing.priceNano);
      if (currentMin === null || price < currentMin) {
        return price;
      }
      return currentMin;
    } catch {
      return currentMin;
    }
  }, null);
  return {
    placementsCount: activeListings.length,
    minPriceNano: minPriceNano ? minPriceNano.toString() : null,
  };
};

const getAggregatedTags = (listings?: ListingEntity[]) => {
  if (!listings?.length) {
    return [];
  }
  const tags = listings.flatMap((listing) => listing.tags ?? []);
  return Array.from(new Set(tags.map((tag) => tag.trim()).filter(Boolean)));
};

const buildRulesSummary = (
  listings: ListingEntity[] | undefined,
  t: (key: string) => string
) => {
  if (!listings?.length) {
    return null;
  }
  const allowed = new Set<string>();
  const prohibited = new Set<string>();
  listings.forEach((listing) => {
    if (listing.allowEdits) {
      allowed.add(t("listings.allowEdits.allowed"));
    }
    if (listing.allowLinkTracking) {
      allowed.add(t("listings.allowLinkTracking.allowed"));
    }
    if (listing.allowPinnedPlacement) {
      allowed.add(t("listings.allowPinned.allowed"));
    }
    if (listing.requiresApproval) {
      allowed.add(t("listings.requiresApproval"));
    }
    listing.tags.forEach((tag) => prohibited.add(tag));
    listing.contentRulesText
      ?.split(/\n|•|,/)
      .map((rule) => rule.trim())
      .filter(Boolean)
      .forEach((rule) => prohibited.add(rule));
  });

  return {
    allowed: Array.from(allowed),
    prohibited: Array.from(prohibited),
  };
};

export default function Channels() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"pending" | "verified">("verified");
  const [unlinkTarget, setUnlinkTarget] = useState<ChannelEntity | null>(null);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [removedChannelIds, setRemovedChannelIds] = useState<Set<string>>(() => new Set());
  const [expandedChannelIds, setExpandedChannelIds] = useState<Set<string>>(
    () => new Set()
  );
  const [listingSummaries, setListingSummaries] = useState<
    Record<string, { placementsCount: number; minPriceNano: string | null }>
  >({});
  const navigate = useNavigate();
  const filters = useMemo(
    () => ({
      sort: DEFAULT_SORT,
      order: DEFAULT_ORDER,
    }),
    [],
  );

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    error,
  } = useChannelsList(filters, 10);

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data],
  );
  const visibleItems = useMemo(
    () => items.filter((channel) => !removedChannelIds.has(channel.id)),
    [items, removedChannelIds],
  );
  const total = data?.pages?.[0]?.total ?? 0;

  useEffect(() => {
    if (error) {
      toast.error(getErrorMessage(error, t("channels.loadError")));
    }
  }, [error, t]);

  const verifiedChannels = useMemo(
    () => visibleItems.filter((channel) => channel.status === ChannelStatus.Verified),
    [visibleItems],
  );
  const pendingChannels = useMemo(
    () =>
      visibleItems.filter((channel) => pendingStatuses.includes(channel.status)),
    [visibleItems],
  );
  const tabbedChannels = activeTab === "verified" ? verifiedChannels : pendingChannels;
  const emptyCopy =
    activeTab === "pending"
      ? t("channels.emptyPending")
      : t("channels.emptyVerified");

  const handleChannelClick = (channel: (typeof items)[number]) => {
    if (channel.status === ChannelStatus.PendingVerify) {
      navigate(ROUTES.CHANNEL_PENDING(channel.id), {
        state: { channel, rootBackTo: ROUTES.CHANNELS },
      });
      return;
    }

    navigate(ROUTES.CHANNEL_MANAGE_LISTINGS(channel.id), {
      state: { channel, rootBackTo: ROUTES.CHANNELS },
    });
  };

  const handleToggleExpand = useCallback((channelId: string) => {
    setExpandedChannelIds((prev) => {
      const next = new Set(prev);
      if (next.has(channelId)) {
        next.delete(channelId);
      } else {
        next.add(channelId);
      }
      return next;
    });
  }, []);

  const handleUnlinkConfirm = async () => {
    if (!unlinkTarget) {
      return;
    }

    setIsUnlinking(true);

    try {
      const response = await unlinkChannel({ channelId: unlinkTarget.id });
      if (response.unlinked) {
        setRemovedChannelIds((prev) => {
          const next = new Set(prev);
          next.add(response.channelId);
          return next;
        });
        toast.success(t("channels.unlinkSuccess"));
      } else {
        toast.error(t("channels.unlinkError"));
      }
      setUnlinkTarget(null);
    } catch (unlinkError) {
      toast.error(getErrorMessage(unlinkError, t("channels.unlinkError")));
    } finally {
      setIsUnlinking(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col">
      <PageContainer className="pt-4 space-y-6">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <ChannelCardSkeleton key={`channel-skeleton-${index}`} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            message={getErrorMessage(error, t("channels.loadError"))}
            description={t("errors.genericSubtitle")}
            onRetry={() => refetch()}
          />
        ) : visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/70 p-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
              {t("channels.emptyIcon")}
            </div>
            <p className="text-sm font-semibold text-foreground">
              {t("channels.emptyTitle")}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("channels.emptySubtitle")}
            </p>
            <Link
              to={ROUTES.ADD_CHANNEL_STEP("step-1")}
              className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              {t("channels.addAction")}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-t border-border/50">
              <div className="flex gap-6 bg-background/90 backdrop-blur-glass">
                {(["verified", "pending"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? "text-primary border-b-primary"
                        : "text-muted-foreground border-b-transparent"
                    }`}
                  >
                    {tab === "verified" ? t("channels.tabs.verified") : t("channels.tabs.pending")}
                  </button>
                ))}
              </div>
            </div>
            {tabbedChannels.length > 0 ? (
              <div className="space-y-3">
                {tabbedChannels.map((channel) => {
                  const isExpanded = expandedChannelIds.has(channel.id);
                  const canExpand = channel.status === ChannelStatus.Verified;
                  const listingSummary = getListingSummary(channel.listings);
                  const fallbackSummary = listingSummaries[channel.id];
                  const placementsCount =
                    listingSummary?.placementsCount ?? fallbackSummary?.placementsCount ?? null;
                  const minPriceNano =
                    listingSummary?.minPriceNano ?? fallbackSummary?.minPriceNano ?? null;
                  const tags = getAggregatedTags(channel.listings);
                  const rules = buildRulesSummary(channel.listings, t);
                  return (
                    <MyChannelsChannelCard
                      key={channel.id}
                      channel={channel}
                      placementsCount={placementsCount}
                      minPriceNano={minPriceNano}
                      tags={tags}
                      rules={rules}
                      onClick={() => handleChannelClick(channel)}
                      onUnlink={
                        activeTab === "pending"
                          ? () => {
                              setUnlinkTarget(channel);
                            }
                          : undefined
                      }
                      isExpanded={isExpanded}
                      onToggleExpand={
                        canExpand ? () => handleToggleExpand(channel.id) : undefined
                      }
                      expandedContent={
                        canExpand ? (
                          <ChannelListingsPreview
                            channelId={channel.id}
                            isExpanded={isExpanded}
                            onSummaryChange={(summary) => {
                              setListingSummaries((prev) => ({
                                ...prev,
                                [channel.id]: summary,
                              }));
                            }}
                          />
                        ) : null
                      }
                      createListingTo={ROUTES.CHANNEL_MANAGE_LISTINGS_CREATE(channel.id)}
                      createListingState={{ channel, rootBackTo: ROUTES.CHANNELS }}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-border/60 bg-card/70 px-4 py-3 text-xs text-muted-foreground">
                {emptyCopy}
              </p>
            )}
          </div>
        )}

        {visibleItems.length > 0 ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-xs text-muted-foreground">
              {t("channels.showingCount", { visible: visibleItems.length, total })}
            </p>
            {hasNextPage ? (
              <button
                type="button"
                onClick={() => fetchNextPage()}
                disabled={isFetchingNextPage}
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-card"
              >
                {isFetchingNextPage ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : null}
                {isFetchingNextPage ? t("common.loading") : t("common.loadMore")}
              </button>
            ) : null}
          </div>
        ) : null}
      </PageContainer>

      <button
        type="button"
        onClick={() => navigate(ROUTES.ADD_CHANNEL_STEP("step-1"))}
        className="fixed bottom-[calc(var(--tg-content-safe-area-inset-bottom)+120px)] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
        aria-label={t("channels.addAction")}
      >
        <Plus size={18} />
      </button>

      <BottomSheet
        open={Boolean(unlinkTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setUnlinkTarget(null);
          }
        }}
        title={t("channels.unlinkTitle")}
      >
        <p className="text-sm text-muted-foreground">
          {t("channels.unlinkPrompt")}{" "}
          <span className="font-semibold text-foreground">
            @{unlinkTarget?.username}
          </span>
          ?
        </p>
        <div className="mt-4 flex gap-3">
          <button
            type="button"
            onClick={() => setUnlinkTarget(null)}
            className="flex-1 rounded-lg border border-border/60 bg-background px-4 py-2 text-sm font-semibold text-foreground"
            disabled={isUnlinking}
          >
            {t("common.cancel")}
          </button>
          <button
            type="button"
            onClick={handleUnlinkConfirm}
            className="flex-1 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isUnlinking}
          >
            {isUnlinking ? t("channels.unlinking") : t("channels.unlinkAction")}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
