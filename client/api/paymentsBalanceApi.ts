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

export const getBalanceOverview = async (): Promise<BalanceOverviewResponse> => {
  return apiPost<BalanceOverviewResponse, Record<string, never>>(
    "/payments/balance/overview",
    {}
  );
};

export const requestPayout = async (
  data: RequestPayoutRequest
): Promise<RequestPayoutResponse> => {
  return apiPost<RequestPayoutResponse, RequestPayoutRequest>(
    "/payments/payouts/request",
    data
  );
};

export const requestPayoutAll = async (): Promise<RequestPayoutResponse> => {
  return apiPost<RequestPayoutResponse, Record<string, never>>(
    "/payments/payouts/request-all",
    {}
  );
};
