import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/design-system/ui/button";
import { Checkbox } from "@/design-system/ui/checkbox";
import BottomSheet from "@/design-system/components/BottomSheet";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import { Separator } from "@/design-system/ui/separator";
import { Switch } from "@/design-system/ui/switch";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/translations";
import {
  DEAL_STAGE_GROUPS,
  type DealSectionKey,
  type DealsFilters,
} from "@/features/deals/filters/filters.types";
import { DealStage } from "@/models/enums";

type DealsFiltersSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: DealsFilters;
  onChange: (filters: DealsFilters) => void;
  onReset: () => void;
  activeTab: DealSectionKey;
  capabilities: {
    supportsExpiring24h: boolean;
    supportsRequiresReview: boolean;
    supportsHasIssues: boolean;
  };
};

const DATE_OPTIONS: DealsFilters["datePreset"][] = [
  "all",
  "today",
  "7d",
  "30d",
  "custom",
];

export default function DealsFiltersSheet({
  open,
  onOpenChange,
  filters,
  onChange,
  onReset,
  activeTab,
  capabilities,
}: DealsFiltersSheetProps) {
  const { t } = useLanguage();
  const [draft, setDraft] = useState<DealsFilters>(filters);

  useEffect(() => {
    if (!open) {
      setDraft({ ...filters, role: "all" });
    }
  }, [filters, open]);

  const showDateCustom = draft.datePreset === "custom";
  const showStageFilters = activeTab === "completed";
  const selectedStagesCount = draft.stages.filter((stage) =>
    DEAL_STAGE_GROUPS[activeTab].includes(stage),
  ).length;

  const stageOptions = [
    { tab: activeTab, stages: DEAL_STAGE_GROUPS[activeTab] },
  ];

  const updateStage = (stage: DealStage, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      stages: checked
        ? [...prev.stages, stage]
        : prev.stages.filter((item) => item !== stage),
    }));
  };

  const apply = () => {
    onChange({ ...draft, role: "all" });
    onOpenChange(false);
  };

  const reset = () => {
    onReset();
    onOpenChange(false);
  };

  const selectedDateLabel =
    draft.datePreset === "7d"
      ? t("deals.filters.date.last7")
      : draft.datePreset === "30d"
        ? t("deals.filters.date.last30")
        : t(`deals.filters.date.${draft.datePreset}` as TranslationKey);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("deals.filters.title")}
      contentClassName="flex max-h-[85dvh] flex-col overflow-hidden sm:max-h-[80vh]"
      bodyClassName="flex min-h-0 flex-1 flex-col"
    >
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
          <Label htmlFor="deals-filter-query" className="text-sm font-medium">
            {t("deals.filters.channelSearch.label")}
          </Label>
          <Input
            id="deals-filter-query"
            value={draft.query}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, query: event.target.value }))
            }
            placeholder="@postgramx"
          />
        </div>

        <Separator />

        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
          <Label className="text-sm font-medium">
            {t("deals.filters.amount.label")}
          </Label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t("deals.filters.amount.min")}
              </Label>
              <Input
                type="number"
                min="0"
                placeholder={t("deals.filters.amount.min")}
                value={draft.amountMinTon ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((prev) => ({
                    ...prev,
                    amountMinTon: value ? Number(value) : undefined,
                  }));
                }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">
                {t("deals.filters.amount.max")}
              </Label>
              <Input
                type="number"
                min="0"
                placeholder={t("deals.filters.amount.max")}
                value={draft.amountMaxTon ?? ""}
                onChange={(event) => {
                  const value = event.target.value;
                  setDraft((prev) => ({
                    ...prev,
                    amountMaxTon: value ? Number(value) : undefined,
                  }));
                }}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm font-medium">
              {t("deals.filters.date.label")}
            </Label>
            <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-1 text-xs text-muted-foreground">
              <CalendarDays size={12} />
              {selectedDateLabel}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {DATE_OPTIONS.map((option) => (
              <Button
                key={option}
                type="button"
                variant={draft.datePreset === option ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setDraft((prev) => ({ ...prev, datePreset: option }))
                }
              >
                {t(
                  `deals.filters.date.${option === "7d" ? "last7" : option === "30d" ? "last30" : option}` as TranslationKey,
                )}
              </Button>
            ))}
          </div>
          {showDateCustom ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {t("deals.filters.date.from")}
                </Label>
                <Input
                  type="date"
                  value={draft.dateFrom ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      dateFrom: event.target.value || undefined,
                    }))
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">
                  {t("deals.filters.date.to")}
                </Label>
                <Input
                  type="date"
                  value={draft.dateTo ?? ""}
                  onChange={(event) =>
                    setDraft((prev) => ({
                      ...prev,
                      dateTo: event.target.value || undefined,
                    }))
                  }
                />
              </div>
            </div>
          ) : null}
        </div>

        {capabilities.supportsExpiring24h ? (
          <>
            <Separator />
            <label className="flex items-center justify-between gap-3 text-sm">
              <span>{t("deals.filters.expiring24h")}</span>
              <Switch
                checked={draft.expiring24h}
                onCheckedChange={(checked) =>
                  setDraft((prev) => ({ ...prev, expiring24h: checked }))
                }
              />
            </label>
          </>
        ) : null}

        {capabilities.supportsRequiresReview ? (
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t("deals.filters.requiresReview")}</span>
            <Switch
              checked={draft.requiresReview === true}
              onCheckedChange={(checked) =>
                setDraft((prev) => ({
                  ...prev,
                  requiresReview: checked ? true : undefined,
                }))
              }
            />
          </label>
        ) : null}

        {capabilities.supportsHasIssues ? (
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t("deals.filters.hasIssues")}</span>
            <Switch
              checked={draft.hasIssues === true}
              onCheckedChange={(checked) =>
                setDraft((prev) => ({
                  ...prev,
                  hasIssues: checked ? true : undefined,
                }))
              }
            />
          </label>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Button type="button" variant="outline" onClick={reset}>
          {t("deals.filters.reset")}
        </Button>
        <Button type="button" onClick={apply}>
          {t("deals.filters.apply")}
        </Button>
      </div>
    </BottomSheet>
  );
}
