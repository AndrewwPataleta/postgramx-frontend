import type { CurrencyCode, ListingFormat } from "@/models/enums";

export type ListingPriceInput =
  | { priceNano: string; priceTon?: string }
  | { priceTon: string; priceNano?: string };

export type ListingCreateInput = {
  channelId: string;
  format: ListingFormat;
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
} & ListingPriceInput;

export type ListingUpdatePatch = Omit<ListingCreateInput, "channelId">;
