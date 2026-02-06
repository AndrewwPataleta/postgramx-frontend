import { memo, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2, PencilLine, RefreshCcw } from "lucide-react";
import { listListingsByChannel } from "@/api/features/listingsApi";
import CircleLoader from "@/components/feedback/CircleLoader";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { formatTon } from "@/i18n/formatters";
import { getPinnedDurationLabel, getVisibilityDurationLabel } from "@/i18n/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { filterListingTags, getListingTagLabel } from "@/features/listings/tagOptions";
import { useCreateDealMutation } from "@/hooks/use-deals";
import type { ListingEntity, Paged } from "@/models/entities";
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
  listing: ListingEntity;
  rootBackTo?: string;
  mode: ListingPreviewMode;
  onSelect?: (listingId: string) => void;
  isSelecting?: boolean;
  isSelectionDisabled?: boolean;
}

const ListingPreviewRow = memo(
  ({
    channelId,
    listing,
    rootBackTo,
    mode,
    onSelect,
    isSelecting = false,
    isSelectionDisabled = false,
  }: ListingPreviewRowProps) => {
    const { t, language } = useLanguage();
    const pinLabel = listing.pinDurationHours
      ? getPinnedDurationLabel(t, listing.pinDurationHours)
      : t("listings.meta.notPinned");
    const visibilityLabel = getVisibilityDurationLabel(t, listing.visibilityDurationHours);
    const tags = buildTags(filterListingTags(listing.tags ?? []));
    const isInactive = listing.isActive === false;

    return (
      <div
        className={cn(
          "flex items-center gap-3 py-3",
          mode === "owner" && isInactive && "opacity-60"
        )}
      >
        <div className="flex-1 space-y-1">
          <div className="text-sm font-semibold price-text">
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
        ) : onSelect ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(listing.id);
            }}
            disabled={isSelectionDisabled}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-60"
          >
            {isSelecting ? <Loader2 size={14} className="animate-spin" /> : null}
            {t("common.select")}
          </button>
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
    const createDealMutation = useCreateDealMutation();
    const [activeListingId, setActiveListingId] = useState<string | null>(null);
    const isSubmitting = createDealMutation.isPending;
    const rootBackTo = (location.state as { rootBackTo?: string } | null)?.rootBackTo;
    const query = useQuery<Paged<ListingEntity>>({
      queryKey: ["channelListingsPreview", channelId],
      queryFn: () =>
        listListingsByChannel({
          channelId,
          page: 1,
          limit: PREVIEW_LIMIT,
          activeOnly: true,
        }),
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

    const handleSelectListing = async (listingId: string) => {
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

    return (
      <div className="space-y-3">
        {query.isLoading ? (
          <CircleLoader items={2} className="py-3" />
        ) : query.isError ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-xs text-destructive">
            <p>{getErrorMessage(query.error, t("marketplace.listingsLoadFailed"), t)}</p>
            <button
              type="button"
              onClick={() => query.refetch()}
              className="mt-2 inline-flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-1 text-[11px] font-semibold text-destructive"
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
                onSelect={mode === "viewer" ? handleSelectListing : undefined}
                isSelecting={isSubmitting && activeListingId === listing.id}
                isSelectionDisabled={isSubmitting}
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
