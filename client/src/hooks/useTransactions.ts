import { useInfiniteQuery } from "@tanstack/react-query";
import type { TransactionsListFilters } from "@/api/types/payments";
import { listTransactions } from "@/api/paymentsTransactionsApi";

export const buildTransactionsFiltersHash = (filters: TransactionsListFilters) => {
  const { page, ...rest } = filters;
  return JSON.stringify(
    Object.keys(rest)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = rest[key as keyof typeof rest] ?? null;
        return acc;
      }, {})
  );
};

export function useTransactions(filters: TransactionsListFilters) {
  const filtersHash = buildTransactionsFiltersHash(filters);
  return useInfiniteQuery({
    queryKey: ["transactions", filtersHash],
    queryFn: ({ pageParam }) =>
      listTransactions({ ...filters, page: pageParam }),
    initialPageParam: filters.page ?? 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    keepPreviousData: true,
    staleTime: 15_000,
    refetchInterval: 10_000,
    refetchOnWindowFocus: false,
  });
}
