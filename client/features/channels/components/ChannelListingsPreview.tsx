import { memo, useEffect, useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { PencilLine, RefreshCcw } from "lucide-react";
import { useListingsByChannel } from "@/features/listings/hooks/useListingsByChannel";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { formatTon } from "@/i18n/formatters";
import { getPinnedDurationLabel, getVisibilityDurationLabel } from "@/i18n/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getListingTagLabel } from "@/features/listings/tagOptions";
import type { ListingListItem } from "@/types/listings";
import { ROUTES } from "@/constants/routes";

const PREVIEW_LIMIT = 5;
const PREVIEW_COUNT = 3;
const buildTags = (tags: string[]) => {
  const shown = tags.slice(0, 2);
  const remaining = tags.length - shown.length;
  return {
    shown,
    remaining,
  };
};

type ListingPreviewMode = "viewer" | "owner";

interface ListingPreviewRowProps {
  channelId: string;
  listing: ListingListItem;
  rootBackTo?: string;
  mode: ListingPreviewMode;
}

const ListingPreviewRow = memo(
  ({ channelId, listing, rootBackTo, mode }: ListingPreviewRowProps) => {
  const { t, language } = useLanguage();
  const pinLabel = listing.pinDurationHours
    ? getPinnedDurationLabel(t, listing.pinDurationHours)
    : t("listings.meta.notPinned");
  const visibilityLabel = getVisibilityDurationLabel(t, listing.visibilityDurationHours);
  const tags = buildTags(listing.tags ?? []);
  const isInactive = listing.isActive === false;

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3",
        mode === "owner" && isInactive && "opacity-60"
      )}
    >
      <div className="flex-1 space-y-1">
        <div className="text-sm font-semibold text-foreground">
          {formatTon(listing.priceNano, language)} {t("common.ton")}
        </div>
        <div className="text-[11px] text-muted-foreground">
          {pinLabel} • {visibilityLabel}
        </div>
        {tags.shown.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.shown.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {getListingTagLabel(tag, t)}
              </span>
            ))}
            {tags.remaining > 0 ? (
              <span className="rounded-full border border-border/60 bg-muted/30 px-2 py-0.5 text-[10px] text-muted-foreground">
                +{tags.remaining}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

      {mode === "owner" ? (
        <Link
          to={ROUTES.CHANNEL_MANAGE_LISTINGS_EDIT(channelId, listing.id)}
          state={rootBackTo ? { rootBackTo } : undefined}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition hover:text-foreground"
          aria-label={t("listings.editAction")}
        >
          <PencilLine size={14} />
        </Link>
      ) : null}
    </div>
  );
});

ListingPreviewRow.displayName = "ListingPreviewRow";

interface ChannelListingsPreviewProps {
  channelId: string;
  isExpanded: boolean;
  onSummaryChange?: (summary: { placementsCount: number; minPriceNano: string | null }) => void;
  mode?: ListingPreviewMode;
}

const ChannelListingsPreview = memo(
  ({ channelId, isExpanded, onSummaryChange, mode = "owner" }: ChannelListingsPreviewProps) => {
  const location = useLocation();
  const { t } = useLanguage();
  const rootBackTo = (location.state as { rootBackTo?: string } | null)?.rootBackTo;
  const listingsFilters = useMemo(
    () => ({
      channelId,
      page: 1,
      limit: PREVIEW_LIMIT,
      onlyActive: true,
      sort: "recent" as const,
    }),
    [channelId]
  );
  const query = useListingsByChannel(listingsFilters, {
    enabled: isExpanded,
    staleTime: 1000 * 60 * 5,
  });

  const items = query.data?.items ?? [];
  const totalCount = query.data?.total ?? items.length;

  useEffect(() => {
    if (!query.data) {
      return;
    }
    const minPriceNano = items.reduce<bigint | null>((currentMin, listing) => {
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
    onSummaryChange?.({
      placementsCount: totalCount,
      minPriceNano: minPriceNano ? minPriceNano.toString() : null,
    });
  }, [items, onSummaryChange, query.data, totalCount]);

  const previewItems = useMemo(
    () => items.slice(0, PREVIEW_COUNT),
    [items]
  );

  return (
    <div className="space-y-3">


      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`listing-skeleton-${index}`}
              className="rounded-xl border border-border/50 bg-background/60 px-3 py-3"
            >
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-3 w-40" />
              <Skeleton className="mt-2 h-3 w-28" />
            </div>
          ))}
        </div>
      ) : query.isError ? (
        <div className="rounded-xl border border-border/60 bg-red-500/5 px-4 py-3 text-xs text-red-200">
          <p>{getErrorMessage(query.error, t("marketplace.listingsLoadFailed"))}</p>
          <button
            type="button"
            onClick={() => query.refetch()}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1 text-[11px] font-semibold text-red-200"
          >
            <RefreshCcw size={12} />
            {t("common.retry")}
          </button>
        </div>
      ) : previewItems.length > 0 ? (
        <div className="rounded-xl border border-border/60 bg-background/60 px-3 divide-y divide-border/40">
          {previewItems.map((listing) => (
            <ListingPreviewRow
              key={listing.id}
              channelId={channelId}
              listing={listing}
              rootBackTo={rootBackTo}
              mode={mode}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border/60 bg-background/50 px-4 py-4 text-center">
          <p className="text-xs font-semibold text-foreground">
            {t("channels.emptyListingsTitle")}
          </p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {t("channels.emptyListingsSubtitle")}
          </p>
        </div>
      )}
    </div>
  );
});

ChannelListingsPreview.displayName = "ChannelListingsPreview";

export default ChannelListingsPreview;
