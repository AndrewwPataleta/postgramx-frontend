import { useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { channelDetail } from "@/api/features/channelsApi";
import {
  listChannelModerators,
  setModeratorReviewEnabled,
} from "@/api/features/channelsModeratorsApi";
import { listListingsByChannel } from "@/api/features/listingsApi";
import type { ApiError } from "@/api/core/apiErrors";
import { useAuth } from "@/components/auth/AuthProvider";
import ErrorState from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChannelDetailsSkeleton, {
  ChannelDetailsListingsSkeleton,
  ChannelDetailsModeratorsSkeleton,
} from "@/components/skeletons/ChannelDetailsSkeleton";
import { useCreateDealMutation } from "@/hooks/use-deals";
import { formatNumber, formatTon } from "@/i18n/formatters";
import { getPinnedDurationLabel, getVisibilityDurationLabel } from "@/i18n/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getErrorMessage } from "@/lib/api/errors";
import { toast } from "sonner";
import { filterListingTags } from "@/features/listings/tagOptions";
import type {
  ChannelEntity,
  ChannelModeratorItemDto,
  ChannelModeratorsListResponse,
  ListingEntity,
  Paged,
} from "@/models/entities";

export default function ChannelDetailsView() {
  const { t, language } = useLanguage();
  const { channelId } = useParams<{ channelId: string }>();
  const location = useLocation();
  const state = location.state as { channel?: ChannelEntity } | null;
  const stateChannel = state?.channel ?? null;
  const listingsSectionRef = useRef<HTMLDivElement | null>(null);
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [expandedListingIds, setExpandedListingIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("listings");
  const [pendingModeratorId, setPendingModeratorId] = useState<string | null>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
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
  const moderatorsQuery = useQuery<ChannelModeratorsListResponse>({
    queryKey: ["channelModerators", channelId],
    queryFn: () => listChannelModerators({ channelId: channelId ?? "" }),
    enabled: Boolean(channelId) && activeTab === "moderators",
  });
  const reviewToggleMutation = useMutation({
    mutationFn: setModeratorReviewEnabled,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["channelModerators", channelId] });
      toast.success(t("channelDetails.moderators.updateSuccess"));
    },
    onError: (error: ApiError | Error) => {
      if (error instanceof Error && "statusCode" in error) {
        const statusCode = (error as ApiError).statusCode;
        if (statusCode === 403) {
          toast.error(t("channelDetails.moderators.permissionError"));
          return;
        }
        if (statusCode === 404) {
          toast.error(t("channelDetails.moderators.notFoundError"));
          return;
        }
      }
      toast.error(getErrorMessage(error, t("channelDetails.moderators.updateError"), t));
    },
    onSettled: () => {
      setPendingModeratorId(null);
    },
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
  const currentUserId = (user as { id?: string } | null)?.id ?? null;
  const moderatorsItems = moderatorsQuery.data?.items ?? [];
  const channelOwnerId = moderatorsQuery.data?.channel.ownerUserId ?? null;
  const sortedModerators = useMemo(() => {
    return [...moderatorsItems].sort((a, b) => {
      const aIsOwner = channelOwnerId ? a.userId === channelOwnerId : false;
      const bIsOwner = channelOwnerId ? b.userId === channelOwnerId : false;
      if (aIsOwner && !bIsOwner) {
        return -1;
      }
      if (!aIsOwner && bIsOwner) {
        return 1;
      }
      return a.displayName.localeCompare(b.displayName);
    });
  }, [moderatorsItems, channelOwnerId]);

  const getInitials = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) {
      return name.slice(0, 2).toUpperCase();
    }
    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

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

  const formattedSubscribers =
    typeof resolvedChannel?.subscribersCount === "number"
      ? formatNumber(resolvedChannel.subscribersCount, language)
      : typeof resolvedChannel?.memberCount === "number"
        ? formatNumber(resolvedChannel.memberCount, language)
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
  const showModeratorsSkeleton =
    moderatorsQuery.isLoading && sortedModerators.length === 0;

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

  const handleToggleReview = async (item: ChannelModeratorItemDto, nextValue: boolean) => {
    if (!channelId) {
      return;
    }
    setPendingModeratorId(item.userId);
    try {
      await reviewToggleMutation.mutateAsync({
        channelId,
        userId: item.userId,
        canReviewDeals: nextValue,
      });
    } catch {
      // Handled by mutation callbacks.
    }
  };

  if (isChannelLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <PageContainer className="py-6 space-y-4">
          <ChannelDetailsSkeleton activeTab={activeTab === "moderators" ? "moderators" : "listings"} />
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
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-foreground">
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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="w-full justify-start rounded-2xl bg-card/70 px-2">
                <TabsTrigger value="listings">{t("channelDetails.tabs.listings")}</TabsTrigger>
                <TabsTrigger value="moderators">{t("channelDetails.tabs.moderators")}</TabsTrigger>
              </TabsList>

              <TabsContent value="listings">
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
                    <div className="space-y-3">
                      {formattedListings.map((listing) => {
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
                          <div
                            key={listing.id}
                            className="rounded-xl border border-border/60 bg-card/70 p-3 space-y-2"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1">
                                <p className="text-sm font-semibold price-text">
                                  {listing.priceTon}
                                </p>
                                {metaLabel ? (
                                  <p className="text-[11px] text-muted-foreground">{metaLabel}</p>
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
                        );
                      })}
                    </div>
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

              <TabsContent value="moderators">
                <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-4">
                  <p className="text-xs text-muted-foreground">
                    {t("channelDetails.moderators.description")}
                  </p>

                  {showModeratorsSkeleton ? (
                    <ChannelDetailsModeratorsSkeleton count={4} />
                  ) : moderatorsQuery.isError ? (
                    <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                      {getErrorMessage(
                        moderatorsQuery.error,
                        t("channelDetails.moderators.loadError"),
                        t
                      )}
                    </div>
                  ) : sortedModerators.length > 0 ? (
                    <div className="space-y-3">
                      {sortedModerators.map((item) => {
                        const isOwner = channelOwnerId === item.userId;
                        const isInactive = !item.isActive || item.isManuallyDisabled;
                        const canManage = Boolean(currentUserId && channelOwnerId === currentUserId);
                        const shouldShowSwitch = isOwner || canManage;
                        const isPending = pendingModeratorId === item.userId;
                        const isToggleDisabled =
                          isOwner || isInactive || !canManage || isPending || reviewToggleMutation.isPending;
                        const roleLabel = isOwner
                          ? t("channelDetails.moderators.roleOwner")
                          : t("channelDetails.moderators.roleModerator");
                        const reviewEnabled = isOwner ? true : item.canReviewDeals;
                        return (
                          <div
                            key={item.userId}
                            className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/70 p-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="h-10 w-10">
                                {item.avatar ? (
                                  <AvatarImage src={item.avatar} alt={item.displayName} />
                                ) : null}
                                <AvatarFallback className="bg-secondary/60 text-xs font-semibold text-muted-foreground">
                                  {getInitials(item.displayName)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="text-sm font-semibold text-foreground truncate">
                                    {item.displayName}
                                  </p>
                                  <span className="rounded-full border border-border/60 bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                                    {roleLabel}
                                  </span>
                                  {isInactive ? (
                                    <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
                                      {t("channelDetails.moderators.inactive")}
                                    </span>
                                  ) : null}
                                </div>
                                {item.username ? (
                                  <p className="text-xs text-muted-foreground">@{item.username}</p>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex flex-col items-start gap-2 sm:items-end">
                              <p className="text-[11px] text-muted-foreground">
                                {t("channelDetails.moderators.canReviewDeals")}
                              </p>
                              {shouldShowSwitch ? (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground">
                                    {reviewEnabled ? t("common.on") : t("common.off")}
                                  </span>
                                  <Switch
                                    checked={reviewEnabled}
                                    disabled={isToggleDisabled}
                                    onCheckedChange={(checked) =>
                                      handleToggleReview(item, checked)
                                    }
                                  />
                                </div>
                              ) : (
                                <span className="rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                                  {reviewEnabled ? t("common.on") : t("common.off")}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border/60 bg-card/70 p-6 text-center">
                      <p className="text-sm font-semibold text-foreground">
                        {t("channelDetails.moderators.emptyTitle")}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {t("channelDetails.moderators.emptySubtitle")}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </PageContainer>
    </div>
  );
}
