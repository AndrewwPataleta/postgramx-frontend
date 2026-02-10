import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DealEntity } from "@/models/entities";
import { scheduleDeal } from "@/api/features/dealsApi";
import { getErrorMessage } from "@/lib/api/errors";
import InfoCard from "@/components/deals/InfoCard";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/i18n/formatters";
import { useLanguage } from "@/i18n/LanguageProvider";
import { DealStage } from "@/models/enums";

interface StageScheduleTimeProps {
  deal: DealEntity;
  readonly: boolean;
  onAction?: {
    onConfirmSchedule?: (scheduledAt: string) => Promise<void> | void;
  };
}

const pad2 = (num: number) => String(num).padStart(2, "0");

const parseScheduleDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const formatDateInputValue = (date: Date) => {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
};

const formatTimeInputValue = (date: Date) => {
  const h = pad2(date.getHours());
  const min = pad2(date.getMinutes());
  return `${h}:${min}`;
};

const isValidDateInput = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);
const isValidTimeInput = (value: string) => /^\d{2}:\d{2}$/.test(value);

const buildLocalDateFromInputs = (dateValue: string, timeValue: string): Date | null => {
  if (!isValidDateInput(dateValue) || !isValidTimeInput(timeValue)) return null;

  const [yStr, mStr, dStr] = dateValue.split("-");
  const [hhStr, mmStr] = timeValue.split(":");

  const y = Number(yStr);
  const m = Number(mStr);
  const d = Number(dStr);
  const hh = Number(hhStr);
  const mm = Number(mmStr);

  if (
    !Number.isFinite(y) ||
    !Number.isFinite(m) ||
    !Number.isFinite(d) ||
    !Number.isFinite(hh) ||
    !Number.isFinite(mm)
  ) {
    return null;
  }

  const candidate = new Date(y, m - 1, d, hh, mm, 0, 0);
  if (Number.isNaN(candidate.getTime())) return null;

  if (
    candidate.getFullYear() !== y ||
    candidate.getMonth() !== m - 1 ||
    candidate.getDate() !== d ||
    candidate.getHours() !== hh ||
    candidate.getMinutes() !== mm
  ) {
    return null;
  }

  return candidate;
};

const toUtcIsoString = (date: Date) => date.toISOString();

export default function StageScheduleTime({ deal, readonly, onAction }: StageScheduleTimeProps) {
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const isLocalDev = import.meta.env.DEV;

  const isAwaitingScheduleChanges = deal.stage === DealStage.SCHEDULE_AWAITING_FOR_CHANGES;
  const titleKey = isAwaitingScheduleChanges
    ? "deals.schedule.awaiting_changes.title"
    : "deals.stage.scheduleTime.title";
  const descriptionKey = isAwaitingScheduleChanges
    ? "deals.schedule.awaiting_changes.subtitle"
    : "deals.stage.scheduleTime.description";
  const confirmKey = isAwaitingScheduleChanges
    ? "deals.schedule.awaiting_changes.cta"
    : "deals.stage.scheduleTime.confirm";

  const [dateValue, setDateValue] = useState("");
  const [timeValue, setTimeValue] = useState("");

  useEffect(() => {
    const parsed = parseScheduleDate(deal.scheduledAt);
    if (!parsed) {
      setDateValue("");
      setTimeValue("");
      return;
    }
    setDateValue(formatDateInputValue(parsed));
    setTimeValue(formatTimeInputValue(parsed));
  }, [deal.scheduledAt]);

  const scheduledLocal = useMemo(
    () => buildLocalDateFromInputs(dateValue, timeValue),
    [dateValue, timeValue]
  );

  const minAllowedMs = useMemo(() => (isLocalDev ? Date.now() : Date.now() + 60 * 60 * 1000), [isLocalDev]);

  const isValidSchedule = useMemo(() => {
    if (!scheduledLocal) return false;
    return scheduledLocal.getTime() > minAllowedMs;
  }, [scheduledLocal, minAllowedMs]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!scheduledLocal || !isValidSchedule) {
        throw new Error(t("deals.stage.scheduleTime.selectDateError"));
      }
      const scheduledAtUtc = toUtcIsoString(scheduledLocal);
      return scheduleDeal({ id: deal.id, scheduledAt: scheduledAtUtc });
    },
    onSuccess: () => {
      toast.success(t("deals.stage.scheduleTime.updatedToast"));
      queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("deals.stage.scheduleTime.saveError"), t));
    },
  });

  if (readonly) {
    return (
      <InfoCard title={t(titleKey)}>
        <p className="text-xs text-muted-foreground">{t("deals.stage.scheduleTime.readonly")}</p>
        <p className="text-xs text-muted-foreground">
          {t("deals.scheduledAt")}:{" "}
          <span className="font-semibold text-foreground">
            {deal.scheduledAt
              ? formatDateTime(deal.scheduledAt, language)
              : t("deals.stage.scheduleTime.notScheduled")}
          </span>
        </p>
      </InfoCard>
    );
  }

  const handleConfirm = () => {
    if (!scheduledLocal || !isValidSchedule) {
      toast.error(t("deals.stage.scheduleTime.selectDateError"));
      return;
    }

    const scheduledAtUtc = toUtcIsoString(scheduledLocal);

    if (onAction?.onConfirmSchedule) {
      onAction.onConfirmSchedule(scheduledAtUtc);
      return;
    }

    mutation.mutate();
  };

  return (
    <InfoCard title={t(titleKey)}>
      <p className="text-xs text-muted-foreground">{t(descriptionKey)}</p>

      <div className="space-y-3">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">

              <input
                type="date"
                value={dateValue}
                onChange={(e) => setDateValue(e.target.value)}
                className={cn(
                  "h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 text-sm font-medium text-foreground shadow-sm outline-none transition",
                  "focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                )}
              />
            </div>

            <div className="space-y-1">
              <input
                type="time"
                value={timeValue}
                onChange={(e) => setTimeValue(e.target.value)}
                className={cn(
                  "h-11 w-full rounded-xl border border-border/60 bg-background/70 px-3 text-sm font-medium text-foreground shadow-sm outline-none transition",
                  "focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                )}
              />
            </div>
          </div>

          <div className="mt-3">
            {scheduledLocal ? (
              <p className="text-[11px] text-muted-foreground">
                {t("deals.stage.scheduleTime.preview") ?? "Selected"}:{" "}
                <span className="font-semibold text-foreground">
                  {formatDateTime(scheduledLocal.toISOString(), language)}
                </span>
              </p>
            ) : (
              <p className="text-[11px] text-muted-foreground">

              </p>
            )}
            {!isValidSchedule && scheduledLocal ? (
              <p className="mt-1 text-[11px] text-destructive">
                {t("deals.stage.scheduleTime.selectDateError")}
              </p>
            ) : null}
          </div>
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={mutation.isPending || !isValidSchedule}
          className={cn(
            "w-full rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition",
            mutation.isPending || !isValidSchedule
              ? "cursor-not-allowed opacity-60"
              : "hover:bg-primary/90"
          )}
        >
          {mutation.isPending ? t("common.saving") ?? "Saving..." : t(confirmKey)}
        </button>
      </div>
    </InfoCard>
  );
}
