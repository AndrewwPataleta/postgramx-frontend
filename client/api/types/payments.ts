export type {
  TransactionDirection,
  TransactionStatus,
  TransactionType,
} from "@/constants/payments";

export type TransactionsListFilters = {
  page?: number;
  limit?: number;
  type?: TransactionType;
  status?: TransactionStatus;
  direction?: TransactionDirection;
  dealId?: string;
  q?: string;
  from?: string;
  to?: string;
  sort?: "recent" | "amount";
  order?: "asc" | "desc";
};

export type TransactionListItem = {
  id: string;
  type: TransactionType;
  typeLabel?: string | null;
  direction: TransactionDirection;
  directionLabel?: string | null;
  status: TransactionStatus;
  statusLabel?: string | null;
  amountNano: string;
  currency: string;
  description: string | null;
  descriptionLabel?: string | null;
  dealId: string | null;
  channelId: string | null;
  externalTxHash: string | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
};

export type TransactionsListResponse = {
  items: TransactionListItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
