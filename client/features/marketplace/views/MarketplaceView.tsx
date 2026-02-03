import { Search, SlidersHorizontal } from "lucide-react";
import MarketplaceChannelCard from "@/components/channels/MarketplaceChannelCard";
import { ActiveFiltersChips } from "@/components/ActiveFiltersChips";
import { FilterModal } from "@/components/FilterModal";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorState from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { useMarketplaceViewModel } from "@/features/marketplace/viewmodels/useMarketplaceViewModel";
import { useLanguage } from "@/i18n/LanguageProvider";

export default function MarketplaceView() {
  const { t } = useLanguage();
  const { state, computed, actions } = useMarketplaceViewModel();
  const errorMessage =
    state.error instanceof Error ? state.error.message : t("marketplace.loadError");

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="pt-4 space-y-6">
        <div className="space-y-3">
          <div className="relative flex items-center gap-2 rounded-2xl border border-border/60 bg-card px-3 py-2">
            <Search size={16} className="text-muted-foreground" />
            <input
              value={state.searchQuery}
              onChange={(event) => actions.setSearchQuery(event.target.value)}
              placeholder={t("marketplace.filters.searchPlaceholder")}
              className="flex-1 bg-transparent pr-20 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
            <button
              type="button"
              onClick={actions.openFilters}
              className="absolute right-2 inline-flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-1 text-xs text-muted-foreground"
            >
              <SlidersHorizontal size={14} />
              {t("marketplace.filters.title")}
            </button>
          </div>
          <ActiveFiltersChips filters={state.filters} onRemoveFilter={actions.removeFilter} />
        </div>

        <div className="space-y-3">
          {state.isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={`marketplace-skeleton-${index}`}
                  className="rounded-2xl border border-border/50 bg-card/80 p-4"
                >
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))
            : computed.channels.map((channel) => (
                <MarketplaceChannelCard key={channel.id} channel={channel} />
              ))}

          {!state.isLoading && state.error && computed.channels.length === 0 ? (
            <ErrorState
              message={errorMessage}
              description={t("marketplace.loadErrorHint")}
              onRetry={actions.refetch}
            />
          ) : null}

          {!state.isLoading && state.error && computed.channels.length > 0 ? (
            <div className="rounded-2xl border border-border/60 bg-red-500/5 p-4 text-sm text-red-200">
              <p className="font-medium">{errorMessage}</p>
              <button
                type="button"
                onClick={actions.refetch}
                className="mt-3 inline-flex items-center rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-100"
              >
                {t("common.retry")}
              </button>
            </div>
          ) : null}

          {!state.isLoading && !state.error && computed.channels.length === 0 ? (
            <div className="rounded-2xl border border-border/60 bg-card/80 p-6 text-center text-sm text-muted-foreground">
              {t("marketplace.empty.subtitle")}
            </div>
          ) : null}

          {!state.isLoading && computed.channels.length > 0 ? (
            <div className="flex justify-center pt-2">
              {computed.hasMore ? (
                <button
                  type="button"
                  onClick={actions.loadMore}
                  disabled={state.isLoadingMore}
                  className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-secondary/50 px-4 py-2 text-xs font-semibold text-foreground disabled:opacity-60"
                >
                  {state.isLoadingMore ? t("common.loadingMore") : t("common.loadMore")}
                </button>
              ) : (
                <span className="text-xs text-muted-foreground">
                  {t("marketplace.noMoreChannels")}
                </span>
              )}
            </div>
          ) : null}
        </div>
      </PageContainer>

      <FilterModal
        isOpen={state.isFilterOpen}
        onClose={actions.closeFilters}
        filters={state.filters}
        onApply={actions.applyFilters}
        onReset={actions.resetFilters}
      />
    </div>
  );
}
