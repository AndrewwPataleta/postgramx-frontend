import type { ChannelModeratorItemDto, ListingEntity } from "@/models/entities";

export type UiError = { message: string };

export interface ChannelOverviewViewState {
  description: string | null;
  listings: ListingEntity[];
}

export interface ChannelModeratorsItemViewState extends ChannelModeratorItemDto {
  roleLabel: string;
  reviewEnabled: boolean;
  initials: string;
  isOwnerItem: boolean;
  isInactive: boolean;
}
