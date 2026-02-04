import { apiPost } from "@/api/core/http";
import type { TransactionsListFilters, TransactionsListResponse } from "@/api/types/payments";

export const listTransactions = async (
  data: TransactionsListFilters
): Promise<TransactionsListResponse> => {
  return apiPost<TransactionsListResponse, TransactionsListFilters>(
    "/payments/transactions/list",
    data
  );
};
