export type PaymentsListFilters = {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  direction?: string;
  dealId?: string;
  q?: string;
  from?: string;
  to?: string;
  sort?: "recent" | "amount";
  order?: "asc" | "desc";
};

export type TransactionItem = {
  id: string;
  type: string;
  direction: string;
  status: string;
  amountNano: string;
  currency: string;
  description: string | null;
  dealId: string | null;
  channelId: string | null;
  externalTxHash: string | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
};
