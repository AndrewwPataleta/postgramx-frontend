import type { ChannelStatus, DealStatus, EscrowStatus } from "@/models/enums";
import type { UserRoleInDeal } from "@/constants/roles";
import type { TranslationKey } from "@/i18n/translations";

type TFunction = (key: TranslationKey, params?: Record<string, string | number>) => string;

export const formatDuration = (hours: number, t: TFunction) => {
  if (hours >= 24 && hours % 24 === 0) {
    return `${hours / 24}${t("common.daysShort")}`;
  }
  return `${hours}${t("common.hoursShort")}`;
};

export const getDealStatusLabel = (
  t: TFunction,
  status: DealStatus
) => t(`deals.status.${status}` as TranslationKey);

export const getEscrowStatusLabel = (
  t: TFunction,
  status: EscrowStatus
) => t(`deals.escrowStatus.${status}` as TranslationKey);

export const getDealRoleLabel = (t: TFunction, role: UserRoleInDeal) =>
  t(`deals.role.${role}` as TranslationKey);

export const getChannelStatusLabel = (t: TFunction, status: ChannelStatus | string) =>
  t(`channels.status.${status}` as TranslationKey);

export const getListingFormatLabel = (t: TFunction, format: string) =>
  t(`listings.format.${format}` as TranslationKey);

export const getAllowEditsLabel = (t: TFunction, allow: boolean) =>
  t(allow ? "listings.allowEdits.allowed" : "listings.allowEdits.notAllowed");

export const getAllowLinkTrackingLabel = (t: TFunction, allow: boolean) =>
  t(allow ? "listings.allowLinkTracking.allowed" : "listings.allowLinkTracking.notAllowed");

export const getPinnedDurationLabel = (t: TFunction, hours: number) =>
  `${t("listings.meta.pinned")} ${formatDuration(hours, t)}`;

export const getVisibilityDurationLabel = (t: TFunction, hours: number) =>
  `${t("listings.meta.visible")} ${formatDuration(hours, t)}`;
