import { useEffect, useMemo } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { useListingsByChannel } from "@/features/listings/hooks/useListingsByChannel";
import { toast } from "sonner";
import { ListingPreviewDetails } from "@/components/listings/ListingPreviewDetails";
import LoadingSkeleton from "@/components/feedback/LoadingSkeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { mapChannelListItemToManagedChannel } from "@/features/channels/managedChannels";
import { useChannelDetail } from "@/features/channels/hooks/useChannelDetail";
import { getErrorMessage } from "@/lib/api/errors";
import { nanoToTonString } from "@/lib/ton";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function ListingPreview() {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const outletContext = useOutletContext<ChannelManageContext | null>();
  const channelQuery = useChannelDetail(id);
  const fallbackChannel = channelQuery.data
    ? mapChannelListItemToManagedChannel(channelQuery.data, t("channels.untitled"))
    : null;
  const channel = outletContext?.channel ?? fallbackChannel;
  const listingsFilters = useMemo(
    () => ({
      channelId: id ?? "",
      page: 1,
      limit: 1,
      onlyActive: true,
      sort: "recent" as const,
    }),
    [id]
  );
  const listingsQuery = useListingsByChannel(listingsFilters, { enabled: Boolean(id) });

  useEffect(() => {
    if (listingsQuery.error) {
      toast.error(getErrorMessage(listingsQuery.error, "Unable to load listing"));
    }
  }, [listingsQuery.error]);

  if (!channel) {
    if (channelQuery.isLoading) {
      return (
        <div className="w-full max-w-2xl mx-auto">
          <PageContainer className="py-6">
            <p className="text-muted-foreground">{t("common.loading")}</p>
          </PageContainer>
        </div>
      );
    }
    return (
      <div className="w-full max-w-2xl mx-auto">
        <PageContainer className="py-6">
          <p className="text-muted-foreground">Channel not found</p>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="py-6 space-y-4">
        {listingsQuery.isLoading ? (
          <LoadingSkeleton items={1} />
        ) : listingsQuery.data?.items?.length ? (
          <ListingPreviewDetails
            priceTon={
              Number.parseFloat(nanoToTonString(listingsQuery.data.items[0].priceNano)) ||
              0
            }
            format="POST"
            pinDurationHours={listingsQuery.data.items[0].pinDurationHours}
            visibilityDurationHours={listingsQuery.data.items[0].visibilityDurationHours}
            allowEdits={listingsQuery.data.items[0].allowEdits}
            allowLinkTracking={listingsQuery.data.items[0].allowLinkTracking}
            allowPinnedPlacement={listingsQuery.data.items[0].allowPinnedPlacement}
            tags={listingsQuery.data.items[0].tags}
            requiresApproval={listingsQuery.data.items[0].requiresApproval}
            additionalRequirementsText={listingsQuery.data.items[0].contentRulesText ?? ""}
          />
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4 text-sm text-muted-foreground">
            No listings available to preview yet.
          </div>
        )}

        <div className="rounded-2xl border border-border/60 bg-card/80 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Preview state</p>
          <p className="mt-1">
            This summary card is used across Marketplace and advertiser requests.
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
