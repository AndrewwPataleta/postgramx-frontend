import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { DealEntity } from "@/models/entities";
import { scheduleDeal } from "@/api/features/dealsApi";
import { getErrorMessage } from "@/lib/api/errors";
import InfoCard from "@/components/deals/InfoCard";
import { ScheduleDatePicker } from "@/components/deals/ScheduleDatePicker";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/i18n/formatters";
import { useLanguage } from "@/i18n/LanguageProvider";
import { MIN_SCHEDULE_LEAD_TIME_MS } from "@/features/deals/time";

interface StageScheduleTimeProps {
  deal: DealEntity;
  readonly: boolean;
  onAction?: {
    onConfirmSchedule?: (scheduledAt: string) => Promise<void> | void;
  };
}

const parseScheduleDate = (value?: string) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date;
};

export default function StageScheduleTime({ deal, readonly, onAction }: StageScheduleTimeProps) {
  const queryClient = useQueryClient();
  const { t, language } = useLanguage();
  const [scheduledAt, setScheduledAt] = useState<Date | null>(
    parseScheduleDate(deal.scheduledAt)
  );

  const isValidSchedule = useMemo(() => {
    if (!scheduledAt) {
      return false;
    }
    return scheduledAt.getTime() > Date.now() + MIN_SCHEDULE_LEAD_TIME_MS;
  }, [scheduledAt]);

  useEffect(() => {
    setScheduledAt(parseScheduleDate(deal.scheduledAt));
  }, [deal.scheduledAt]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!scheduledAt || !isValidSchedule) {
        throw new Error(t("deals.stage.scheduleTime.selectDateError"));
      }
      const scheduledAtUtc = new Date(scheduledAt).toISOString();
      return scheduleDeal(deal.id, scheduledAtUtc);
    },
    onSuccess: () => {
      toast.success(t("deals.stage.scheduleTime.updatedToast"));
      queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("deals.stage.scheduleTime.saveError")));
    },
  });

  if (readonly) {
    return (
      <InfoCard title={t("deals.stage.scheduleTime.title")}>
        <p className="text-xs text-muted-foreground">
          {t("deals.stage.scheduleTime.readonly")}
        </p>
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
    if (!scheduledAt || !isValidSchedule) {
      toast.error(t("deals.stage.scheduleTime.selectDateError"));
      return;
    }
    if (onAction?.onConfirmSchedule) {
      onAction.onConfirmSchedule(new Date(scheduledAt).toISOString());
      return;
    }
    mutation.mutate();
  };

  return (
    <InfoCard title={t("deals.stage.scheduleTime.title")}>
      <p className="text-xs text-muted-foreground">
        {t("deals.stage.scheduleTime.description")}
      </p>
      <div className="space-y-3">
        <div className="pb-safe-bottom rounded-2xl border border-border/60 bg-card/80 p-3">
          <ScheduleDatePicker value={scheduledAt} onChange={setScheduledAt} />
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
          {t("deals.stage.scheduleTime.confirm")}
        </button>
      </div>
    </InfoCard>
  );
}
