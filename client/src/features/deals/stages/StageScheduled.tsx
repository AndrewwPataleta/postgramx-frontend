import InfoCard from "@/features/deals/ui/InfoCard";
import type { DealEntity } from "@/models/entities";
import { EscrowStatus } from "@/models/enums";
import { useLanguage } from "@/i18n/LanguageProvider";
import DualTimeLabel from "@/features/deals/ui/DualTimeLabel";

interface StageScheduledProps {
  deal: DealEntity;
  readonly: boolean;
  onAction?: Record<string, never>;
}

export default function StageScheduled({ deal }: StageScheduledProps) {
  const { t } = useLanguage();
  const escrowStatus = deal.escrow?.status;

  return (
    <InfoCard title={t("deals.stage.scheduled.title")}>
      {escrowStatus === EscrowStatus.FundsConfirmed ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-success/40 bg-success/10 px-2.5 py-1 text-[11px] font-semibold text-success">
            {t("deals.stage.payment.paymentDetected")}
          </span>
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">
        {t("deals.stage.scheduled.time")}:{" "}
        <DualTimeLabel
          dateIso={deal.publishAtUtc ?? deal.scheduledAt}
          display={deal.publishAtDisplay}
          emptyLabel={t("deals.stage.scheduled.notScheduled")}
        />
      </p>
      {!(deal.publishAtUtc ?? deal.scheduledAt) ? (
        <p className="text-xs text-muted-foreground">
          {t("deals.stage.scheduled.noSchedule")}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">{t("deals.stage.scheduled.waiting")}</p>
      )}
    </InfoCard>
  );
}
