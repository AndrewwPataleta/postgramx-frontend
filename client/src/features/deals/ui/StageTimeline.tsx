import { stageToLabel, type DealStageId } from "@/features/deals/dealStageMachine";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";

interface StageTimelineProps {
  stages: DealStageId[];
  selectedStage: DealStageId;
  currentStage: DealStageId;
}

export default function StageTimeline({
  stages,
  selectedStage,
  currentStage,
}: StageTimelineProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{t("deals.timeline.title")}</p>
        <span className="text-xs text-muted-foreground">
          {t("deals.timeline.steps", { count: stages.length })}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex flex-1 flex-wrap gap-2">
          {stages.map((stage) => {
            const isActive = stage === selectedStage;
            const sharedClasses = cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition",
              isActive
                ? "bg-primary text-primary-foreground"
                : "border-border/60 bg-background/50 text-muted-foreground",
              stage === currentStage ? "opacity-100" : "opacity-70"
            );

            return (
              <div key={stage} className={sharedClasses}>
                {stageToLabel(stage, t)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
