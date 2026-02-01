import { postJson } from "@/api/core/apiClient";
import type {
  MarketplaceChannelDetailRequestData,
  MarketplaceChannelDetailResponse,
  MarketplaceListChannelsRequestData,
  MarketplaceListChannelsResponse,
} from "./marketplace.types";

const buildPublicBody = <T>(data: T) => ({ data });

export const listMarketplaceChannels = async (
  data: MarketplaceListChannelsRequestData
): Promise<MarketplaceListChannelsResponse> =>
  postJson("/marketplace/list", buildPublicBody(data));

export const getMarketplaceChannelDetail = async (
  data: MarketplaceChannelDetailRequestData
): Promise<MarketplaceChannelDetailResponse> =>
  postJson("/marketplace/detail", buildPublicBody(data));
