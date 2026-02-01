import { memo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DealEntity } from "@/models/entities";
import { formatDate, formatDateTime, formatTon } from "@/i18n/formatters";
import { getDealRoleLabel, getEscrowStatusLabel, getListingFormatLabel, getPinnedDurationLabel, getVisibilityDurationLabel } from "@/i18n/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { USER_ROLE } from "@/constants/roles";
import { useAuth } from "@/components/auth/AuthProvider";

const roleToneMap: Record<string, string> = {
  [USER_ROLE.ADVERTISER]: "bg-emerald-500/10 text-emerald-400",
  [USER_ROLE.PUBLISHER]: "bg-emerald-500/10 text-emerald-400",
  [USER_ROLE.PUBLISHER_MANAGER]: "bg-emerald-500/10 text-emerald-400",
};

type DealListItem = DealEntity | { deal: DealEntity };

interface DealListCardProps {
  deal: DealListItem;
  onSelect: (deal: DealEntity) => void;
}

const DealListCard = ({ deal, onSelect }: DealListCardProps) => {
  const resolvedDeal = "deal" in deal ? deal.deal : deal;
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const listingSnapshot = resolvedDeal.listingSnapshot;
  const visibilityLabel = listingSnapshot?.visibilityDurationHours
    ? getVisibilityDurationLabel(t, listingSnapshot.visibilityDurationHours)
    : null;
  const pinnedLabel = listingSnapshot?.pinDurationHours
    ? getPinnedDurationLabel(t, listingSnapshot.pinDurationHours)
    : null;
  const detailLine = [visibilityLabel, pinnedLabel].filter(Boolean).join(" • ");
  const escrowText = getEscrowStatusLabel(t, resolvedDeal.escrow.status);
  const currentUserId = (user as { id?: string } | null)?.id;
  const resolvedRole =
    currentUserId && currentUserId === resolvedDeal.advertiserUserId
      ? USER_ROLE.ADVERTISER
      : USER_ROLE.PUBLISHER;

  return (
    <div
      className={`w-full rounded-2xl border border-border/60 bg-card/80 p-4 text-left shadow-sm transition ${
        onSelect ? "cursor-pointer hover:border-primary/40 hover:bg-card" : ""
      }`}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect(resolvedDeal)}
      onKeyDown={(event) => {
        if (!onSelect) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(resolvedDeal);
        }
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-secondary/60 text-lg font-semibold text-muted-foreground">
            {resolvedDeal.channel.title.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="truncate">{resolvedDeal.channel.title}</span>
            </div>
            <p className="text-xs text-muted-foreground">@{resolvedDeal.channel.username}</p>
          </div>
        </div>
        <span
          className={`max-w-[160px] truncate whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${roleToneMap[resolvedRole]}`}
          style={{ textOverflow: "ellipsis" }}
        >
          {t("deals.badge.youAreRole", { role: getDealRoleLabel(t, resolvedRole) })}
        </span>
      </div>

      <div className="mt-2 flex items-center gap-2 overflow-hidden">
        <span
          className="max-w-[200px] truncate whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold"
          style={{ textOverflow: "ellipsis" }}
        >
          {escrowText}
        </span>
        <span className="text-xs text-muted-foreground">
          {listingSnapshot?.priceNano
            ? formatTon(listingSnapshot.priceNano, language)
            : t("common.emptyValue")}{" "}
          {t("common.ton")}
        </span>
      </div>

      <div className="mt-3 space-y-1">
        {detailLine ? (
          <p className="text-xs text-muted-foreground">{detailLine}</p>
        ) : null}
        {resolvedDeal.scheduledAt ? (
          <p className="text-xs text-muted-foreground">
            {t("deals.scheduledAt")}: {formatDateTime(resolvedDeal.scheduledAt, language)}
          </p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setExpanded((prev) => !prev);
        }}
        className="mt-3 flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
      >
        <span>{expanded ? t("common.hideDetails") : t("common.showDetails")}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded ? (
        <div className="mt-3 space-y-3 text-xs text-muted-foreground">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <span className="font-medium text-foreground">{t("common.createdAt")}:</span>{" "}
              {formatDate(resolvedDeal.createdAt, language) || t("common.emptyValue")}
            </div>
            <div>
              <span className="font-medium text-foreground">{t("deals.scheduledAt")}:</span>{" "}
              {formatDate(resolvedDeal.scheduledAt, language) || t("common.emptyValue")}
            </div>
          </div>
          {listingSnapshot?.tags?.length ? (
            <div className="flex flex-wrap gap-2">
              {listingSnapshot.tags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-foreground">
              {t("listings.formatLabel")}:{" "}
              {listingSnapshot?.format
                ? getListingFormatLabel(t, listingSnapshot.format)
                : t("common.emptyValue")}
            </span>
            <span className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-foreground">
              {pinnedLabel ?? t("listings.meta.notPinned")}
            </span>
            <span className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-foreground">
              {visibilityLabel ?? t("listings.meta.noVisibility")}
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default memo(DealListCard);
