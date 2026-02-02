import type {
  ChannelStatus,
  CreativeStatus,
  CurrencyCode,
  DealStage,
  DealStatus,
  EscrowStatus,
  ListingFormat,
  PublicationStatus,
} from "@/models/enums";

export type DealListingSnapshot = {
  listingId: string;
  channelId: string;
  format: ListingFormat;
  priceNano: string;
  currency: CurrencyCode;
  tags: string[];
  pinDurationHours: number | null;
  visibilityDurationHours: number;
  allowEdits: boolean;
  allowLinkTracking: boolean;
  allowPinnedPlacement: boolean;
  requiresApproval: boolean;
  contentRulesText: string;
  version: number;
  snapshotAt: string;
};

export type DealEscrowEntity = {
  id: string;
  dealId: string;
  status: EscrowStatus;
  currency: CurrencyCode;
  amountNano: string;
  paidNano: string;
  walletId: string | null;
  paymentAddress: string | null;
  paymentDeadlineAt: string | null;
  confirmedAt: string | null;
  releasedAt: string | null;
  refundedAt: string | null;
  createdAt: string;
  updatedAt: string;
  wallet: EscrowWalletEntity | null;
};

export type EscrowWalletEntity = {
  id: string;
  currency: CurrencyCode;
  address: string;
  createdAt: string;
  updatedAt: string;
};

export type DealCreativeEntity = {
  id: string;
  dealId: string;
  version: number;
  status: CreativeStatus;
  submittedByUserId: string | null;
  botChatId: string | null;
  botMessageId: string | null;
  payload: Record<string, unknown> | null;
  adminComment: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DealPublicationEntity = {
  id: string;
  dealId: string;
  status: PublicationStatus;
  publishedMessageId: string | null;
  publishedAt: string | null;
  mustRemainUntil: string | null;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  error: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListingEntity = {
  id: string;
  channelId: string;
  createdByUserId: string;
  format: ListingFormat;
  priceNano: string;
  currency: CurrencyCode;
  pinDurationHours: number | null;
  visibilityDurationHours: number;
  allowEdits: boolean;
  allowLinkTracking: boolean;
  allowPinnedPlacement: boolean;
  requiresApproval: boolean;
  isActive: boolean;
  contentRulesText: string;
  tags: string[];
  version: number;
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceChannelSummary = {
  id: string;
  name?: string | null;
  title?: string | null;
  username?: string | null;
  about?: string | null;
  avatarUrl?: string | null;
  verified?: boolean;
  subscribers?: number | null;
  placementsCount?: number | null;
  minPriceNano?: string | null;
  currency?: CurrencyCode;
  tags?: string[] | null;
  listings?: ListingEntity[] | null;
  subscribersCount?: number | null;
  memberCount?: number | null;
};

export type ChannelEntity = {
  id: string;
  username: string;
  telegramChatId: string | null;
  title: string;
  status: ChannelStatus;
  createdByUserId: string;
  verifiedAt: string | null;
  lastCheckedAt: string | null;
  memberCount: number | null;
  subscribersCount: number | null;
  avgViews: number | null;
  isDisabled: boolean;
  languageStats: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  listings?: ListingEntity[];
};

export type DealEntity = {
  id: string;
  advertiserUserId: string;
  channelId: string;
  listingId: string | null;
  createdByUserId: string | null;
  status: DealStatus;
  stage: DealStage;
  scheduledAt: string | null;
  lastActivityAt: string;
  idleExpiresAt: string | null;
  cancelReason: string | null;
  listingSnapshot: DealListingSnapshot;
  createdAt: string;
  updatedAt: string;
  listing: ListingEntity | null;
  channel: ChannelEntity;
  escrow: DealEscrowEntity;
  creatives: DealCreativeEntity[];
  publication: DealPublicationEntity;
};



export type User = {
  id: string;
  username?: string;
  email?: string | null;
  telegramId?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  lang: string;
  isPremium: boolean;
  isActive: boolean;
  platformType: string;
  authType?: string;
  fbPushToken?: string;
  lastLoginAt: string;
  createdAt: string;
};

export type DealDetailResponse = DealEntity & {
  channel: ChannelEntity;
  listing: ListingEntity | null;
  escrow: DealEscrowEntity;
  creatives: DealCreativeEntity[];
  publication: DealPublicationEntity;
};

export type Paged<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};
