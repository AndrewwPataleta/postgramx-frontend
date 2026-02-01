import { apiPost } from "@/api/core/http";
import type { DealDetailResponse, DealEntity, Paged } from "@/models/entities";
import type { DealStage, DealStatus } from "@/models/enums";

type DealListItem = DealEntity | { deal: DealEntity };

type DealsGroupedResponseRaw = {
  pending: Paged<DealListItem>;
  active: Paged<DealListItem>;
  completed: Paged<DealListItem>;
};

export type DealsGroupedResponse = {
  pending: Paged<DealEntity>;
  active: Paged<DealEntity>;
  completed: Paged<DealEntity>;
};

export const createDeal = async (data: {
  listingId: string;
  brief?: string;
  scheduledAt?: string | null;
}): Promise<DealEntity> =>
  apiPost<DealEntity, typeof data>("/deals/create", data);

export const listDeals = async (data: {
  role?: "all" | "advertiser" | "publisher";
  pendingPage?: number;
  pendingLimit?: number;
  activePage?: number;
  activeLimit?: number;
  completedPage?: number;
  completedLimit?: number;
}): Promise<DealsGroupedResponse> =>
  apiPost<DealsGroupedResponseRaw, typeof data>("/deals/list", data).then((response) => ({
    pending: {
      ...response.pending,
      items: response.pending.items.map((item) => ("deal" in item ? item.deal : item)),
    },
    active: {
      ...response.active,
      items: response.active.items.map((item) => ("deal" in item ? item.deal : item)),
    },
    completed: {
      ...response.completed,
      items: response.completed.items.map((item) => ("deal" in item ? item.deal : item)),
    },
  }));

export const getDealDetail = async (data: { id: string }): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, typeof data>("/deals/detail", data);

export const scheduleDeal = async (data: {
  id: string;
  scheduledAt: string;
}): Promise<{ id: string; status: DealStatus; stage: DealStage; scheduledAt: string }> =>
  apiPost<{ id: string; status: DealStatus; stage: DealStage; scheduledAt: string }, typeof data>(
    "/deals/schedule",
    data
  );

export const submitCreative = async (data: { id: string }): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, typeof data>("/deals/creative/submit", data);

export const cancelDeal = async (data: { id: string; reason?: string }): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, typeof data>("/deals/cancel", data);

export const approveCreative = async (data: { id: string }): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, typeof data>("/deals/creative/approve", data);

export const requestCreativeEdits = async (data: { id: string }): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, typeof data>("/deals/creative/edits", data);

export const rejectCreative = async (data: { id: string }): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, typeof data>("/deals/creative/reject", data);
