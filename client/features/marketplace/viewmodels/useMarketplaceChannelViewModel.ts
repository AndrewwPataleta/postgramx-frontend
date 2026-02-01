import { useQuery } from "@tanstack/react-query";
import { listChannels } from "@/api/features/channels/channels.api";
import type { ChannelItem } from "@/types/channels";

const marketplaceKeys = {
  channel: (id: string) => ["marketplace", "channels", id] as const,
};

export const useMarketplaceChannelViewModel = (id?: string) => {
  const query = useQuery<ChannelItem>({
    queryKey: id ? marketplaceKeys.channel(id) : marketplaceKeys.channel("unknown"),
    queryFn: async () => {
      if (!id) {
        throw new Error("Missing channel ID");
      }
      const response = await listChannels({
        includeListings: true,
        page: 1,
        limit: 50,
      });
      const channel = response.items.find((item) => item.id === id);
      if (!channel) {
        throw new Error("Channel not found");
      }
      return channel;
    },
    enabled: Boolean(id),
  });

  return {
    state: {
      channel: query.data,
      isLoading: query.isLoading,
      error: query.error,
    },
    computed: {},
    actions: {
      refetch: () => query.refetch(),
    },
  };
};
