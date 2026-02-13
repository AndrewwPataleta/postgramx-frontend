import { apiPost } from "@/api/core/http";
import type { DealDetailResponse, DealEntity, Paged } from "@/models/entities";
import type { DealStage, DealStatus } from "@/models/enums";

type DealListItem = DealEntity | { deal: DealEntity };

type ChannelAvatarPayload = {
  avatarUrl?: string | null;
  photoUrl?: string | null;
  avatar?: string | null;
  photo?: string | null;
  avatar_url?: string | null;
  photo_url?: string | null;
};

type DealAvatarPayload = DealEntity & {
  avatarUrl?: string | null;
  photoUrl?: string | null;
  avatar?: string | null;
  photo?: string | null;
  avatar_url?: string | null;
  photo_url?: string | null;
};

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

const resolveAvatarUrl = (payload?: ChannelAvatarPayload | null): string | null => {
  if (!payload) {
    return null;
  }

  return payload.avatarUrl ?? payload.photoUrl ?? payload.avatar ?? payload.photo ?? payload.avatar_url ?? payload.photo_url ?? null;
};

const normalizeDealChannelAvatar = (deal: DealEntity): DealEntity => {
  const avatarAwareDeal = deal as DealAvatarPayload;
  const channel = deal.channel as ChannelAvatarPayload | undefined;

  if (!channel) {
    return deal;
  }

  const resolvedAvatarUrl = resolveAvatarUrl(channel) ?? resolveAvatarUrl(avatarAwareDeal);

  return {
    ...deal,
    channel: {
      ...deal.channel,
      avatarUrl: resolvedAvatarUrl,
    },
  };
};

const unwrapDealListItem = (item: DealListItem): DealEntity => {
  const deal = "deal" in item ? item.deal : item;
  return normalizeDealChannelAvatar(deal);
};

export const createDeal = async (data: {
  listingId: string;
  brief?: string;
  scheduledAt?: string | null;
}): Promise<DealEntity> =>
  apiPost<DealEntity, typeof data>("/deals/create", data).then(normalizeDealChannelAvatar);

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
      items: response.pending.items.map(unwrapDealListItem),
    },
    active: {
      ...response.active,
      items: response.active.items.map(unwrapDealListItem),
    },
    completed: {
      ...response.completed,
      items: response.completed.items.map(unwrapDealListItem),
    },
  }));

export const getDealDetail = async (data: { id: string }): Promise<DealEntity> =>
  apiPost<DealEntity, typeof data>("/deals/detail", data).then(normalizeDealChannelAvatar);

export const scheduleDeal = async (data: {
  id: string;
  publishAtUtc: string;
  timeZone?: string;
}): Promise<{ id: string; status: DealStatus; stage: DealStage; scheduledAt?: string; publishAtUtc?: string }> =>
  apiPost<
    { id: string; status: DealStatus; stage: DealStage; scheduledAt?: string; publishAtUtc?: string },
    typeof data & { scheduledAt?: string }
  >("/deals/schedule", {
    ...data,
    scheduledAt: data.publishAtUtc,
  });

export const submitCreative = async (data: { id: string }): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, typeof data>("/deals/creative/submit", data).then(normalizeDealChannelAvatar);

export const cancelDeal = async (data: { id: string; reason?: string }): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, typeof data>("/deals/cancel", data).then(normalizeDealChannelAvatar);

export const approveCreative = async (data: { id: string }): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, typeof data>("/deals/creative/approve", data).then(normalizeDealChannelAvatar);

export const requestCreativeEdits = async (data: { id: string }): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, typeof data>("/deals/creative/edits", data).then(normalizeDealChannelAvatar);

export const rejectCreative = async (data: { id: string }): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, typeof data>("/deals/creative/reject", data).then(normalizeDealChannelAvatar);
