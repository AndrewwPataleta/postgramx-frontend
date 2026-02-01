import { CHANNEL_STATUS, type ChannelStatus } from "@/constants/channels";
import type { ChannelListItem } from "@/api/features/channels/channels.types";

export interface ManagedChannel {
  id: string;
  name: string;
  username: string;
  avatar: string;
  status: ChannelStatus;
  verified: boolean;
  subscribers: number;
  activeDeals: number;
  description?: string | null;
}

export const mapChannelListItemToManagedChannel = (
  channel: ChannelListItem,
  untitledLabel: string
): ManagedChannel => ({
  id: channel.id,
  name: channel.title || untitledLabel,
  username: channel.username.startsWith("@") ? channel.username : `@${channel.username}`,
  avatar: "📣",
  status: channel.status,
  verified: channel.status === CHANNEL_STATUS.VERIFIED,
  subscribers: channel.memberCount ?? 0,
  activeDeals: 0,
  description: null,
});
