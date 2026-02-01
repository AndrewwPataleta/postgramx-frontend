import { useInfiniteQuery } from "@tanstack/react-query";
import { listMyChannels } from "@/api/features/channelsApi";
import type { ChannelEntity, Paged } from "@/models/entities";

const channelsListKey = (filters: {
  verifiedOnly?: boolean;
  q?: string;
  sort?: string;
  order?: string;
}) => ["channelsList", filters];

export const useChannelsList = (
  filters: {
    verifiedOnly?: boolean;
    q?: string;
    sort?: string;
    order?: string;
  },
  limit = 10
) =>
  useInfiniteQuery<Paged<ChannelEntity>>({
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
