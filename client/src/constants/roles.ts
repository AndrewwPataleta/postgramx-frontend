export const USER_ROLE = {
  ADVERTISER: "advertiser",
  PUBLISHER: "publisher",
  PUBLISHER_MANAGER: "publisher_manager",
} as const;

export type UserRole = typeof USER_ROLE[keyof typeof USER_ROLE];

// The role a user plays within a specific deal.
export type UserRoleInDeal = UserRole;
