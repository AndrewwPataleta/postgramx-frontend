import type { DealsFilters } from "./filters.types";

export const DEFAULT_DEALS_FILTERS: DealsFilters = {
  role: "all",
  stages: [],
  query: "",
  amountMinTon: undefined,
  amountMaxTon: undefined,
  datePreset: "all",
  dateFrom: undefined,
  dateTo: undefined,
  expiring24h: false,
  hasIssues: undefined,
  requiresReview: undefined,
};
