import { apiPost } from "@/api/core/http";
import type {
  ListChannelPayoutsResponse,
  WithdrawResponse,
} from "@/api/types/payouts";

export const listChannelPayouts = async (
  params: { q?: string } = {}
): Promise<ListChannelPayoutsResponse> => {
  return apiPost<ListChannelPayoutsResponse, { q?: string }>(
    "/payments/payouts/channels",
    params
  );
};

export const withdrawFromChannel = async (params: {
  channelId: string;
  amountNano: string;
  destinationAddress?: string;
}): Promise<WithdrawResponse> => {
  return apiPost<WithdrawResponse, typeof params>("/payments/payouts/withdraw", params);
};

export const paymentsPayoutsApi = {
  listChannelPayouts,
  withdrawFromChannel,
};
