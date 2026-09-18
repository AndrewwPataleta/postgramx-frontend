import { DEFAULT_DEALS_FILTERS } from "./filters.defaults";
import type { DealsFilters } from "./filters.types";

const DEALS_FILTERS_STORAGE_KEY = "deals-filters:v1";

const sanitizeNumber = (value: unknown): number | undefined =>
  typeof value === "number" && Number.isFinite(value) ? value : undefined;

const sanitizeString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

const sanitizeBoolean = (value: unknown): boolean | undefined =>
  typeof value === "boolean" ? value : undefined;

export const loadDealsFilters = (): DealsFilters => {
  if (typeof window === "undefined") {
    return DEFAULT_DEALS_FILTERS;
  }

  try {
    const raw = window.localStorage.getItem(DEALS_FILTERS_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_DEALS_FILTERS;
    }

    const parsed = JSON.parse(raw) as Partial<DealsFilters>;
    return {
      ...DEFAULT_DEALS_FILTERS,
      role:
        parsed.role === "advertiser" || parsed.role === "publisher" || parsed.role === "all"
          ? parsed.role
          : DEFAULT_DEALS_FILTERS.role,
      stages: Array.isArray(parsed.stages)
        ? parsed.stages.filter((stage): stage is DealsFilters["stages"][number] => typeof stage === "string")
        : DEFAULT_DEALS_FILTERS.stages,
      query: typeof parsed.query === "string" ? parsed.query : DEFAULT_DEALS_FILTERS.query,
      amountMinTon: sanitizeNumber(parsed.amountMinTon),
      amountMaxTon: sanitizeNumber(parsed.amountMaxTon),
      datePreset:
        parsed.datePreset === "today" ||
        parsed.datePreset === "7d" ||
        parsed.datePreset === "30d" ||
        parsed.datePreset === "custom" ||
        parsed.datePreset === "all"
          ? parsed.datePreset
          : DEFAULT_DEALS_FILTERS.datePreset,
      dateFrom: sanitizeString(parsed.dateFrom),
      dateTo: sanitizeString(parsed.dateTo),
      expiring24h: parsed.expiring24h === true,
      hasIssues: sanitizeBoolean(parsed.hasIssues),
      requiresReview: sanitizeBoolean(parsed.requiresReview),
    };
  } catch {
    return DEFAULT_DEALS_FILTERS;
  }
};

export const saveDealsFilters = (filters: DealsFilters): void => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(DEALS_FILTERS_STORAGE_KEY, JSON.stringify(filters));
};
