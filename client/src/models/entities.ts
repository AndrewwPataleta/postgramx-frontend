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

export type PublishAtDisplay = {
  local?: string | null;
  utc?: string | null;
};

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
  depositAddress: string | null;
  paymentDeadlineAt: string | null;
  paymentDeadlineAtDisplay?: PublishAtDisplay | null;
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
  preview?: {
    listingCount: number;
    subsCount: number | null;
    listingFrom: string | null;
  };
};

export type ChannelEntity = {
  id: string;
  username: string;
  avatarUrl?: string | null;
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
  preview?: {
    listingCount: number;
    subsCount: number | null;
    listingFrom: string | null;
  };
  membership?: {
    role?: string | null;
    telegramAdminStatus?: string | null;
    lastRecheckAt?: string | null;
  } | null;
};

export type ChannelModeratorItemDto = {
  userId: string;
  role: string;
  isActive: boolean;
  isManuallyDisabled: boolean;
  canReviewDeals: boolean;
  telegramAdminStatus?: string | null;
  displayName: string;
  username?: string | null;
  avatar?: string | null;
  lastRecheckAt?: string | null;
};

export type ChannelModeratorsListResponse = {
  channel: {
    id: string;
    username: string;
    title: string;
    ownerUserId: string;
  };
  items: ChannelModeratorItemDto[];
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
  publishAtUtc?: string | null;
  publishAtDisplay?: PublishAtDisplay | null;
  lastActivityAt: string;
  idleExpiresAt: string | null;
  idleExpiresAtDisplay?: PublishAtDisplay | null;
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
  timeZone?: string | null;
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
