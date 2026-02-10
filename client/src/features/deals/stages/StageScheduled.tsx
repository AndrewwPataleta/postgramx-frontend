import InfoCard from "@/features/deals/ui/InfoCard";
import type { DealEntity } from "@/models/entities";
import { EscrowStatus } from "@/models/enums";
import { formatDateTime } from "@/i18n/formatters";
import { useLanguage } from "@/i18n/LanguageProvider";

interface StageScheduledProps {
  deal: DealEntity;
  readonly: boolean;
  onAction?: Record<string, never>;
}

export default function StageScheduled({ deal }: StageScheduledProps) {
  const { t, language } = useLanguage();
  const scheduledLabel = deal.scheduledAt
    ? formatDateTime(deal.scheduledAt, language)
    : t("deals.stage.scheduled.notScheduled");

  return (
    <InfoCard title={t("deals.stage.scheduled.title")}>
      {deal.escrow.status === EscrowStatus.FundsConfirmed ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
            {t("deals.stage.payment.paymentDetected")}
          </span>
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">
        {t("deals.stage.scheduled.time")}:{" "}
        <span className="font-semibold text-foreground">{scheduledLabel}</span>
      </p>
      {!deal.scheduledAt ? (
        <p className="text-xs text-muted-foreground">
          {t("deals.stage.scheduled.noSchedule")}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">{t("deals.stage.scheduled.waiting")}</p>
      )}
    </InfoCard>
  );
}
