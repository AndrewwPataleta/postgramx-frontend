import type { CurrencyCode, PaginationResponse } from "@/api/core/types";

export type ListingFormat = "POST";

export type ListingSummary = {
  id: string;
  priceNano: string;
  currency: CurrencyCode;
  format: ListingFormat;
  tags: string[];
  placementHours?: number | null;
  lifetimeHours?: number | null;
  pinDurationHours?: number | null;
  visibilityDurationHours?: number | null;
  availabilityFrom?: string | null;
  availabilityTo?: string | null;
  allowEdits?: boolean;
  allowLinkTracking?: boolean;
  allowPinnedPlacement?: boolean;
  requiresApproval?: boolean;
  contentRulesText?: string | null;
  isActive?: boolean;
};

export type ListingsByChannelRequestData = {
  channelId: string;
  page: number;
  limit: number;
  onlyActive?: boolean;
  sort?: "recent" | "price_asc" | "price_desc";
};

export type ListingsByChannelResponse = PaginationResponse<ListingSummary>;

export type ListingCreateRequestData = {
  channelId: string;
  format: ListingFormat;
  priceTon: number;
  availabilityFrom: string;
  availabilityTo: string;
  pinDurationHours: number | null;
  visibilityDurationHours: number;
  allowEdits: boolean;
  requiresApproval: boolean;
  contentRulesText: string;
  tags: string[];
  isActive: boolean;
  allowLinkTracking: boolean;
  allowPinnedPlacement: boolean;
};

export type ListingUpdateRequestData = ListingCreateRequestData & {
  listingId: string;
};
