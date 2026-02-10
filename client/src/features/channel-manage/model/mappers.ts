import type { ChannelModeratorItemDto } from "@/models/entities";
import type { ChannelModeratorsItemViewState } from "./types";

export const getInitials = (name: string) => {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) {
    return name.slice(0, 2).toUpperCase();
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export const toModeratorView = (
  item: ChannelModeratorItemDto,
  channelOwnerId: string | null,
  t: (key: any) => string,
): ChannelModeratorsItemViewState => {
  const isOwnerItem = channelOwnerId === item.userId;
  return {
    ...item,
    isOwnerItem,
    isInactive: !item.isActive || item.isManuallyDisabled,
    reviewEnabled: isOwnerItem ? true : item.canReviewDeals,
    roleLabel: isOwnerItem
      ? t("channelDetails.moderators.roleOwner")
      : t("channelDetails.moderators.roleModerator"),
    initials: getInitials(item.displayName),
  };
};
