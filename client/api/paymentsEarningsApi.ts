import { apiPost } from "@/api/core/http";

export type EarningsByChannelItem = {
  channelId: string;
  channelTitle: string;
  channelUsername: string;
  currency: "TON";
  earnedNano: string;
  pendingNano: string;
  paidOutNano: string;
};

export type EarningsByChannelResponse = {
  items: EarningsByChannelItem[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export type EarningsByChannelRequest = {
  page?: number;
  limit?: number;
};

export const getEarningsByChannel = async (
  data: EarningsByChannelRequest = {}
): Promise<EarningsByChannelResponse> => {
  return apiPost<EarningsByChannelResponse, EarningsByChannelRequest>(
    "/payments/earnings/by-channel",
    data
  );
};
