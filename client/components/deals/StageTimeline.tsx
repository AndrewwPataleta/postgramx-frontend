import { ChevronLeft, ChevronRight } from "lucide-react";
import { canNavigateTo, stageToLabel, type DealStageId } from "@/features/deals/dealStageMachine";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";

interface StageTimelineProps {
  stages: DealStageId[];
  selectedStage: DealStageId;
  currentStage: DealStageId;
  onSelect?: (stage: DealStageId) => void;
}

export default function StageTimeline({
  stages,
  selectedStage,
  currentStage,
  onSelect,
}: StageTimelineProps) {
  const { t } = useLanguage();
  const currentIndex = stages.indexOf(selectedStage);
  const previousStage = currentIndex > 0 ? stages[currentIndex - 1] : null;
  const nextStage = currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  const isInteractive = Boolean(onSelect);

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
            const isDisabled = !canNavigateTo(stage, currentStage);
            const sharedClasses = cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition",
              isActive
                ? "bg-primary text-white"
                : "border-border/60 bg-background/50 text-muted-foreground",
              isInteractive && !isDisabled ? "hover:border-primary/40 hover:text-foreground" : "opacity-70"
            );

            if (!isInteractive) {
              return (
                <div key={stage} className={sharedClasses}>
                  {stageToLabel(stage, t)}
                </div>
              );
            }

            return (
              <button
                key={stage}
                type="button"
                onClick={() => onSelect?.(stage)}
                disabled={isDisabled}
                className={cn(
                  sharedClasses,
                  isDisabled ? "cursor-not-allowed opacity-40" : "hover:border-primary/40 hover:text-foreground"
                )}
              >
                {stageToLabel(stage, t)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
