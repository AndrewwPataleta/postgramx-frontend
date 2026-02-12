import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import DealListCard from "@/features/deals/ui/DealListCard";
import ErrorState from "@/design-system/components/ErrorState";
import { PageContainer } from "@/design-system/components/PageContainer";
import DealsPageSkeleton from "@/features/deals/ui/skeletons/DealsPageSkeleton";
import { getErrorMessage } from "@/lib/api/errors";
import { getTelegramWebApp } from "@/lib/telegram";
import { useDealsListQuery } from "@/hooks/use-deals";
import { ROUTES } from "@/constants/routes";
import type { DealEntity, Paged } from "@/models/entities";
import type { DealStage } from "@/models/enums";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import DealsFiltersSheet from "@/components/deals/DealsFiltersSheet";
import { useDealsFilters } from "@/features/deals/filters/useDealsFilters";
import { applyDealsFilters, detectDealsFilterCapabilities } from "@/features/deals/filters/applyDealsFilters";
import { countActiveFilters } from "@/features/deals/filters/countActiveFilters";
import DealsActiveFiltersChips from "@/features/deals/ui/DealsActiveFiltersChips";

const DEFAULT_LIMIT = 5;

type DealSectionKey = "pending" | "active" | "completed";

type DealsState = Record<DealSectionKey, Paged<DealEntity>>;

const emptyGroup = (): Paged<DealEntity> => ({
  items: [],
  page: 1,
  limit: DEFAULT_LIMIT,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
});

