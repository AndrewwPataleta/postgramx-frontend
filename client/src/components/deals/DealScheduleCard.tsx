import InfoCard from "@/components/deals/InfoCard";
import { formatDateTime } from "@/i18n/formatters";
import { useLanguage } from "@/i18n/LanguageProvider";

interface DealScheduleCardProps {
  scheduledAt?: string | null;
}

export default function DealScheduleCard({ scheduledAt }: DealScheduleCardProps) {
  const { t, language } = useLanguage();
  const scheduledLabel = scheduledAt
    ? formatDateTime(scheduledAt, language)
    : t("deals.stage.scheduled.notScheduled");

  return (
    <InfoCard title={t("deals.detail.scheduleTitle")}>
      <p className="text-xs text-muted-foreground">{t("deals.detail.scheduleSample")}</p>
      <p className="text-xs text-muted-foreground">
        {t("deals.detail.schedulePublishAt")}:{" "}
        <span className="font-semibold text-foreground">{scheduledLabel}</span>
      </p>
      {!scheduledAt ? (
        <p className="text-xs text-muted-foreground">{t("deals.stage.scheduled.noSchedule")}</p>
      ) : null}
    </InfoCard>
  );
}
