import { useInfiniteQuery } from "@tanstack/react-query";
import { listTransactions } from "@/api/features/payments/payments.api";
import type { TransactionsListRequestData } from "@/api/features/payments/payments.types";

export const paymentsQueryKeys = {
  transactions: (filters: TransactionsListRequestData) =>
    ["payments", "transactions", filters] as const,
};

export function useTransactions(filters: TransactionsListRequestData) {
  return useInfiniteQuery({
    queryKey: paymentsQueryKeys.transactions(filters),
    queryFn: ({ pageParam }) => listTransactions({ ...filters, page: pageParam }),
    initialPageParam: filters.page ?? 1,
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    keepPreviousData: true,
    staleTime: 15_000,
  });
}
