import type { CurrencyCode, ListingFormat } from "@/models/enums";

export type ListingCreateInput = {
  channelId: string;
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
};

export type ListingUpdatePatch = Omit<ListingCreateInput, "channelId">;
