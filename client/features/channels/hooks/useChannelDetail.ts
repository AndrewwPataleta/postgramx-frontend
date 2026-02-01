import { useQuery } from "@tanstack/react-query";
import { listMyChannels } from "@/api/features/channels/channels.api";
import type { ChannelListItem } from "@/api/features/channels/channels.types";

export const channelQueryKeys = {
  detail: (id: string) => ["channels", "detail", id] as const,
};

export const useChannelDetail = (id?: string) =>
  useQuery<ChannelListItem>({
    queryKey: id ? channelQueryKeys.detail(id) : channelQueryKeys.detail("unknown"),
    queryFn: async () => {
      if (!id) {
        throw new Error("Missing channel id");
      }
      const response = await listMyChannels({ page: 1, limit: 50, includeListings: true });
      const channel = response.items.find((item) => item.id === id);
      if (!channel) {
        throw new Error("Channel not found");
      }
      return channel;
    },
    enabled: Boolean(id),
  });
