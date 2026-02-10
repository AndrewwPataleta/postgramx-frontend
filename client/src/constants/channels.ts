export const CHANNEL_STATUS = {
  DRAFT: "DRAFT",
  PENDING_VERIFY: "PENDING_VERIFY",
  VERIFIED: "VERIFIED",
  FAILED: "FAILED",
  REVOKED: "REVOKED",
} as const;

export const CHANNEL_VERIFICATION_STATUS = {
  VERIFIED: "verified",
  PENDING: "pending",
  FAILED: "failed",
} as const;

export const CHANNEL_ROLE = {
  OWNER: "OWNER",
  MANAGER: "MANAGER",
  UNKNOWN: "UNKNOWN",
} as const;

export type ChannelStatus = typeof CHANNEL_STATUS[keyof typeof CHANNEL_STATUS];
export type ChannelVerificationStatus =
  typeof CHANNEL_VERIFICATION_STATUS[keyof typeof CHANNEL_VERIFICATION_STATUS];
export type ChannelRole = typeof CHANNEL_ROLE[keyof typeof CHANNEL_ROLE];
