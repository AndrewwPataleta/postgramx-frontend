import type { ChannelRole, ChannelStatus } from "@/constants/channels";
import type { PaginationResponse } from "@/api/core/types";
import type { ListingSummary } from "../listings/listings.types";

export type ChannelsListRequestData = {
  q?: string;
  username?: string;
  status?: ChannelStatus;
  role?: ChannelRole;
  verifiedOnly?: boolean;
  sort?: "recent" | "title" | "subscribers";
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
  includeListings?: boolean;
};

export type ChannelMembership = {
  role: ChannelRole;
  telegramAdminStatus: "creator" | "administrator";
  lastRecheckAt?: string | null;
};

export type ChannelListItem = {
  id: string;
  username: string;
  title: string;
  status: ChannelStatus;
  telegramChatId?: number | null;
  memberCount?: number | null;
  avatarUrl?: string | null;
  listings?: ListingSummary[];
  placementsCount?: number | null;
  listingsCount?: number | null;
  verifiedAt?: string | null;
  lastCheckedAt?: string | null;
  membership: ChannelMembership;
};

export type ChannelsListResponse = PaginationResponse<ChannelListItem>;

export type ListChannelsRequestData = {
  verifiedOnly?: boolean;
  q?: string;
  page?: number;
  limit?: number;
  sort?: "recent" | "subscribers" | "price";
  order?: "asc" | "desc";
  includeListings?: boolean;
};

export type ChannelListPublicItem = {
  id: string;
  name: string;
  username?: string | null;
  avatarUrl: string | null;
  verified: boolean;
  subscribers?: number | null;
  about?: string | null;
  description?: string | null;
  placementsCount?: number | null;
  listingsCount?: number | null;
  listings?: ListingSummary[];
};

export type ChannelListPublicResponse = PaginationResponse<ChannelListPublicItem>;

export type PreviewChannelRequestData = {
  usernameOrLink: string;
};

export type PreviewChannelResponse = {
  normalizedUsername: string;
  title: string;
  username: string;
  telegramChatId?: number | null;
  type: string;
  isPublic: boolean;
  nextStep: string;
  memberCount?: number | null;
  photoUrl?: string | null;
  avatarUrl?: string | null;
  about?: string | null;
};

export type LinkChannelRequestData = {
  username: string;
};

export type LinkChannelResponse = {
  id?: string;
  channelId?: string;
  username?: string;
  status: ChannelStatus | string;
  membership?: ChannelMembership | null;
};

export type VerifyChannelRequestData = {
  id: string;
};

export type VerifyChannelResponse = {
  status: ChannelStatus | string;
  verifiedAt?: string | null;
  error?: { code?: string; message?: string } | string | null;
};

export type UnlinkChannelRequestData = {
  channelId: string;
};

export type UnlinkChannelResponse = {
  channelId: string;
  unlinked: boolean;
};

export type UpdateChannelDisabledRequestData = {
  id: string;
  disabled: boolean;
};
