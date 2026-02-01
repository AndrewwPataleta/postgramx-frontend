import { useInfiniteQuery } from "@tanstack/react-query";
import { listMyChannels } from "@/api/features/channels/channels.api";
import type { ChannelsListParams, ChannelsListResponse } from "@/types/channels";

const channelsListKey = (filters: ChannelsListParams) => [
  "channelsList",
  filters,
];

export const useChannelsList = (filters: ChannelsListParams, limit = 10) =>
  useInfiniteQuery<ChannelsListResponse>({
    queryKey: channelsListKey(filters),
    queryFn: ({ pageParam = 1 }) =>
      listMyChannels({
        ...filters,
        page: Number(pageParam),
        limit,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasNext ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  });
