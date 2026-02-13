import { useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { channelDetail } from "@/api/features/channelsApi";
import { listListingsByChannel } from "@/api/features/listingsApi";
import ErrorState from "@/design-system/components/ErrorState";
import { PageContainer } from "@/design-system/components/PageContainer";
import ChannelAvatar from "@/components/ChannelAvatar";
import ChannelDetailsSkeleton, {
  ChannelDetailsListingsSkeleton,
} from "@/features/channels/ui/skeletons/ChannelDetailsSkeleton";
import ChannelAnalyticsCard from "@/features/channels/ui/ChannelAnalyticsCard";
import { useCreateDealMutation } from "@/hooks/use-deals";
import { formatNumber, formatTon } from "@/i18n/formatters";
import { getPinnedDurationLabel, getVisibilityDurationLabel } from "@/i18n/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { filterListingTags } from "@/features/listings/tagOptions";
import { AnimatedList, AnimatedListItem } from "@/motion/AnimatedList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/design-system/ui/tabs";
import type {
  ChannelEntity,
  ListingEntity,
  MarketplaceChannelSummary,
  Paged,
} from "@/models/entities";

type ChannelDetailsState = ChannelEntity | MarketplaceChannelSummary;

const getSubscribersValue = (channel: ChannelDetailsState | null): number | null => {
  if (!channel) {
    return null;
  }

  if ("subscribers" in channel && typeof channel.subscribers === "number") {
    return channel.subscribers;
  }

  if (typeof channel.subscribersCount === "number") {
    return channel.subscribersCount;
  }

  if (typeof channel.memberCount === "number") {
    return channel.memberCount;
  }

  if (typeof channel.preview?.subsCount === "number") {
    return channel.preview.subsCount;
  }

  return null;
};

export default function ChannelDetailsView() {
  const { t, language } = useLanguage();
  const { channelId } = useParams<{ channelId: string }>();
  const location = useLocation();
  const state = location.state as {
    channel?: ChannelDetailsState;
  } | null;
  const stateChannel = state?.channel ?? null;
  const listingsSectionRef = useRef<HTMLDivElement | null>(null);
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [expandedListingIds, setExpandedListingIds] = useState<string[]>([]);
  const createDealMutation = useCreateDealMutation();
  const channelQuery = useQuery({
    queryKey: ["channelDetail", channelId],
    queryFn: () => channelDetail({ id: channelId ?? "" }),
    enabled: Boolean(channelId) && !stateChannel,
  });

  const resolvedChannel = stateChannel ?? channelQuery.data ?? null;
  const previewListings = resolvedChannel?.listings?.filter((listing) => listing.isActive !== false) ?? [];
  const shouldFetchListings = Boolean(channelId) && previewListings.length === 0;
  const listingsQuery = useQuery<Paged<ListingEntity>>({
    queryKey: ["listingsByChannel", "details", channelId],
    queryFn: () =>
      listListingsByChannel({
        channelId: channelId ?? "",
        page: 1,
        limit: 10,
        activeOnly: true,
      }),
    enabled: shouldFetchListings,
    staleTime: 1000 * 60 * 5,
  });
  const activeListings =
    previewListings.length > 0
      ? previewListings
      : listingsQuery.data?.items.filter((listing) => listing.isActive !== false) ?? [];
  const minPriceFromListings = activeListings.reduce<bigint | null>(
    (currentMin, listing) => {
      try {
        const price = BigInt(listing.priceNano);
        if (currentMin === null || price < currentMin) {
          return price;
        }
        return currentMin;
      } catch {
        return currentMin;
      }
    },
    null
  );
  const resolvedMinPriceNano = minPriceFromListings ? minPriceFromListings.toString() : null;
  const minPriceTon = resolvedMinPriceNano ? formatTon(resolvedMinPriceNano, language) : null;
  const primaryListing = activeListings[0];
  const isSubmitting = createDealMutation.isPending;
  const username = resolvedChannel?.username ? `@${resolvedChannel.username}` : null;

  const handleCreateDeal = async (listingId: string) => {
    if (isSubmitting) {
      return;
    }
    setActiveListingId(listingId);
    try {
      await createDealMutation.mutateAsync({ listingId });
    } finally {
      setActiveListingId(null);
    }
  };

  const formattedListings = useMemo(
    () =>
      activeListings.map((listing) => ({
        ...listing,
        priceTon: `${formatTon(listing.priceNano, language)} ${t("common.ton")}`,
        tags: Array.from(
          new Set(filterListingTags(listing.tags).map((tag) => tag.trim()).filter(Boolean))
        ),
      })),
    [activeListings, language, t]
  );

  const subscribersValue = getSubscribersValue(resolvedChannel);
  const formattedSubscribers =
    typeof subscribersValue === "number"
      ? formatNumber(subscribersValue, language)
      : t("common.emptyValue");

  const buildTagList = (tags: string[]) => {
    const cleaned = filterListingTags(tags).map((tag) => tag.trim()).filter(Boolean);
    const unique = Array.from(new Set(cleaned));
    return {
      visible: unique.slice(0, 3),
      hiddenCount: Math.max(unique.length - 3, 0),
    };
  };

  const buildListingTagList = (tags: string[]) => {
    const cleaned = filterListingTags(tags).map((tag) => tag.trim()).filter(Boolean);
    const unique = Array.from(new Set(cleaned));
    return {
      visible: unique.slice(0, 2),
      hiddenCount: Math.max(unique.length - 2, 0),
    };
  };

  const channelTags = buildTagList(activeListings.flatMap((listing) => listing.tags ?? []));
  const isChannelLoading = channelQuery.isLoading && !resolvedChannel;
  const showListingsSkeleton =
    listingsQuery.isLoading && shouldFetchListings && formattedListings.length === 0;

  const handlePrimaryCta = () => {
    if (!primaryListing) {
      return;
    }
    if (activeListings.length === 1) {
      void handleCreateDeal(primaryListing.id);
    } else {
      listingsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleListingExpanded = (listingId: string) => {
    setExpandedListingIds((prev) =>
      prev.includes(listingId)
        ? prev.filter((id) => id !== listingId)
        : [...prev, listingId]
    );
  };

  if (isChannelLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <PageContainer className="py-6 space-y-4">
          <ChannelDetailsSkeleton />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="py-6 space-y-4">
        {!resolvedChannel || (channelId && resolvedChannel.id !== channelId) ? (
          <ErrorState
            message={t("marketplace.channelNotFound.title")}
            description={t("marketplace.channelNotFound.subtitle")}
          />
        ) : (
          <>
            <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <ChannelAvatar
                  title={resolvedChannel.title}
                  username={resolvedChannel.username}
                  avatarUrl={resolvedChannel.avatarUrl}
                  className="h-14 w-14 shrink-0"
                />
                <div className="space-y-2 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground break-words">
                      {resolvedChannel.title}
                    </h2>
                  </div>
                  {username ? <p className="text-xs text-muted-foreground">{username}</p> : null}
                  <p className="text-xs text-muted-foreground">
                    {activeListings.length ?? t("common.emptyValue")}{" "}
                    {t("marketplace.placements")} • {formattedSubscribers}{" "}
                    {t("marketplace.subscribers")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("common.from")}{" "}
                    <span className="font-semibold price-text">
                      {minPriceTon ?? t("common.emptyValue")} {t("common.ton")}
                    </span>
                  </p>

                </div>
              </div>
            </div>

            <Tabs defaultValue="listings" className="space-y-3">
              <TabsList className="h-8 w-full rounded-full bg-secondary/60 p-1 text-xs">
                <TabsTrigger
                  value="listings"
                  className="flex-1 rounded-full px-3 py-1 text-xs font-semibold data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
                >
                  {t("channelDetails.tabs.listings")}
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="flex-1 rounded-full px-3 py-1 text-xs font-semibold data-[state=active]:bg-primary/15 data-[state=active]:text-primary"
                >
                  {t("channelDetails.tabs.analytics")}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="listings" className="space-y-3">
                <div
                  ref={listingsSectionRef}
                  className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {t("marketplace.availablePlacements")}
                      </p>
                    </div>
                  </div>

                  {showListingsSkeleton ? (
                    <ChannelDetailsListingsSkeleton count={4} />
                  ) : listingsQuery.isError ? (
                    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                      {t("marketplace.listingsLoadFailed")}
                    </div>
                  ) : formattedListings.length > 0 ? (
                    <AnimatedList itemsCount={formattedListings.length} className="space-y-3">
                      {formattedListings.map((listing, index) => {
                        const isListingSubmitting = isSubmitting && activeListingId === listing.id;
                        const isExpanded = expandedListingIds.includes(listing.id);
                        const tagList = buildListingTagList(listing.tags);
                        const metaParts = [
                          listing.pinDurationHours
                            ? getPinnedDurationLabel(t, listing.pinDurationHours)
                            : null,
                          listing.visibilityDurationHours
                            ? getVisibilityDurationLabel(t, listing.visibilityDurationHours)
                            : null,
                        ].filter(Boolean);
                        const metaLabel = metaParts.join(" • ");
                        return (
                          <AnimatedListItem
                            key={listing.id}
                            index={index}
                            pulseKey={listing.updatedAt}
                          >
                            <div className="rounded-xl border border-border/60 bg-card/70 p-3 space-y-2">
                              <div className="flex items-start justify-between gap-3">
                                <div className="space-y-1">
                                  <p className="text-sm font-semibold price-text">
                                    {listing.priceTon}
                                  </p>
                                  {metaLabel ? (
                                    <p className="text-[11px] text-muted-foreground">
                                      {metaLabel}
                                    </p>
                                  ) : null}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCreateDeal(listing.id)}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
                                  >
                                    {isListingSubmitting ? (
                                      <Loader2 size={14} className="animate-spin" />
                                    ) : null}
                                    {t("common.select")}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => toggleListingExpanded(listing.id)}
                                    aria-expanded={isExpanded}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/70 text-muted-foreground transition hover:text-foreground"
                                  >
                                    <ChevronDown
                                      size={16}
                                      className={`transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                    />
                                  </button>
                                </div>
                              </div>
                              {!isExpanded && tagList.visible.length > 0 ? (
                                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                                  {tagList.visible.map((tag) => (
                                    <span
                                      key={`${listing.id}-${tag}`}
                                      className="rounded-full border border-border/60 bg-card px-2 py-0.5 text-foreground"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {tagList.hiddenCount > 0 ? (
                                    <span className="rounded-full border border-border/60 bg-card px-2 py-0.5">
                                      +{tagList.hiddenCount}
                                    </span>
                                  ) : null}
                                </div>
                              ) : null}
                              {isExpanded ? (
                                <div className="space-y-2 text-[11px] text-muted-foreground">
                                  {filterListingTags(listing.tags).length > 0 ? (
                                    <div className="flex flex-wrap gap-2 text-[11px] text-foreground">
                                      {filterListingTags(listing.tags).map((tag) => (
                                        <span
                                          key={`${listing.id}-expanded-${tag}`}
                                          className="rounded-full border border-border/60 bg-card px-2 py-0.5"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  ) : null}
                                  {listing.contentRulesText ? (
                                    <div>
                                      <p className="text-[11px] font-semibold text-muted-foreground">
                                        {t("listings.rules")}
                                      </p>
                                      <p className="line-clamp-3">{listing.contentRulesText}</p>
                                    </div>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </AnimatedListItem>
                        );
                      })}
                    </AnimatedList>
                  ) : (
                    <div className="rounded-2xl border border-border/60 bg-card/80 p-6 text-center">
                      <p className="text-sm font-semibold text-foreground">
                        {t("marketplace.emptyListingsTitle")}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("marketplace.emptyListingsSubtitle")}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="analytics" className="space-y-3">
                <ChannelAnalyticsCard />
              </TabsContent>
            </Tabs>
          </>
        )}
      </PageContainer>
    </div>
  );
}
