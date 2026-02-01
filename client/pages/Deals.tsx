import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { Megaphone, ShoppingCart } from "lucide-react";
import DealListCard from "@/components/deals/DealListCard";
import ErrorState from "@/components/feedback/ErrorState";
import LoadingSkeleton from "@/components/feedback/LoadingSkeleton";
import { PageContainer } from "@/components/layout/PageContainer";
import { getErrorMessage } from "@/lib/api/errors";
import { getTelegramWebApp } from "@/lib/telegram";
import { dealsQueryKeys, useDealsListQuery } from "@/features/deals/hooks/useDeals";
import { ROUTES } from "@/constants/routes";
import { USER_ROLE } from "@/constants/roles";
import { DEAL_STATUS_LABELS } from "@/constants/ui";
import type { DealsListGroup, DealListItem } from "@/types/deals";

const DEFAULT_LIMIT = 5;

type DealSectionKey = "pending" | "active" | "completed";

type DealsState = Record<DealSectionKey, DealsListGroup<DealListItem>>;

const emptyGroup = (): DealsListGroup<DealListItem> => ({
  items: [],
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
});

const mergeGroup = (
  previous: DealsListGroup<DealListItem>,
  incoming: DealsListGroup<DealListItem>
): DealsListGroup<DealListItem> => {
  if (incoming.page <= 1) {
    return { ...incoming, items: incoming.items };
  }

  const existingIds = new Set(previous.items.map((item) => item.id));
  const mergedItems = [...previous.items];
  incoming.items.forEach((item) => {
    if (!existingIds.has(item.id)) {
      mergedItems.push(item);
    }
  });

  return { ...incoming, items: mergedItems };
};

const sectionLabels: Record<DealSectionKey, string> = {
  pending: DEAL_STATUS_LABELS.PENDING,
  active: DEAL_STATUS_LABELS.ACTIVE,
  completed: DEAL_STATUS_LABELS.COMPLETED,
};

export default function Deals() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const initialTab = (location.state as { activeTab?: DealSectionKey } | null)
    ?.activeTab;
  const [activeTab, setActiveTab] = useState<DealSectionKey>(initialTab ?? "pending");
  const [pages, setPages] = useState({
    pending: 1,
    active: 1,
    completed: 1,
  });
  const [groups, setGroups] = useState<DealsState>({
    pending: emptyGroup(),
    active: emptyGroup(),
    completed: emptyGroup(),
  });

  const queryParams = useMemo(
    () => ({
      role: "all" as const,
      pendingPage: pages.pending,
      pendingLimit: DEFAULT_LIMIT,
      activePage: pages.active,
      activeLimit: DEFAULT_LIMIT,
      completedPage: pages.completed,
      completedLimit: DEFAULT_LIMIT,
    }),
    [pages]
  );

  const { data, isLoading, isFetching, error, refetch } = useDealsListQuery(queryParams);

  useEffect(() => {
    if (!data) {
      return;
    }

    const allDeals = [...data.pending.items, ...data.active.items, ...data.completed.items];
    allDeals.forEach((deal) => {
      queryClient.setQueryData(dealsQueryKeys.detail(deal.id), deal);
    });

    setGroups((prev) => ({
      pending:
        data.pending.page === prev.pending.page &&
        data.pending.total === prev.pending.total &&
        data.pending.items.length === prev.pending.items.length
          ? prev.pending
          : mergeGroup(prev.pending, data.pending),
      active:
        data.active.page === prev.active.page &&
        data.active.total === prev.active.total &&
        data.active.items.length === prev.active.items.length
          ? prev.active
          : mergeGroup(prev.active, data.active),
      completed:
        data.completed.page === prev.completed.page &&
        data.completed.total === prev.completed.total &&
        data.completed.items.length === prev.completed.items.length
          ? prev.completed
          : mergeGroup(prev.completed, data.completed),
    }));
  }, [data]);

  useEffect(() => {
    if (!initialTab) {
      return;
    }
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    const webApp = getTelegramWebApp();
    if (!webApp?.MainButton?.showProgress || !webApp.MainButton.hideProgress) {
      return;
    }

    if (isFetching) {
      webApp.MainButton.showProgress(true);
    } else {
      webApp.MainButton.hideProgress();
    }
  }, [isFetching]);

  const handleLoadMore = useCallback((section: DealSectionKey) => {
    setPages((prev) => ({
      ...prev,
      [section]: prev[section] + 1,
    }));
  }, []);

  const handleSelectDeal = useCallback(
    (deal: DealListItem) => {
      queryClient.setQueryData(["dealById", deal.id], deal);
      navigate(ROUTES.DEAL_DETAILS(deal.id), { state: { deal, rootBackTo: ROUTES.DEALS } });
    },
    [navigate, queryClient]
  );

  const currentGroup = groups[activeTab];
  const { buyerDeals, sellerDeals } = useMemo(() => {
    const buyer = currentGroup.items.filter(
      (deal) => deal.userRoleInDeal === USER_ROLE.ADVERTISER
    );
    const seller = currentGroup.items.filter(
      (deal) => deal.userRoleInDeal !== USER_ROLE.ADVERTISER
    );
    return { buyerDeals: buyer, sellerDeals: seller };
  }, [currentGroup.items]);
  const hasMore = currentGroup.items.length < currentGroup.total;
  const showEmptyState =
    !isLoading && !error && buyerDeals.length === 0 && sellerDeals.length === 0 && !isFetching;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <PageContainer className="pt-6 space-y-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Deals</h1>
          <div className="mt-4 flex gap-6 border-b border-border/60">
            {(Object.keys(sectionLabels) as DealSectionKey[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {sectionLabels[tab]}
              </button>
            ))}
          </div>
        </div>

        {isLoading && currentGroup.items.length === 0 ? (
          <div className="space-y-6">
            <div className="border-t border-border/60" />
            <div className="space-y-3">

              <LoadingSkeleton items={2} />
            </div>
          </div>
        ) : error ? (
          <ErrorState
            message={getErrorMessage(error, "Unable to load deals")}
            description="Please try again in a moment."
            onRetry={() => refetch()}
          />
        ) : showEmptyState ? (
          <div className="rounded-2xl border border-border/60 bg-card/80 p-8 text-center">
            <h2 className="text-base font-semibold text-foreground">No deals in this section</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Deals in this section will appear here once they are created.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {buyerDeals.length > 0 ? (
              <div className="space-y-3">
                <div className="space-y-3">
                  {buyerDeals.map((deal) => (
                    <DealListCard key={deal.id} deal={deal} onSelect={handleSelectDeal} />
                  ))}
                </div>
              </div>
            ) : null}

            {buyerDeals.length > 0 && sellerDeals.length > 0 ? (
              <div className="border-t border-border/60" />
            ) : null}

            {sellerDeals.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Megaphone size={14} />
                  Selling ads
                  <span className="text-[11px] font-normal">·</span>
                  <span className="text-[11px] font-normal">{sellerDeals.length}</span>
                </div>
                <div className="space-y-3">
                  {sellerDeals.map((deal) => (
                    <DealListCard key={deal.id} deal={deal} onSelect={handleSelectDeal} />
                  ))}
                </div>
              </div>
            ) : null}

            {hasMore ? (
              <button
                type="button"
                onClick={() => handleLoadMore(activeTab)}
                disabled={isFetching}
                className="w-full rounded-lg border border-border/60 bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary/40 disabled:opacity-60"
              >
                {isFetching ? "Loading..." : "Load more"}
              </button>
            ) : null}
          </div>
        )}
      </PageContainer>
    </div>
  );
}
