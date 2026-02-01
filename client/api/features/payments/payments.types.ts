import type {
  TransactionDirection,
  TransactionStatus,
  TransactionType,
} from "@/constants/payments";
import type { PaginationRequest, PaginationResponse } from "@/api/core/types";

export type TransactionsListRequestData = PaginationRequest & {
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
  direction: TransactionDirection;
  status: TransactionStatus;
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

export type TransactionsListResponse = PaginationResponse<TransactionListItem>;

export type ChannelPayoutItem = {
  channel: {
    id: string;
    name: string;
    username?: string | null;
    avatarUrl?: string | null;
  };
  availableNano: string;
  currency: "TON";
};

export type ListChannelPayoutsResponse = {
  items: ChannelPayoutItem[];
  totals?: { availableNano: string };
};

export type WithdrawRequestData = {
  channelId: string;
  amountNano: string;
  destinationAddress?: string;
};

export type WithdrawResponse = {
  id: string;
  status: string;
  amountNano: string;
  currency: "TON";
  channelId: string;
};

export type WithdrawableByChannelRequestData = {
  q?: string;
};
