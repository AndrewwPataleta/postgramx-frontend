import { apiPost } from "@/api/core/http";
import type { Paged } from "@/models/entities";
import type { PaymentsListFilters, TransactionItem } from "@/models/payments";

export async function listTransactionsForUser(
  data: PaymentsListFilters
): Promise<Paged<TransactionItem>> {
  return apiPost<Paged<TransactionItem>, PaymentsListFilters>(
    "/payments/transactions/list",
    data
  );
}
