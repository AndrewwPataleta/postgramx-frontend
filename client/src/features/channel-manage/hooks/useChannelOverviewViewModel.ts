import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { listListingsByChannel } from "@/api/features/listingsApi";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getErrorMessage } from "@/lib/api/errors";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";

export const useChannelOverviewViewModel = (channel: ChannelManageContext["channel"]) => {
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
      toast.error(getErrorMessage(listingsQuery.error, t("listings.loadError"), t));
    }
  }, [listingsQuery.error, t]);

  const listings = listingsQuery.data?.items ?? [];

  return {
    state: {
      description: channel.description ?? null,
      channelId: channel.id,
      listings,
    },
    actions: {},
    meta: {
      isLoading: listingsQuery.isLoading && listings.length === 0,
      error: listingsQuery.isError
        ? { message: getErrorMessage(listingsQuery.error, t("listings.loadError"), t) }
        : null,
    },
  };
};
