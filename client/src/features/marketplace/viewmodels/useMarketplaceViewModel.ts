import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FilterState } from "@/components/FilterModal";
import { listMarketplaceChannels } from "@/api/features/channelsApi";
import type { MarketplaceChannelSummary, Paged } from "@/models/entities";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  buildMarketplaceFiltersKey,
  buildMarketplaceQueryFilters,
  defaultMarketplaceFilters,
  marketplaceKeys,
} from "@/features/marketplace/viewmodels/marketplaceQuery";

export const useMarketplaceViewModel = () => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>(defaultMarketplaceFilters);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [sort] = useState<"recent" | "price_min" | "subscribers">("recent");
  const [order] = useState<"asc" | "desc">("desc");
  const [channels, setChannels] = useState<MarketplaceChannelSummary[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const handler = window.setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);

    return () => {
      window.clearTimeout(handler);
    };
  }, [searchQuery]);

  const queryFilters = useMemo(
    () =>
      buildMarketplaceQueryFilters({
        filters,
        query: debouncedQuery,
        page,
        limit,
        sort,
        order,
      }),
    [debouncedQuery, filters, limit, order, page, sort]
  );

  const filtersKey = useMemo(
    () => buildMarketplaceFiltersKey(filters, debouncedQuery),
    [debouncedQuery, filters]
  );

  useEffect(() => {
    setPage(1);
    setChannels([]);
    setTotal(0);
  }, [filtersKey, limit, order, sort]);

  const query = useQuery<Paged<MarketplaceChannelSummary>>({
    queryKey: marketplaceKeys.channels(filtersKey, page, limit, sort, order),
    queryFn: () => listMarketplaceChannels(queryFilters),
  });

  useEffect(() => {
    if (!query.data) {
      return;
    }
    setTotal(query.data.total);
    setChannels((prev) => {
      if (page === 1) {
        return query.data.items;
      }
      const next = new Map(prev.map((item) => [item.id, item]));
      query.data.items.forEach((item) => next.set(item.id, item));
      return Array.from(next.values());
    });
  }, [page, query.data]);

  useEffect(() => {
    if (!query.error) {
      return;
    }
    const message =
      query.error instanceof Error ? query.error.message : t("marketplace.loadError");
    toast.error(message);
  }, [query.error, t]);

  const hasMore = channels.length < total;
  const isLoadingInitial = query.isLoading && page === 1 && channels.length === 0;
  const isLoadingMore = query.isFetching && page > 1;

  const filteredChannels = useMemo(() => channels, [channels]);

  const handleLoadMore = () => {
    if (query.isFetching || !hasMore) {
      return;
    }
    setPage((prev) => prev + 1);
  };

  const handleRemoveFilter = (filterType: string, value?: string) => {
    setFilters((prev) => {
      switch (filterType) {
        case "priceRange":
          return { ...prev, priceRange: defaultMarketplaceFilters.priceRange };
        case "subscribersRange":
          return {
            ...prev,
            subscribersRange: defaultMarketplaceFilters.subscribersRange,
          };
        case "verifiedOnly":
          return { ...prev, verifiedOnly: false };
        case "languages":
          return {
            ...prev,
            languages: prev.languages.filter((lang) => lang !== value),
          };
        case "categories":
          return {
            ...prev,
            categories: prev.categories.filter((cat) => cat !== value),
          };
        case "tags":
          return {
            ...prev,
            tags: prev.tags.filter((tag) => tag !== value),
          };
        default:
          return prev;
      }
    });
  };

  const openFilters = () => setIsFilterOpen(true);
  const closeFilters = () => setIsFilterOpen(false);
  const applyFilters = (nextFilters: FilterState) => setFilters(nextFilters);
  const resetFilters = () => setFilters(defaultMarketplaceFilters);

  return {
    state: {
      searchQuery,
      isFilterOpen,
      filters,
      filtersKey,
      isLoading: isLoadingInitial,
      isLoadingMore,
      error: query.error,
      total,
    },
    computed: {
      channels: filteredChannels,
      hasMore,
    },
    actions: {
      setSearchQuery,
      openFilters,
      closeFilters,
      applyFilters,
      resetFilters,
      removeFilter: handleRemoveFilter,
      refetch: () => query.refetch(),
      loadMore: handleLoadMore,
    },
  };
};