const mergeGroup = (
  previous: Paged<DealEntity>,
  incoming: Paged<DealEntity>
): Paged<DealEntity> => {
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

export default function Deals() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useLanguage();
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
  const { filters, setFilters, resetFilters } = useDealsFilters();
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    if (!data) {
      return;
    }

    const allDeals = [...data.pending.items, ...data.active.items, ...data.completed.items];
    allDeals.forEach((deal) => {
      queryClient.setQueryData(["dealById", deal.id], deal);
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
    (deal: DealEntity) => {
      queryClient.setQueryData(["dealById", deal.id], deal);
      navigate(ROUTES.DEAL_DETAILS(deal.id));
    },
    [navigate, queryClient]
  );

  const currentGroup = groups[activeTab];
  const currentUserId = (user as { id?: string } | null)?.id;
  const filteredDeals = useMemo(
    () => applyDealsFilters(currentGroup.items, filters, activeTab, currentUserId),
    [activeTab, currentGroup.items, currentUserId, filters]
  );
  const filterCapabilities = useMemo(
    () => detectDealsFilterCapabilities(currentGroup.items),
    [currentGroup.items]
  );
  const activeFiltersCount = useMemo(() => countActiveFilters(filters), [filters]);

  const removeFilter = useCallback(
    (type: "query" | "amount" | "date" | "expiring24h" | "requiresReview" | "hasIssues") => {
      setFilters((prev) => {
        if (type === "query") {
          return { ...prev, query: "" };
        }
        if (type === "amount") {
          return { ...prev, amountMinTon: undefined, amountMaxTon: undefined };
        }
        if (type === "date") {
          return {
            ...prev,
            datePreset: "all",
            dateFrom: undefined,
            dateTo: undefined,
          };
        }
        if (type === "expiring24h") {
          return { ...prev, expiring24h: false };
        }
        if (type === "requiresReview") {
          return { ...prev, requiresReview: undefined };
        }
        return { ...prev, hasIssues: undefined };
      });
    },
    [setFilters]
  );

  const removeStageFilter = useCallback(
    (stage: DealStage) => {
      setFilters((prev) => ({
        ...prev,
        stages: prev.stages.filter((item) => item !== stage),
      }));
    },
    [setFilters]
  );

  const { buyerDeals, sellerDeals } = useMemo(() => {
    const buyer = filteredDeals.filter(
      (deal) => currentUserId && currentUserId === deal.advertiserUserId
    );
    const seller = filteredDeals.filter(
      (deal) => !currentUserId || currentUserId !== deal.advertiserUserId
    );
    return { buyerDeals: buyer, sellerDeals: seller };
  }, [filteredDeals, currentUserId]);
  const hasMore = activeFiltersCount === 0 && currentGroup.items.length < currentGroup.total;
  const showEmptyState =
    !isLoading && !error && buyerDeals.length === 0 && sellerDeals.length === 0 && !isFetching;
  const emptyStateCopy = {
    pending: {
      title: t("deals.empty.pending.title"),
      subtitle: t("deals.empty.pending.subtitle"),
    },
    active: {
      title: t("deals.empty.active.title"),
      subtitle: t("deals.empty.active.subtitle"),
    },
    completed: {
      title: t("deals.empty.completed.title"),
      subtitle: t("deals.empty.completed.subtitle"),
    },
  } satisfies Record<DealSectionKey, { title: string; subtitle: string }>;

  return (
    <div className="w-full max-w-3xl mx-auto">
      <PageContainer className="pt-6 space-y-4">
        {isLoading && currentGroup.items.length === 0 ? (
          <DealsPageSkeleton />
        ) : (
          <>
            <div>
              <div className="mt-4 flex items-center justify-between gap-2 border-b border-border/60">
                <div className="flex-1 min-w-0 overflow-x-auto">
                  <div className="flex min-w-max gap-6">
                    {(["pending", "active", "completed"] as DealSectionKey[]).map((tab) => (
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
                        {t(`deals.tabs.${tab}`)}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="mb-2 inline-flex shrink-0 items-center gap-2 rounded-lg bg-secondary/60 px-3 py-1 text-xs text-muted-foreground"
                  aria-label={
                    activeFiltersCount > 0
                      ? t("deals.filters.activeCount", { count: activeFiltersCount })
                      : t("deals.filters.button")
                  }
                >
                  <SlidersHorizontal size={14} />
                  {t("deals.filters.title")}
                  {activeFiltersCount > 0 ? (
                    <span className="rounded-full bg-primary px-1.5 py-0 text-[10px] font-semibold leading-4 text-primary-foreground">
                      {activeFiltersCount}
                    </span>
                  ) : null}
                </button>
              </div>
              <DealsActiveFiltersChips
                filters={filters}
                onRemoveQuery={() => removeFilter("query")}
                onRemoveAmount={() => removeFilter("amount")}
                onRemoveDate={() => removeFilter("date")}
                onRemoveExpiring24h={() => removeFilter("expiring24h")}
                onRemoveRequiresReview={() => removeFilter("requiresReview")}
                onRemoveHasIssues={() => removeFilter("hasIssues")}
                onRemoveStage={removeStageFilter}
              />
            </div>

            {error ? (
              <ErrorState
                message={getErrorMessage(error, t("deals.loadError"), t)}
                description={t("deals.loadErrorHint")}
                onRetry={() => refetch()}
              />
            ) : showEmptyState ? (
              <div className="rounded-2xl border border-border/60 bg-card/80 p-8 text-center">
                <h2 className="text-base font-semibold text-foreground">
                  {emptyStateCopy[activeTab].title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {emptyStateCopy[activeTab].subtitle}
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {buyerDeals.length > 0 ? (
                  <div className="space-y-3">
                    {buyerDeals.map((deal) => (
                      <div key={deal.id}>
                        <DealListCard deal={deal} onSelect={handleSelectDeal} />
                      </div>
                    ))}
                  </div>
                ) : null}

                {buyerDeals.length > 0 && sellerDeals.length > 0 ? (
                  <div className="border-t border-border/60" />
                ) : null}

                {sellerDeals.length > 0 ? (
                  <div className="space-y-3">
                    {sellerDeals.map((deal) => (
                      <div key={deal.id}>
                        <DealListCard deal={deal} onSelect={handleSelectDeal} />
                      </div>
                    ))}
                  </div>
                ) : null}

                {hasMore ? (
                  <button
                    type="button"
                    onClick={() => handleLoadMore(activeTab)}
                    disabled={isFetching}
                    className="w-full rounded-lg border border-border/60 bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-secondary/40 disabled:opacity-60"
                  >
                    {isFetching ? t("common.loading") : t("common.loadMore")}
                  </button>
                ) : null}
              </div>
            )}
          </>
        )}

        <DealsFiltersSheet
          open={filtersOpen}
          onOpenChange={setFiltersOpen}
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
          activeTab={activeTab}
          capabilities={filterCapabilities}
        />
      </PageContainer>
    </div>
  );
}
