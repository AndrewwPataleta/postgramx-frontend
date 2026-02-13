import type { FilterState } from "@/design-system/components/FilterModal";

export const defaultMarketplaceFilters: FilterState = {
  priceRange: [0, 100],
  subscribersRange: [0, 1_000_000],
  languages: [],
  categories: [],
  tags: [],
  verifiedOnly: false,
  dateRange: ["", ""],
};

export const marketplaceKeys = {
  channels: (
    filters: FilterState & { q?: string },
    page: number,
    limit: number,
    sort: "recent" | "price_min" | "subscribers",
    order: "asc" | "desc"
  ) => ["marketplaceChannels", filters, page, limit, sort, order] as const,
};

export const buildMarketplaceFiltersKey = (
  filters: FilterState,
  query: string
) => ({
  ...filters,
  q: query || undefined,
});

type QueryParams = {
  filters: FilterState;
  query: string;
  page: number;
  limit: number;
  sort: "recent" | "price_min" | "subscribers";
  order: "asc" | "desc";
};

export const buildMarketplaceQueryFilters = ({
  filters,
  query,
  page,
  limit,
  sort,
  order,
}: QueryParams) => {
  const hasDefaultPriceRange =
    filters.priceRange[0] === defaultMarketplaceFilters.priceRange[0] &&
    filters.priceRange[1] === defaultMarketplaceFilters.priceRange[1];
  const hasDefaultSubscriberRange =
    filters.subscribersRange[0] === defaultMarketplaceFilters.subscribersRange[0] &&
    filters.subscribersRange[1] === defaultMarketplaceFilters.subscribersRange[1];

  return {
    q: query || undefined,
    tags: filters.tags.length > 0 ? filters.tags : undefined,
    minSubscribers: hasDefaultSubscriberRange ? undefined : filters.subscribersRange[0],
    maxSubscribers: hasDefaultSubscriberRange ? undefined : filters.subscribersRange[1],
    minPriceTon: hasDefaultPriceRange ? undefined : filters.priceRange[0],
    maxPriceTon: hasDefaultPriceRange ? undefined : filters.priceRange[1],
    ...(filters.verifiedOnly ? { verifiedOnly: true } : {}),
    page,
    limit,
    sort,
    order,
  };
};
