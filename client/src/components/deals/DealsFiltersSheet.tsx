import { useEffect, useMemo, useState } from "react";
import { Button } from "@/design-system/ui/button";
import { Checkbox } from "@/design-system/ui/checkbox";
import BottomSheet from "@/design-system/components/BottomSheet";
import { Input } from "@/design-system/ui/input";
import { Label } from "@/design-system/ui/label";
import { Separator } from "@/design-system/ui/separator";
import { Switch } from "@/design-system/ui/switch";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/translations";
import { DEAL_STAGE_GROUPS, type DealSectionKey, type DealsFilters } from "@/features/deals/filters/filters.types";
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

const STAGE_TAB_ORDER: DealSectionKey[] = ["pending", "active", "completed"];

const ROLE_OPTIONS: DealsFilters["role"][] = ["all", "advertiser", "publisher"];
const DATE_OPTIONS: DealsFilters["datePreset"][] = ["all", "today", "7d", "30d", "custom"];

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
      setDraft(filters);
    }
  }, [filters, open]);

  const showDateCustom = draft.datePreset === "custom";

  const stageOptions = useMemo(() => {
    return STAGE_TAB_ORDER.map((tab) => ({
      tab,
      stages: DEAL_STAGE_GROUPS[tab],
    }));
  }, []);

  const updateStage = (stage: DealStage, checked: boolean) => {
    setDraft((prev) => ({
      ...prev,
      stages: checked ? [...prev.stages, stage] : prev.stages.filter((item) => item !== stage),
    }));
  };

  const apply = () => {
    onChange(draft);
    onOpenChange(false);
  };

  const reset = () => {
    onReset();
    onOpenChange(false);
  };

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} title={t("deals.filters.title")}>
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("deals.filters.role.label")}</Label>
          <div className="grid grid-cols-3 gap-2">
            {ROLE_OPTIONS.map((role) => (
              <Button
                key={role}
                type="button"
                variant={draft.role === role ? "default" : "outline"}
                size="sm"
                onClick={() => setDraft((prev) => ({ ...prev, role }))}
                className="capitalize"
              >
                {t(`deals.filters.role.${role}` as TranslationKey)}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">{t("deals.filters.stage.label")}</Label>
          {stageOptions.map(({ tab, stages }) => (
            <div key={tab} className="space-y-2">
              <p className={`text-xs uppercase ${tab === activeTab ? "text-primary" : "text-muted-foreground"}`}>
                {t(`deals.tabs.${tab}` as TranslationKey)}
              </p>
              <div className="space-y-2">
                {stages.map((stage) => (
                  <label key={stage} className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox
                      checked={draft.stages.includes(stage)}
                      onCheckedChange={(checked) => updateStage(stage, checked === true)}
                    />
                    <span>{t(`deals.timeline.stage.${stage}` as TranslationKey)}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="deals-filter-query" className="text-sm font-medium">
            {t("deals.filters.channelSearch.label")}
          </Label>
          <Input
            id="deals-filter-query"
            value={draft.query}
            onChange={(event) => setDraft((prev) => ({ ...prev, query: event.target.value }))}
            placeholder="@postgramx"
          />
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("deals.filters.amount.label")}</Label>
          <div className="grid grid-cols-2 gap-2">
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

        <Separator />

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t("deals.filters.date.label")}</Label>
          <div className="grid grid-cols-2 gap-2">
            {DATE_OPTIONS.map((option) => (
              <Button
                key={option}
                type="button"
                variant={draft.datePreset === option ? "default" : "outline"}
                size="sm"
                onClick={() => setDraft((prev) => ({ ...prev, datePreset: option }))}
              >
                {t(`deals.filters.date.${option === "7d" ? "last7" : option === "30d" ? "last30" : option}` as TranslationKey)}
              </Button>
            ))}
          </div>
          {showDateCustom ? (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("deals.filters.date.from")}</Label>
                <Input
                  type="date"
                  value={draft.dateFrom ?? ""}
                  onChange={(event) => setDraft((prev) => ({ ...prev, dateFrom: event.target.value || undefined }))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">{t("deals.filters.date.to")}</Label>
                <Input
                  type="date"
                  value={draft.dateTo ?? ""}
                  onChange={(event) => setDraft((prev) => ({ ...prev, dateTo: event.target.value || undefined }))}
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
                onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, expiring24h: checked }))}
              />
            </label>
          </>
        ) : null}

        {capabilities.supportsRequiresReview ? (
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t("deals.filters.requiresReview")}</span>
            <Switch
              checked={draft.requiresReview === true}
              onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, requiresReview: checked ? true : undefined }))}
            />
          </label>
        ) : null}

        {capabilities.supportsHasIssues ? (
          <label className="flex items-center justify-between gap-3 text-sm">
            <span>{t("deals.filters.hasIssues")}</span>
            <Switch
              checked={draft.hasIssues === true}
              onCheckedChange={(checked) => setDraft((prev) => ({ ...prev, hasIssues: checked ? true : undefined }))}
            />
          </label>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
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
