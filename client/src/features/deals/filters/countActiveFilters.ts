import type { DealsFilters } from "./filters.types";

export const countActiveFilters = (filters: DealsFilters): number => {
  let count = 0;

  if (filters.role !== "all") {
    count += 1;
  }
  if (filters.stages.length > 0) {
    count += 1;
  }
  if (filters.query.trim()) {
    count += 1;
  }
  if (typeof filters.amountMinTon === "number" || typeof filters.amountMaxTon === "number") {
    count += 1;
  }
  if (filters.datePreset !== "all") {
    count += 1;
  }
  if (filters.expiring24h) {
    count += 1;
  }
  if (filters.hasIssues === true) {
    count += 1;
  }
  if (filters.requiresReview === true) {
    count += 1;
  }

  return count;
};
