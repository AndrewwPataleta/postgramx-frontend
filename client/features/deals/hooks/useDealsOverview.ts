import { useQuery } from "@tanstack/react-query";
import type { DealCardData } from "@/components/deals/DealCard";
import type { DealListItem } from "@/api/features/deals/deals.types";
import { listDealsGrouped } from "@/api/features/deals/deals.api";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatDateTime, formatTon } from "@/i18n/formatters";
import { getEscrowStatusLabel } from "@/i18n/labels";
import { DEAL_ESCROW_STATUS } from "@/constants/deals";
import type { DealStatusTone } from "@/components/deals/DealStatusPill";

const resolveTone = (status: string): DealStatusTone => {
  switch (status) {
    case DEAL_ESCROW_STATUS.COMPLETED:
      return "success";
    case DEAL_ESCROW_STATUS.CANCELED:
    case DEAL_ESCROW_STATUS.REFUNDED:
    case DEAL_ESCROW_STATUS.DISPUTED:
      return "danger";
    case DEAL_ESCROW_STATUS.PAYMENT_AWAITING:
    case DEAL_ESCROW_STATUS.FUNDS_PENDING:
      return "warning";
    default:
      return "info";
  }
};

const mapDealCard = (
  deal: DealListItem,
  t: (key: string) => string,
  language: ReturnType<typeof useLanguage>["language"]
): DealCardData => ({
  name: deal.channel.name,
  username: deal.channel.username,
  avatarUrl: deal.channel.avatarUrl ?? "📣",
  price: `${formatTon(deal.listing.priceNano, language)} ${t("common.ton")}`,
  statusLabel: getEscrowStatusLabel(t as never, deal.escrowStatus),
  statusTone: resolveTone(deal.escrowStatus),
  updatedLabel: formatDateTime(deal.lastActivityAt, language),
  ctaLabel: t("common.viewDetails"),
});

export const dealsOverviewQueryKey = ["deals", "overview"] as const;

export const useDealsOverview = () => {
  const { t, language } = useLanguage();

  return useQuery({
    queryKey: dealsOverviewQueryKey,
    queryFn: async () =>
      listDealsGrouped({
        role: "all",
        pendingLimit: 4,
        activeLimit: 4,
        completedLimit: 4,
      }),
    select: (data) => ({
      active: data.active.items.map((deal) => mapDealCard(deal, t, language)),
      pending: data.pending.items.map((deal) => mapDealCard(deal, t, language)),
      completed: data.completed.items.map((deal) => mapDealCard(deal, t, language)),
      quickFilters: [],
      timeline: [],
      timelineVerifying: [],
    }),
  });
};
