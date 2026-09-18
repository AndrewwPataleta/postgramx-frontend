import { X } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/translations";
import type { DealStage } from "@/models/enums";
import type { DealsFilters } from "@/features/deals/filters/filters.types";

type DealsActiveFiltersChipsProps = {
  filters: DealsFilters;
  onRemoveQuery: () => void;
  onRemoveAmount: () => void;
  onRemoveDate: () => void;
  onRemoveExpiring24h: () => void;
  onRemoveRequiresReview: () => void;
  onRemoveHasIssues: () => void;
  onRemoveStage: (stage: DealStage) => void;
};

export default function DealsActiveFiltersChips({
  filters,
  onRemoveQuery,
  onRemoveAmount,
  onRemoveDate,
  onRemoveExpiring24h,
  onRemoveRequiresReview,
  onRemoveHasIssues,
  onRemoveStage,
}: DealsActiveFiltersChipsProps) {
  const { t } = useLanguage();
  const hasAmountRange =
    typeof filters.amountMinTon === "number" || typeof filters.amountMaxTon === "number";

  const hasActiveFilters =
    filters.query.trim().length > 0 ||
    hasAmountRange ||
    filters.datePreset !== "all" ||
    filters.expiring24h ||
    filters.requiresReview === true ||
    filters.hasIssues === true ||
    filters.stages.length > 0;

  if (!hasActiveFilters) {
    return null;
  }

  const dateLabel =
    filters.datePreset === "7d"
      ? t("deals.filters.date.last7")
      : filters.datePreset === "30d"
        ? t("deals.filters.date.last30")
        : t(`deals.filters.date.${filters.datePreset}` as TranslationKey);

  return (
    <div className="px-1 pb-1 pt-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {filters.query.trim() ? (
          <button
            type="button"
            onClick={onRemoveQuery}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/30"
          >
            {t("deals.filters.channelSearch.label")}: {filters.query.trim()}
            <X size={14} />
          </button>
        ) : null}

        {hasAmountRange ? (
          <button
            type="button"
            onClick={onRemoveAmount}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/30"
          >
            {t("deals.filters.amount.label")}: {filters.amountMinTon ?? 0} - {filters.amountMaxTon ?? "∞"}{" "}
            {t("common.ton")}
            <X size={14} />
          </button>
        ) : null}

        {filters.datePreset !== "all" ? (
          <button
            type="button"
            onClick={onRemoveDate}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            {t("deals.filters.date.label")}: {dateLabel}
            <X size={14} />
          </button>
        ) : null}

        {filters.expiring24h ? (
          <button
            type="button"
            onClick={onRemoveExpiring24h}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/30"
          >
            {t("deals.filters.expiring24h")}
            <X size={14} />
          </button>
        ) : null}

        {filters.requiresReview === true ? (
          <button
            type="button"
            onClick={onRemoveRequiresReview}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/30"
          >
            {t("deals.filters.requiresReview")}
            <X size={14} />
          </button>
        ) : null}

        {filters.hasIssues === true ? (
          <button
            type="button"
            onClick={onRemoveHasIssues}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/30"
          >
            {t("deals.filters.hasIssues")}
            <X size={14} />
          </button>
        ) : null}

        {filters.stages.map((stage) => (
          <button
            key={stage}
            type="button"
            onClick={() => onRemoveStage(stage)}
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary/70 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
          >
            {t(`deals.escrowStatus.${stage}` as TranslationKey)}
            <X size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}
