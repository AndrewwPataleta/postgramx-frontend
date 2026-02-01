import type { DealEscrowStatus, DealStatus } from "@/constants/deals";
import type { UserRole } from "@/constants/roles";
import type { CurrencyCode } from "@/api/core/types";

export type UserRoleInDeal = UserRole;

export type DealListItem = {
  id: string;
  status: DealStatus;
  escrowStatus: DealEscrowStatus;
  initiatorSide: "ADVERTISER" | "PUBLISHER";
  userRoleInDeal: UserRoleInDeal;
  channel: {
    id: string;
    name: string;
    username: string;
    avatarUrl: string | null;
    verified: boolean;
  };
  listing: {
    id: string;
    priceNano: string;
    currency: CurrencyCode;
    format: string;
    tags: string[];
    placementHours: number;
    lifetimeHours: number;
    pinDurationHours?: number | null;
    visibilityDurationHours?: number | null;
    allowEdits?: boolean;
    allowLinkTracking?: boolean;
    contentRulesText?: string | null;
    requiresApproval?: boolean;
  };
  createdAt: string;
  lastActivityAt: string;
  scheduledAt?: string | null;
  escrowExpiresAt?: string | null;
  creativeText?: string | null;
  postUrl?: string | null;
  postMessageId?: string | null;
  escrowWalletId?: string | null;
  escrowAmountNano?: string | null;
  escrowCurrency?: CurrencyCode | null;
  escrowPaymentAddress?: string | null;
  paymentExpiresAt?: string | null;
  paymentDeadlineAt?: string | null;
  adminReviewDeadlineAt?: string | null;
};

export type DealsListGroup<TItem> = {
  items: TItem[];
  page: number;
  limit: number;
  total: number;
};

export type DealsListResponse = {
  pending: DealsListGroup<DealListItem>;
  active: DealsListGroup<DealListItem>;
  completed: DealsListGroup<DealListItem>;
};

export type DealsListRequestData = {
  role?: "all" | UserRole;
  pendingPage?: number;
  pendingLimit?: number;
  activePage?: number;
  activeLimit?: number;
  completedPage?: number;
  completedLimit?: number;
};

export type CreateDealRequestData = {
  listingId: string;
  brief?: string;
  scheduledAt?: string;
};

export type CreateDealResponse = {
  id: string;
  status: DealStatus;
  escrowStatus: DealEscrowStatus;
  listingId: string;
  channelId: string;
  initiatorSide: "ADVERTISER";
};

export type DealDetailRequestData = {
  dealId: string;
};

export type DealScheduleRequestData = {
  dealId: string;
  scheduledAt: string;
};

export type DealPaymentWindowRequestData = {
  dealId: string;
  hours: number;
};

export type DealCreativeSubmitRequestData = {
  dealId: string;
  creativeText?: string;
};

export type DealCreativeApproveRequestData = {
  dealId: string;
};

export type DealCreativeEditsRequestData = {
  dealId: string;
  note?: string;
};

export type DealCreativeRejectRequestData = {
  dealId: string;
  note?: string;
};

export type DealCancelRequestData = {
  dealId: string;
};

export type PreDealDto = {
  id: string;
  status: string;
  listingId: string;
  channelId: string;
  scheduledAt: string;
  paymentWindowSeconds?: number | null;
  paymentExpiresAt?: string | null;
  payment?: {
    escrowAddress?: string | null;
    expectedAmountNano?: string | null;
    status?: string | null;
  };
  botInstructions?: {
    startUrl: string;
    message: string;
  };
  listingSummary?: {
    priceNano: string;
    tags: string[];
    placementHours?: number | null;
    pinDurationHours?: number | null;
    lifetimeHours?: number;
    contentRulesText?: string | null;
  };
};

export type PreDealCreateRequestData = {
  listingId: string;
  scheduledAt: string;
};

export type PreDealGetRequestData = {
  id: string;
};

export type PreDealCancelRequestData = {
  id: string;
};
