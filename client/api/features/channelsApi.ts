import { apiPost } from "@/api/core/http";
import type { ChannelEntity, ListingEntity, MarketplaceChannelSummary, Paged } from "@/models/entities";

export type ChannelPreview = {
  normalizedUsername: string;
  title: string;
  username: string;
  telegramChatId?: string | null;
  type: string;
  isPublic: boolean;
  nextStep: string;
  memberCount?: number | null;
  photoUrl?: string | null;
  avatarUrl?: string | null;
  about?: string | null;
};

export const listMyChannels = async (data: {
  verifiedOnly?: boolean;
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: string;
}): Promise<Paged<ChannelEntity>> =>
  apiPost<Paged<ChannelEntity>, typeof data>("/channels/list", data);

export const listMarketplaceChannels = async (data: {
  q?: string;
  tags?: string[];
  minSubscribers?: number;
  maxSubscribers?: number;
  minPriceTon?: number;
  maxPriceTon?: number;
  verifiedOnly?: boolean;
  page?: number;
  limit?: number;
  sort?: "recent" | "price_min" | "subscribers";
  order?: "asc" | "desc";
}): Promise<Paged<MarketplaceChannelSummary>> =>
  apiPost<Paged<MarketplaceChannelSummary>, typeof data>(
    "/marketplace/channels/list",
    data
  );

export const previewChannel = async (data: { usernameOrLink: string }): Promise<ChannelPreview> =>
  apiPost<ChannelPreview, typeof data>("/channels/preview", data);

export const linkChannel = async (data: { username: string }): Promise<ChannelEntity> =>
  apiPost<ChannelEntity, typeof data>("/channels/link", data);

export const verifyChannel = async (data: { id: string }): Promise<ChannelEntity> =>
  apiPost<ChannelEntity, typeof data>("/channels/verify", data);

export const channelDetail = async (data: { id: string }): Promise<ChannelEntity & { listings: ListingEntity[] }> =>
  apiPost<ChannelEntity & { listings: ListingEntity[] }, typeof data>("/channels/detail", data);

export const unlinkChannel = async (data: { channelId: string }): Promise<{ channelId: string; unlinked: boolean }> =>
  apiPost<{ channelId: string; unlinked: boolean }, typeof data>("/channels/unlink", data);

export const updateChannelDisabledStatus = async (data: {
  id: string;
  disabled: boolean;
}): Promise<ChannelEntity> =>
  apiPost<ChannelEntity, { id: string; disabled: boolean }>(
    `/channels/${data.id}/disabled`,
    { id: data.id, disabled: data.disabled }
  );
