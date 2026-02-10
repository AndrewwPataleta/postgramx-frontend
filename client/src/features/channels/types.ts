import type { ChannelVerificationStatus } from "@/constants/channels";

export type { ChannelVerificationStatus } from "@/constants/channels";

export interface Channel {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  verificationStatus: ChannelVerificationStatus;
  subscribers: number;
  activeListings: number;
}
