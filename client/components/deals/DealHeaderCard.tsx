import { useMemo, useState } from "react";
import type { DealEntity } from "@/models/entities";
import { cn } from "@/lib/utils";
import { formatTon } from "@/i18n/formatters";
import { formatDuration, getAllowEditsLabel, getAllowLinkTrackingLabel, getListingFormatLabel } from "@/i18n/labels";
import { useLanguage } from "@/i18n/LanguageProvider";

interface DealHeaderCardProps {
  deal: DealEntity;
}

export default function DealHeaderCard({ deal }: DealHeaderCardProps) {
  const { t, language } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  const priceLabel = `${formatTon(deal.listingSnapshot.priceNano, language)} ${t("common.ton")}`;
  const listingFormat = getListingFormatLabel(t, deal.listingSnapshot.format);
  const tags = deal.listingSnapshot.tags ?? [];
  const pinDurationHours = deal.listingSnapshot.pinDurationHours;
  const lifetimeHours = deal.listingSnapshot.visibilityDurationHours;

  const detailItems = useMemo(
    () => [
      {
        label: t("listings.pinDuration"),
        value: pinDurationHours ? formatDuration(pinDurationHours, t) : t("common.none"),
      },
      {
        label: t("listings.lifetimeDuration"),
        value: lifetimeHours ? formatDuration(lifetimeHours, t) : t("common.emptyValue"),
      },
      {
        label: t("listings.allowEdits.label"),
        value:
          deal.listingSnapshot.allowEdits === undefined
            ? t("common.emptyValue")
            : getAllowEditsLabel(t, deal.listingSnapshot.allowEdits),
      },
      {
        label: t("listings.allowLinkTracking.label"),
        value:
          deal.listingSnapshot.allowLinkTracking === undefined
            ? t("common.emptyValue")
            : getAllowLinkTrackingLabel(t, deal.listingSnapshot.allowLinkTracking),
      },
    ],
    [deal.listingSnapshot.allowEdits, deal.listingSnapshot.allowLinkTracking, pinDurationHours, lifetimeHours, t]
  );

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-secondary/60 text-lg font-semibold text-muted-foreground">
          {deal.channel.title.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span className="truncate">{deal.channel.title}</span>
          </div>
          <p className="text-xs text-muted-foreground">@{deal.channel.username}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold price-text">{priceLabel}</p>
          <p className="text-xs text-muted-foreground">{listingFormat}</p>
        </div>
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
        >
          <span>{expanded ? t("common.hideDetails") : t("common.more")}</span>
          <span className={cn("text-xs", expanded ? "text-foreground" : "text-muted-foreground")}>
            {expanded ? t("common.collapseSymbol") : t("common.expandSymbol")}
          </span>
        </button>
      </div>

      {expanded ? (
        <div className="mt-4 space-y-3 text-xs text-muted-foreground">
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-secondary/60 px-3 py-1 text-xs font-medium text-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            {detailItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground">
                  {item.label}
                </span>
                <span className="font-semibold text-foreground">{item.value}</span>
              </div>
            ))}
          </div>

          {deal.listingSnapshot.contentRulesText ? (
            <div className="rounded-lg border border-border/60 bg-background/50 p-3 text-xs text-muted-foreground">
              <p className="text-[11px] font-semibold text-foreground/80">
                {t("listings.rulesTitle")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{deal.listingSnapshot.contentRulesText}</p>
            </div>
          ) : null}

        </div>
      ) : null}
    </div>
  );
}
