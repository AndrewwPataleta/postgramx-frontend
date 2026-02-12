import InfoCard from "@/features/deals/ui/InfoCard";
import { useLanguage } from "@/i18n/LanguageProvider";
import DualTimeLabel from "@/features/deals/ui/DualTimeLabel";

interface DealScheduleCardProps {
  scheduledAt?: string | null;
  publishAtUtc?: string | null;
  publishAtDisplay?: {
    local?: string | null;
    utc?: string | null;
  } | null;
}

export default function DealScheduleCard({ scheduledAt, publishAtUtc, publishAtDisplay }: DealScheduleCardProps) {
  const { t } = useLanguage();

  return (
    <InfoCard title={t("deals.detail.scheduleTitle")}>
      <p className="text-xs text-muted-foreground">{t("deals.detail.scheduleSample")}</p>
      <p className="text-xs text-muted-foreground">
        {t("deals.detail.schedulePublishAt")}:{" "}
        <DualTimeLabel
          dateIso={publishAtUtc ?? scheduledAt}
          display={publishAtDisplay}
          emptyLabel={t("deals.stage.scheduled.notScheduled")}
        />
      </p>
      {!(publishAtUtc ?? scheduledAt) ? (
        <p className="text-xs text-muted-foreground">{t("deals.stage.scheduled.noSchedule")}</p>
      ) : null}
    </InfoCard>
  );
}
