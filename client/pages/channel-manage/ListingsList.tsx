import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useOutletContext, useParams } from "react-router-dom";
import { Edit, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListingCard } from "@/components/listings/ListingCard";
import LoadingSkeleton from "@/components/feedback/LoadingSkeleton";
import { listListingsByChannel } from "@/api/features/listingsApi";
import { getErrorMessage } from "@/lib/api/errors";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ROUTES } from "@/constants/routes";

const ListingsList = () => {
  const { channel } = useOutletContext<ChannelManageContext>();
  const { t } = useLanguage();
  const { id: channelIdParam } = useParams<{ id: string }>();
  const location = useLocation();
  const channelId = channelIdParam ?? channel.id;
  const rootBackTo = (location.state as { rootBackTo?: string } | null)?.rootBackTo;
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [onlyActive, setOnlyActive] = useState(true);
  const [sort, setSort] = useState<"recent" | "price_asc" | "price_desc">("recent");

  const listingsQuery = useQuery({
    queryKey: ["listingsByChannel", channelId, { page, limit, onlyActive, sort }],
    queryFn: () =>
      listListingsByChannel({
        channelId,
        page,
        limit,
        activeOnly: onlyActive,
      }),
  });


  useEffect(() => {
    if (listingsQuery.error) {
      toast.error(getErrorMessage(listingsQuery.error, t("listings.loadError"), t));
    }
  }, [listingsQuery.error, t]);

  const listings = listingsQuery.data?.items ?? [];
  const total = listingsQuery.data?.total ?? 0;
  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / limit)), [total, limit]);
  const hasListings = listings.length > 0;

  return (
    <>
      {listingsQuery.isLoading ? (
        <LoadingSkeleton items={3} />
      ) : hasListings ? (
        <div className="space-y-4">
          <div className="space-y-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                variant="full"
                actionSlot={
                  <Link
                    to={ROUTES.CHANNEL_MANAGE_LISTINGS_EDIT(channelId, listing.id)}
                    state={rootBackTo ? { rootBackTo } : undefined}
                    className="flex-1 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground font-medium py-2 rounded-lg border border-border transition-colors text-sm"
                  >
                    <Edit size={16} />
                    {t("listings.editAction")}
                  </Link>
                }
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {t("common.pageOf", { page, total: totalPages })}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="rounded-lg border border-border/60 px-3 py-1 text-xs disabled:opacity-50"
              >
                {t("common.previous")}
              </button>
              <button
                type="button"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={page >= totalPages}
                className="rounded-lg border border-border/60 px-3 py-1 text-xs disabled:opacity-50"
              >
                {t("common.next")}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-12 h-12 rounded-full bg-secondary/30 flex items-center justify-center mx-auto mb-3">
            <span className="text-xl">{t("listings.emptyIcon")}</span>
          </div>
          <p className="text-foreground font-semibold mb-2">{t("listings.emptyTitle")}</p>
          <p className="text-muted-foreground text-sm mb-6">
            {t("listings.emptySubtitle")}
          </p>
          <Link
            to={ROUTES.CHANNEL_MANAGE_LISTINGS_CREATE(channelId)}
            state={rootBackTo ? { rootBackTo } : undefined}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            {t("listings.createAction")}
          </Link>
        </div>
      )}

      <Link
        to={ROUTES.CHANNEL_MANAGE_LISTINGS_CREATE(channelId)}
        state={rootBackTo ? { rootBackTo } : undefined}
        className="fixed bottom-[calc(var(--tg-content-safe-area-inset-bottom)+120px)] right-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition hover:bg-primary/90"
        aria-label={t("listings.createAction")}
      >
        <Plus size={18} />
      </Link>
    </>
  );
};

export default ListingsList;
