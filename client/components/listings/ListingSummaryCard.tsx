import type { ManagedChannel } from "@/features/channels/managedChannels";
import { formatTonValue } from "@/i18n/formatters";
import { formatDuration } from "@/i18n/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getListingTagLabel } from "@/features/listings/tagOptions";

interface ListingSummaryCardProps {
  channel: ManagedChannel;
  priceTon: number;
  pinDurationHours: number | null;
  visibilityDurationHours: number;
  tags?: string[];
}

export function ListingSummaryCard({
  channel,
  priceTon,
  pinDurationHours,
  visibilityDurationHours,
  tags = [],
}: ListingSummaryCardProps) {
  const { t, language } = useLanguage();
  const pinnedLabel = pinDurationHours
    ? formatDuration(pinDurationHours, t)
    : t("listings.meta.notPinned");
  const visibleLabel = formatDuration(visibilityDurationHours, t);
  const priceLabel = formatTonValue(priceTon, language);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/60 text-xl">
          {channel.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{channel.name}</p>
          </div>
          <p className="text-xs text-muted-foreground">{channel.username}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
            <span className="rounded-full bg-secondary/60 px-2 py-1">
              {t("listings.summary.editable")}
            </span>
            <span className="rounded-full bg-secondary/60 px-2 py-1">
              {t("listings.summary.autoPost")}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{t("common.price")}</p>
          <p className="text-sm font-semibold price-text">
            {priceLabel} {t("common.ton")} / {t("listings.perPost")}
          </p>
        </div>
      </div>
      <div className="mt-3 space-y-1 text-xs text-muted-foreground">
        <p className="text-[13px] font-semibold text-foreground">
          {t("listings.format.POST")} •{" "}
          <span className="price-text">
            {priceLabel} {t("common.ton")}
          </span>
        </p>
        <div className="flex items-center justify-between">
          <span>{t("listings.pinnedLabel")}</span>
          <span className="text-foreground">{pinnedLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>{t("listings.visibleLabel")}</span>
          <span className="text-foreground">{visibleLabel}</span>
        </div>
      </div>
      {tags.length > 0 ? (
        <div className="mt-3 space-y-2">
          <p className="text-xs text-muted-foreground">{t("listings.tagsLabel")}</p>
          <div className="flex flex-wrap gap-2 text-[11px] text-foreground">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full border border-border/60 bg-card px-2.5 py-1">
                {getListingTagLabel(tag, t)}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
