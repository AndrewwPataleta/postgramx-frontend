import type { ChannelModeratorsItemViewState } from "./types";

export const sortModerators = (
  moderators: ChannelModeratorsItemViewState[],
): ChannelModeratorsItemViewState[] => {
  return [...moderators].sort((a, b) => {
    if (a.isOwnerItem && !b.isOwnerItem) {
      return -1;
    }
    if (!a.isOwnerItem && b.isOwnerItem) {
      return 1;
    }
    return a.displayName.localeCompare(b.displayName);
  });
};
