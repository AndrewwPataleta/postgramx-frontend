import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useListingsByChannel } from "@/features/listings/hooks/useListingsByChannel";
import { Skeleton } from "@/components/ui/skeleton";
import { openTelegramLink } from "@/lib/telegramLinks";
import { cn } from "@/lib/utils";
import { formatNumber, formatTon } from "@/i18n/formatters";
import { formatDuration, getAllowEditsLabel, getAllowLinkTrackingLabel } from "@/i18n/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getListingTagLabel } from "@/features/listings/tagOptions";
import type { TranslationKey } from "@/i18n/translations";
import type { MarketplaceChannelItem } from "@/api/types/marketplace";
import type { ListingListItem } from "@/types/listings";
import { ROUTES } from "@/constants/routes";

interface ChannelCardProps {
  channel: MarketplaceChannelItem;
}

const PRE_APPROVAL_TAG = "Must be pre-approved";
const MAX_VISIBLE_TAGS = 3;
const MAX_TAG_LENGTH = 24;
const LISTINGS_PREVIEW_LIMIT = 5;

const buildChannelTagList = (tags: string[]) => {
  const normalizedTags = tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0 && tag.length <= MAX_TAG_LENGTH);
  const deduped = Array.from(new Set(normalizedTags));
  return {
    visible: deduped.slice(0, MAX_VISIBLE_TAGS),
    hiddenCount: Math.max(deduped.length - MAX_VISIBLE_TAGS, 0),
  };
};

const buildTagList = (tags: string[]) => {
  const normalizedTags = tags
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0 && tag.length <= MAX_TAG_LENGTH);
  const lockedTags = normalizedTags.filter(
    (tag) => tag.toLowerCase() === PRE_APPROVAL_TAG.toLowerCase()
  );
  const restTags = normalizedTags.filter(
    (tag) => tag.toLowerCase() !== PRE_APPROVAL_TAG.toLowerCase()
  );
  const deduped = Array.from(new Set([...lockedTags, ...restTags]));
  return {
    visible: deduped.slice(0, MAX_VISIBLE_TAGS),
    hiddenCount: Math.max(deduped.length - MAX_VISIBLE_TAGS, 0),
  };
};

const buildAllowedRules = (listing: ListingListItem, t: (key: TranslationKey) => string) => {
  const allowed = [
    ...(listing.allowEdits ? [getAllowEditsLabel(t, true)] : []),
    ...(listing.allowLinkTracking ? [getAllowLinkTrackingLabel(t, true)] : []),
    ...(listing.allowPinnedPlacement || listing.pinDurationHours !== null
      ? [t("listings.allowPinned")]
      : []),
  ];

  if (allowed.length === 0) {
    return [t("listings.standardPlacement")];
  }

  return allowed;
};

const buildRestrictedRules = (listing: ListingListItem, t: (key: TranslationKey) => string) => {
  return [
    ...(listing.requiresApproval ? [t("listings.preApprovalRequired")] : []),
    `${t("listings.pinnedLabel")}: ${
      listing.pinDurationHours ? formatDuration(listing.pinDurationHours, t) : t("common.none")
    }`,
    `${t("listings.visibleLabel")}: ${formatDuration(listing.visibilityDurationHours, t)}`,
  ];
};

