import { apiPost } from "@/api/core/http";

export type BalanceOverviewResponse = {
  currency: "TON";
  availableNano: string;
  pendingNano: string;
  lifetimeEarnedNano: string;
  lifetimePaidOutNano: string;
  lastUpdatedAt: string;
};

export type RequestPayoutRequest = {
  amountNano: string;
  currency: "TON";
};

export type RequestPayoutResponse = {
  id: string;
  status: "CREATED" | "PROCESSING";
};

const apiPostWithOptionalFanout = async <TResp, TData>(
  path: string,
  data: TData
): Promise<TResp> => {
  const shouldFanOutRequests = import.meta.env.VITE_API_TRIPLE_PAYMENT_REQUESTS === "true";
  const requestCount = shouldFanOutRequests ? 3 : 1;

  if (requestCount === 1) {
    return apiPost<TResp, TData>(path, data);
  }

  const results = await Promise.allSettled(
    Array.from({ length: requestCount }, () => apiPost<TResp, TData>(path, data))
  );
  const fulfilled = results.find(
    (result): result is PromiseFulfilledResult<TResp> => result.status === "fulfilled"
  );
  if (fulfilled) {
    return fulfilled.value;
  }
  const rejected = results.find(
    (result): result is PromiseRejectedResult => result.status === "rejected"
  );
  throw rejected?.reason ?? new Error("All payment API requests failed.");
};

export const getBalanceOverview = async (): Promise<BalanceOverviewResponse> => {
  return apiPost<BalanceOverviewResponse, Record<string, never>>(
    "/payments/balance/overview",
    {}
  );
};

export const requestPayout = async (
  data: RequestPayoutRequest
): Promise<RequestPayoutResponse> => {
  return apiPostWithOptionalFanout<RequestPayoutResponse, RequestPayoutRequest>(
    "/payments/payouts/request",
    data
  );
};

export const requestPayoutAll = async (): Promise<RequestPayoutResponse> => {
  return apiPostWithOptionalFanout<RequestPayoutResponse, Record<string, never>>(
    "/payments/payouts/request-all",
    {}
  );
};
