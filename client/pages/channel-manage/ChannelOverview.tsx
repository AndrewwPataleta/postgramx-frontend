import { useEffect, useMemo } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { ListingCard } from "@/components/listings/ListingCard";
import LoadingSkeleton from "@/components/feedback/LoadingSkeleton";
import { useListingsByChannel } from "@/features/listings/hooks/useListingsByChannel";
import { getErrorMessage } from "@/lib/api/errors";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";
import { ROUTES } from "@/constants/routes";

const ChannelOverview = () => {
  const { channel } = useOutletContext<ChannelManageContext>();
  const listingsFilters = useMemo(
    () => ({
      channelId: channel.id,
      page: 1,
      limit: 3,
      onlyActive: true,
      sort: "recent" as const,
    }),
    [channel.id]
  );
  const listingsQuery = useListingsByChannel(listingsFilters);

  useEffect(() => {
    if (listingsQuery.error) {
      toast.error(getErrorMessage(listingsQuery.error, "Unable to load listings"));
    }
  }, [listingsQuery.error]);

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
            <h3 className="font-semibold text-foreground">Listings</h3>
            <p className="text-xs text-muted-foreground">Your active ad offers</p>
          </div>
          <Link
            to={ROUTES.CHANNEL_MANAGE_LISTINGS(channel.id)}
            className="rounded-lg bg-primary/20 px-3 py-1 text-xs font-semibold text-primary"
          >
            View all listings
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
            <p className="text-sm font-semibold text-foreground">No listings yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create your first listing to start receiving offers.
            </p>
            <Link
              to={ROUTES.CHANNEL_MANAGE_LISTINGS_CREATE(channel.id)}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              Create listing
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default ChannelOverview;
