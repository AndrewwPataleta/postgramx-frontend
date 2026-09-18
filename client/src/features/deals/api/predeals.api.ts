import { apiPost } from "@/api/core/http";

export interface PreDealDto {
  id: string;
  status: string;
  listingId: string;
  channelId: string;
  scheduledAt: string;
  paymentWindowSeconds?: number | null;
  paymentExpiresAt?: string | null;
  payment?: {
    escrowAddress?: string | null;
    expectedAmountNano?: string | null;
    status?: string | null;
  };
  botInstructions?: {
    startUrl: string;
    message: string;
  };
  listingSummary?: {
    priceNano: string;
    tags: string[];
    placementHours?: number | null;
    pinDurationHours?: number | null;
    lifetimeHours?: number;
    contentRulesText?: string | null;
  };
}

export const predealsCreate = async (payload: {
  listingId: string;
  scheduledAt: string;
}): Promise<PreDealDto> => {
  return apiPost<PreDealDto, typeof payload>("/predeals/create", payload);
};

export const predealsGet = async (payload: { id: string }): Promise<PreDealDto> => {
  return apiPost<PreDealDto, typeof payload>("/predeals/get", payload);
};

export const predealsCancel = async (payload: { id: string }): Promise<void> => {
  await apiPost<void, typeof payload>("/predeals/cancel", payload);
};
