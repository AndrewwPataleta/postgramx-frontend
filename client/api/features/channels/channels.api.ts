import { postJson } from "@/api/core/apiClient";
import { buildAuthBody, requireInitDataToken } from "@/api/core/authEnvelope";
import type {
  ChannelsListRequestData,
  ChannelsListResponse,
  ListChannelsRequestData,
  ChannelListPublicResponse,
  PreviewChannelRequestData,
  PreviewChannelResponse,
  LinkChannelRequestData,
  LinkChannelResponse,
  VerifyChannelRequestData,
  VerifyChannelResponse,
  UnlinkChannelRequestData,
  UnlinkChannelResponse,
  UpdateChannelDisabledRequestData,
} from "./channels.types";

export const listMyChannels = async (
  data: ChannelsListRequestData
): Promise<ChannelsListResponse> => {
  const token = requireInitDataToken();
  return postJson("/channels/list", buildAuthBody(data, token));
};

export const listChannels = async (
  data: ListChannelsRequestData
): Promise<ChannelListPublicResponse> => {
  const token = requireInitDataToken();
  return postJson("/channels/list", buildAuthBody(data, token));
};

export const previewChannel = async (
  data: PreviewChannelRequestData
): Promise<PreviewChannelResponse> => {
  const token = requireInitDataToken();
  return postJson("/channels/preview", buildAuthBody(data, token));
};

export const linkChannel = async (
  data: LinkChannelRequestData
): Promise<LinkChannelResponse> => {
  const token = requireInitDataToken();
  return postJson("/channels/link", buildAuthBody(data, token));
};

export const verifyChannel = async (
  data: VerifyChannelRequestData
): Promise<VerifyChannelResponse> => {
  const token = requireInitDataToken();
  return postJson("/channels/verify", buildAuthBody(data, token));
};

export const unlinkChannel = async (
  data: UnlinkChannelRequestData
): Promise<UnlinkChannelResponse> => {
  const token = requireInitDataToken();
  return postJson("/channels/unlink", buildAuthBody(data, token));
};

export const updateChannelDisabledStatus = async (
  data: UpdateChannelDisabledRequestData
): Promise<void> => {
  const token = requireInitDataToken();
  await postJson(`/channels/${data.id}/disabled`, buildAuthBody({ disabled: data.disabled }, token));
};
