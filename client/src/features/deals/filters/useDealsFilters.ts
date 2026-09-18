import { useEffect, useMemo, useState } from "react";
import { DEFAULT_DEALS_FILTERS } from "./filters.defaults";
import { loadDealsFilters, saveDealsFilters } from "./filters.storage";
import type { DealsFilters } from "./filters.types";

export const useDealsFilters = () => {
  const [filters, setFilters] = useState<DealsFilters>(() => loadDealsFilters());

  useEffect(() => {
    saveDealsFilters(filters);
  }, [filters]);

  const actions = useMemo(
    () => ({
      setFilters,
      resetFilters: () => setFilters(DEFAULT_DEALS_FILTERS),
    }),
    []
  );

  return {
    filters,
    ...actions,
  };
};
