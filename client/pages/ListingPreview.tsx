import { useEffect } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListingPreviewDetails } from "@/components/listings/ListingPreviewDetails";
import LoadingSkeleton from "@/components/feedback/LoadingSkeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { listListingsByChannel } from "@/api/features/listingsApi";
import { getErrorMessage } from "@/lib/api/errors";
import { nanoToTonString } from "@/lib/ton";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function ListingPreview() {
  const { id } = useParams<{ id: string }>();
  const outletContext = useOutletContext<ChannelManageContext | null>();
  const channel = outletContext?.channel ?? null;
  const { t } = useLanguage();
  const listingsQuery = useQuery({
    queryKey: ["listingsByChannel", id, { page: 1, limit: 1, onlyActive: true }],
    queryFn: () =>
      listListingsByChannel({
        channelId: id ?? "",
        page: 1,
        limit: 1,
        activeOnly: true,
      }),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (listingsQuery.error) {
      toast.error(getErrorMessage(listingsQuery.error, t("listings.loadError"), t));
    }
  }, [listingsQuery.error, t]);

  if (!channel) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <PageContainer className="py-6">
          <p className="text-muted-foreground">{t("channels.notFound")}</p>
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
            allowPinnedPlacement={listingsQuery.data.items[0].allowPinnedPlacement}
            tags={listingsQuery.data.items[0].tags}
            requiresApproval={listingsQuery.data.items[0].requiresApproval}
            additionalRequirementsText={listingsQuery.data.items[0].contentRulesText ?? ""}
          />
        ) : (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-4 text-sm text-muted-foreground">
            {t("listings.previewEmpty")}
          </div>
        )}

        <div className="rounded-2xl border border-border/60 bg-card/80 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">{t("listings.previewStateTitle")}</p>
          <p className="mt-1">{t("listings.previewStateSubtitle")}</p>
        </div>
      </PageContainer>
    </div>
  );
}
