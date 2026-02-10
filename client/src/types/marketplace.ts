export interface ChannelCard {
  id: string;
  name: string;
  username?: string | null;
  avatarUrl?: string | null;
  verified: boolean;
  subscribers?: number;
  description?: string | null;
  priceFromTon?: number;
  placementsCount?: number;
  tags?: string[];
  rules?: string[];
}
