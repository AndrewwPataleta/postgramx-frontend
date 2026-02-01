import { useEffect } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListingCard } from "@/components/listings/ListingCard";
import LoadingSkeleton from "@/components/feedback/LoadingSkeleton";
import { listListingsByChannel } from "@/api/features/listingsApi";
import { getErrorMessage } from "@/lib/api/errors";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/i18n/LanguageProvider";

const ChannelOverview = () => {
  const { channel } = useOutletContext<ChannelManageContext>();
  const { t } = useLanguage();
  const hasListingsInState = (channel.listings?.length ?? 0) > 0;
  const listingsQuery = useQuery({
    queryKey: [
      "listingsByChannel",
      channel.id,
      { page: 1, limit: 3, onlyActive: true, sort: "recent" },
    ],
    queryFn: () =>
      listListingsByChannel({
        channelId: channel.id,
        page: 1,
        limit: 3,
        activeOnly: true,
      }),
    enabled: !hasListingsInState,
    initialData: hasListingsInState
      ? {
          items: channel.listings ?? [],
          page: 1,
          limit: 3,
          total: channel.listings?.length ?? 0,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        }
      : undefined,
  });

  useEffect(() => {
    if (listingsQuery.error) {
      toast.error(getErrorMessage(listingsQuery.error, t("listings.loadError")));
    }
  }, [listingsQuery.error, t]);

  const listings = listingsQuery.data?.items ?? [];
  const hasListings = listings.length > 0;

  return (
    <>
      {channel.description ? (
        <div className="glass p-4 text-sm text-muted-foreground">
          {channel.description}
        </div>
      ) : null}

      <div className="glass p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground">{t("listings.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("channels.listingsSubtitle")}</p>
          </div>
          <Link
            to={ROUTES.CHANNEL_MANAGE_LISTINGS(channel.id)}
            className="rounded-lg bg-primary/20 px-3 py-1 text-xs font-semibold text-primary"
          >
            {t("listings.viewAll")}
          </Link>
        </div>

        {listingsQuery.isLoading ? (
          <LoadingSkeleton items={2} />
        ) : hasListings ? (
          <>
            <div className="space-y-3">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} variant="compact" />
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-center">
            <p className="text-sm font-semibold text-foreground">{t("listings.emptyTitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("listings.emptySubtitle")}</p>
            <Link
              to={ROUTES.CHANNEL_MANAGE_LISTINGS_CREATE(channel.id)}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              {t("listings.createAction")}
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default ChannelOverview;
