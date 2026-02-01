import type { PaginationResponse } from "@/api/core/types";
import type {
  ChannelListItem,
  ChannelsListRequestData,
  ChannelsListResponse,
  ChannelListPublicItem,
  ChannelListPublicResponse,
  ListChannelsRequestData,
  PreviewChannelRequestData,
  PreviewChannelResponse,
  LinkChannelRequestData,
  LinkChannelResponse,
  VerifyChannelRequestData,
  VerifyChannelResponse,
  UnlinkChannelRequestData,
  UnlinkChannelResponse,
  UpdateChannelDisabledRequestData,
} from "@/api/features/channels/channels.types";

export type { ChannelRole, ChannelStatus } from "@/constants/channels";

export type ChannelsListSort = ChannelsListRequestData["sort"];
export type ChannelsListOrder = ChannelsListRequestData["order"];

export type ChannelsListParams = ChannelsListRequestData;
export type ChannelListItem = ChannelListItem;
export type ChannelsListResponse = ChannelsListResponse;

export type PreviewChannelRequest = { data: PreviewChannelRequestData };
export type LinkChannelRequest = { data: LinkChannelRequestData };
export type VerifyChannelRequest = { data: VerifyChannelRequestData };
export type UnlinkChannelRequest = { data: UnlinkChannelRequestData };

export type PreviewChannelResponse = PreviewChannelResponse;
export type LinkChannelResponse = LinkChannelResponse;
export type VerifyChannelResponse = VerifyChannelResponse;
export type UnlinkChannelResponse = UnlinkChannelResponse;

export type Paginated<T> = PaginationResponse<T>;

export type ListChannelsParams = ListChannelsRequestData;
export type ChannelItem = ChannelListPublicItem;
export type ChannelListResponse = ChannelListPublicResponse;
export type UpdateChannelDisabledRequest = UpdateChannelDisabledRequestData;
