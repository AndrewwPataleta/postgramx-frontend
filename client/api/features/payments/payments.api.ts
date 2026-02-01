import { postJson } from "@/api/core/apiClient";
import { buildAuthBody, requireInitDataToken } from "@/api/core/authEnvelope";
import type {
  TransactionsListRequestData,
  TransactionsListResponse,
  ListChannelPayoutsResponse,
  WithdrawRequestData,
  WithdrawResponse,
  WithdrawableByChannelRequestData,
} from "./payments.types";

const stripUndefined = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;

export const listTransactions = async (
  filters: TransactionsListRequestData
): Promise<TransactionsListResponse> => {
  const token = requireInitDataToken();
  return postJson(
    "/payments/transactions/list",
    buildAuthBody(
      stripUndefined({
        page: filters.page ?? 1,
        limit: Math.min(filters.limit ?? 20, 50),
        type: filters.type,
        status: filters.status,
        direction: filters.direction,
        dealId: filters.dealId,
        q: filters.q,
        from: filters.from,
        to: filters.to,
        sort: filters.sort ?? "recent",
        order: filters.order ?? "desc",
      }),
      token
    )
  );
};

export const listWithdrawableByChannel = async (
  data: WithdrawableByChannelRequestData = {}
): Promise<ListChannelPayoutsResponse> => {
  const token = requireInitDataToken();
  return postJson("/payments/payouts/channels", buildAuthBody(data, token));
};

export const withdrawFromChannel = async (
  data: WithdrawRequestData
): Promise<WithdrawResponse> => {
  const token = requireInitDataToken();
  return postJson("/payments/payouts/withdraw", buildAuthBody(data, token));
};
