import { apiPost } from "@/api/core/http";
import type { ChannelModeratorItemDto, ChannelModeratorsListResponse } from "@/models";

export const listChannelModerators = async (data: {
  channelId: string;
}): Promise<ChannelModeratorsListResponse> =>
  apiPost<ChannelModeratorsListResponse, typeof data>("/channels/moderators/list", data);

export const setModeratorReviewEnabled = async (data: {
  channelId: string;
  userId: string;
  canReviewDeals: boolean;
}): Promise<ChannelModeratorItemDto> =>
  apiPost<ChannelModeratorItemDto, typeof data>(
    "/channels/moderators/set-review-enabled",
    data
  );
