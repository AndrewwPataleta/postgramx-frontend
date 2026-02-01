import type { PaginationResponse } from "@/api/core/types";
import type { ListingSummary } from "../listings/listings.types";

export type MarketplaceChannelItem = {
  id: string;
  name: string;
  username: string | null;
  about: string | null;
  avatarUrl: string | null;
  verified: boolean;
  subscribers: number | null;
  placementsCount: number | null;
  minPriceNano?: string | null;
  currency?: "TON";
  tags: string[];
  listingsPreview?: ListingSummary[] | null;
};

export type MarketplaceListChannelsRequestData = {
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
};

export type MarketplaceListChannelsResponse = PaginationResponse<MarketplaceChannelItem>;

export type MarketplaceChannelDetailRequestData = {
  id: string;
};

export type MarketplaceChannelDetailResponse = MarketplaceChannelItem & {
  listings?: ListingSummary[] | null;
};
