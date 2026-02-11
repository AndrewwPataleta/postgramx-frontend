import { memo, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { DealEntity } from "@/models/entities";
import { formatTon } from "@/i18n/formatters";
import {
  getDealRoleLabel,
  getEscrowStatusLabel,
  getListingFormatLabel,
  getPinnedDurationLabel,
  getVisibilityDurationLabel,
} from "@/i18n/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { USER_ROLE } from "@/constants/roles";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { stageToLabel } from "@/features/deals/dealStageMachine";
import { COUNTDOWN_TICK_MS, formatHmsCountdown } from "@/features/deals/time";

const roleToneMap: Record<string, string> = {
  [USER_ROLE.ADVERTISER]: "bg-success/10 text-success",
  [USER_ROLE.PUBLISHER]: "bg-success/10 text-success",
  [USER_ROLE.PUBLISHER_MANAGER]: "bg-success/10 text-success",
};

interface DealListCardProps {
  deal: DealEntity;
  onSelect: (deal: DealEntity) => void;
}

const DealListCard = ({ deal, onSelect }: DealListCardProps) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState<string | null>(() =>
    formatHmsCountdown(deal.idleExpiresAt),
  );

  const currentUserId = (user as { id?: string } | null)?.id;

  const channelTitle = deal?.channel?.title ?? t("common.emptyValue");
  const channelUsername = deal?.channel?.username ?? "";
  const channelInitial = channelTitle?.trim()?.[0] ?? "•";

  const listingSnapshot = deal?.listingSnapshot;
  const stageLabel = stageToLabel(deal.stage, t);
  const priceLabel = listingSnapshot?.priceNano
    ? `${formatTon(listingSnapshot.priceNano, language)} ${t("common.ton")}`
    : t("common.emptyValue");

  const visibilityLabel = listingSnapshot?.visibilityDurationHours
    ? getVisibilityDurationLabel(t, listingSnapshot.visibilityDurationHours)
    : null;

  const pinnedLabel = listingSnapshot?.pinDurationHours
    ? getPinnedDurationLabel(t, listingSnapshot.pinDurationHours)
    : null;

  const detailLine = [
    getListingFormatLabel(t, deal.listingSnapshot.format),
    visibilityLabel,
    pinnedLabel,
  ]
    .filter(Boolean)
    .join(" • ");

  const escrowStatus =
    (deal as any)?.escrow?.status ?? (deal as any)?.escrowStatus ?? null;

  const escrowText = escrowStatus
    ? getEscrowStatusLabel(t, escrowStatus)
    : t("common.emptyValue");

  const resolvedRole =
    currentUserId && currentUserId === deal?.advertiserUserId
      ? USER_ROLE.ADVERTISER
      : USER_ROLE.PUBLISHER;

  useMemo(() => {
    if (!deal?.escrow && !(deal as any)?.escrowStatus) {
      console.warn("[DealListCard] deal without escrow:", deal?.id, deal);
    }
    return null;
  }, [deal]);

  useEffect(() => {
    if (!deal.idleExpiresAt) {
      setIdleCountdown(null);
      return;
    }
    const updateCountdown = () => {
      setIdleCountdown(formatHmsCountdown(deal.idleExpiresAt));
    };
    updateCountdown();
    const interval = window.setInterval(updateCountdown, COUNTDOWN_TICK_MS);
    return () => window.clearInterval(interval);
  }, [deal.idleExpiresAt]);

  return (
    <div
      className={`w-full rounded-2xl border border-border/60 bg-card/80 p-4 text-left shadow-sm transition ${
        onSelect ? "cursor-pointer hover:border-primary/40 hover:bg-card" : ""
      }`}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={() => onSelect(deal)}
      onKeyDown={(event) => {
        if (!onSelect) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(deal);
        }
      }}
    >
      <div className="flex items-start justify-between gap-3 pb-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">{stageLabel}</p>
          {idleCountdown ? (
            <p className="text-xs text-muted-foreground">
              {t("deals.list.idleExpiresIn", { time: idleCountdown })}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-foreground">{priceLabel}</p>
        </div>
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-secondary/60 text-lg font-semibold text-muted-foreground">
            {channelInitial}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span className="truncate">{channelTitle}</span>
            </div>
            {channelUsername ? (
              <p className="text-xs text-muted-foreground">
                @{channelUsername}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {t("common.emptyValue")}
              </p>
            )}
          </div>
        </div>

        <span
          className={`max-w-[160px] truncate whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${roleToneMap[resolvedRole]}`}
          style={{ textOverflow: "ellipsis" }}
        >
          {t("deals.badge.youAreRole", {
            role: getDealRoleLabel(t, resolvedRole),
          })}
        </span>
      </div>
      <div className="mt-3 space-y-1">
        {detailLine ? (
          <p className="text-xs text-muted-foreground">{detailLine}</p>
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
        <span>
          {expanded ? t("common.hideDetails") : t("common.showDetails")}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded ? (
        <div className="mt-3 space-y-3 text-xs text-muted-foreground">
          {listingSnapshot?.tags?.length ? (
            <div className="flex flex-wrap ">
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
        </div>
      ) : null}
    </div>
  );
};

export default memo(DealListCard);