export default function ChannelCard({ channel }: ChannelCardProps) {
  const { t, language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const navigate = useNavigate();
  const trimmedUsername = channel.username?.replace(/^@/, "");
  const telegramLink = trimmedUsername ? `https://t.me/${trimmedUsername}` : null;
  const listingsFilters = useMemo(
    () => ({
      channelId: channel.id,
      page: 1,
      limit: LISTINGS_PREVIEW_LIMIT,
      onlyActive: true,
      sort: "price_asc" as const,
    }),
    [channel.id]
  );
  const listingsQuery = useListingsByChannel(listingsFilters, {
    enabled: isExpanded,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
  });

  const listings = listingsQuery.data?.items ?? [];
  const minPriceTon = useMemo(
    () => formatTon(channel.minPriceNano, language),
    [channel.minPriceNano, language]
  );
  const formattedSubscribers =
    typeof channel.subscribers === "number"
      ? `${formatNumber(channel.subscribers, language)} ${t("marketplace.subscribers")}`
      : `${t("common.emptyValue")} ${t("marketplace.subscribers")}`;
  const fallbackAvatar = channel.name?.[0]?.toUpperCase() ?? channel.username?.[0]?.toUpperCase();
  const username = channel.username ? `@${channel.username}` : null;
  const avatarSrc = !avatarError && channel.avatarUrl ? channel.avatarUrl : null;
  const channelTags = buildChannelTagList(channel.tags ?? []);

  return (
    <div
      className="rounded-2xl border border-border/50 bg-card/80 p-4 transition-colors hover:border-primary/40 cursor-pointer"
      role="button"
      tabIndex={0}
      onClick={() =>
        navigate(ROUTES.CHANNEL_DETAILS(channel.id), {
          state: { channel, rootBackTo: ROUTES.MARKETPLACE },
        })
      }
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          navigate(ROUTES.CHANNEL_DETAILS(channel.id), {
            state: { channel, rootBackTo: ROUTES.MARKETPLACE },
          });
        }
      }}
    >
      <div className="flex items-start gap-3">
        {avatarSrc ? (
          <img
            src={avatarSrc}
            alt={channel.name}
            className="h-12 w-12 rounded-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 via-secondary/50 to-secondary text-lg text-foreground">
            {fallbackAvatar ?? t("common.avatarFallback")}
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">{channel.name}</h3>
              </div>
              {username ? <span className="text-xs text-muted-foreground">{username}</span> : null}
            </div>
            <div className="flex items-center gap-2">
              {telegramLink ? (
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    openTelegramLink(telegramLink);
                  }}
                  className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-1 text-[11px] font-semibold text-primary transition hover:text-primary/90"
                >
                  {t("marketplace.openChannel")}
                </button>
              ) : null}
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setIsExpanded((prev) => !prev);
                }}
                aria-expanded={isExpanded}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-secondary/40 text-muted-foreground transition hover:text-foreground"
              >
                <ChevronDown
                  size={16}
                  className={cn("transition-transform duration-200", isExpanded && "rotate-180")}
                />
              </button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
              {channel.placementsCount} {t("marketplace.placements")}
            </span>
            <span>·</span>
            <span>{formattedSubscribers}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>
              {t("common.from")}{" "}
              <span className="font-semibold text-primary">
                {minPriceTon} {t("common.ton")}
              </span>
            </span>
          </div>
          {channelTags.visible.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
              {channelTags.visible.map((tag) => (
                <span
                  key={`${channel.id}-${tag}`}
                  className="rounded-full border border-border/60 bg-card px-2.5 py-1 text-foreground"
                >
                  {tag}
                </span>
              ))}
              {channelTags.hiddenCount > 0 ? (
                <span className="rounded-full border border-border/60 bg-card px-2.5 py-1 text-muted-foreground">
                  +{channelTags.hiddenCount}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-300",
          isExpanded ? "mt-4 max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="rounded-2xl border border-border/60 bg-background/60 p-3">
          {listingsQuery.isLoading ? (
            <div className="mt-3 space-y-3">
              {Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`listing-skeleton-${channel.id}-${index}`}
                  className="rounded-xl border border-border/50 bg-card/80 p-3"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-2 h-3 w-40" />
                  <Skeleton className="mt-2 h-3 w-28" />
                </div>
              ))}
            </div>
          ) : listingsQuery.isError ? (
            <div className="mt-3 rounded-xl border border-border/60 bg-red-500/5 p-3 text-xs text-red-200">
              {t("marketplace.listingsLoadFailed")}
            </div>
          ) : listings.length > 0 ? (
            <div className="mt-3 space-y-3">
              {listings.map((listing) => {
                const tags = buildTagList(listing.tags ?? []);
                const allowedRules = buildAllowedRules(listing, t);
                const restrictedRules = buildRestrictedRules(listing, t);
                const requirementsText = listing.contentRulesText?.trim();
                return (
                  <div
                    key={listing.id}
                    className="rounded-xl border border-border/60 bg-card/80 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {formatTon(listing.priceNano, language)} {t("common.ton")}
                      </span>
                    </div>

                    {tags.visible.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-foreground">
                        {tags.visible.map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              "rounded-full border px-2.5 py-1",
                              tag.toLowerCase() === PRE_APPROVAL_TAG.toLowerCase()
                                ? "border-primary/40 bg-primary/10 text-primary"
                                : "border-border/60 bg-card text-foreground"
                            )}
                          >
                            {getListingTagLabel(tag, t)}
                          </span>
                        ))}
                        {tags.hiddenCount > 0 ? (
                          <span className="rounded-full border border-border/60 bg-card px-2.5 py-1 text-muted-foreground">
                            +{tags.hiddenCount}
                          </span>
                        ) : null}
                      </div>
                    ) : null}

                    <div className="mt-3 grid gap-3 text-[11px] text-muted-foreground sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground/80">
                          {t("listings.allowedLabel")}
                        </p>
                        <div className="mt-1 space-y-1">
                          {allowedRules.map((rule) => (
                            <p key={rule}>{rule}</p>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground/80">
                          {t("listings.requiresLabel")}
                        </p>
                        <div className="mt-1 space-y-1">
                          {restrictedRules.map((rule) => (
                            <p key={rule}>{rule}</p>
                          ))}
                          {requirementsText ? (
                            <div className="pt-1">
                              <p className="text-[10px] font-semibold text-muted-foreground/70">
                                {t("listings.requirementsLabel")}
                              </p>
                              <p className="truncate text-[11px] text-muted-foreground">
                                {requirementsText}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-3 rounded-xl border border-dashed border-border/60 bg-card/60 p-4 text-center text-xs text-muted-foreground">
              {t("marketplace.emptyPlacements")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
