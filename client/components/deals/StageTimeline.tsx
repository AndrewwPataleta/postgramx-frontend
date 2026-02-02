import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCurrentStep, getStepState, stepToLabel, type StepId } from "@/features/deals/stage-ui";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { DealStage } from "@/models/enums";

interface StageTimelineProps {
  steps: StepId[];
  selectedStep: StepId;
  currentStage: DealStage;
  onSelect?: (step: StepId) => void;
}

export default function StageTimeline({
  steps,
  selectedStep,
  currentStage,
  onSelect,
}: StageTimelineProps) {
  const { t } = useLanguage();
  const currentStep = getCurrentStep(currentStage);
  const currentIndex = steps.indexOf(selectedStep);
  const previousStep = currentIndex > 0 ? steps[currentIndex - 1] : null;
  const nextStep = currentIndex >= 0 && currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
  const isInteractive = Boolean(onSelect);
  const previousLocked = previousStep ? getStepState(previousStep, currentStage) === "locked" : true;
  const nextLocked = nextStep ? getStepState(nextStep, currentStage) === "locked" : true;

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{t("deals.timeline.title")}</p>
        <span className="text-xs text-muted-foreground">
          {t("deals.timeline.steps", { count: steps.length })}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {isInteractive ? (
          <button
            type="button"
            onClick={() => previousStep && !previousLocked && onSelect?.(previousStep)}
            disabled={!previousStep || previousLocked}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition",
              previousStep && !previousLocked
                ? "hover:text-foreground"
                : "cursor-not-allowed opacity-40"
            )}
            aria-label={t("deals.timeline.previousStage")}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        ) : null}

        <div className="flex flex-1 flex-wrap gap-2">
          {steps.map((step) => {
            const isActive = step === selectedStep;
            const state = getStepState(step, currentStage);
            const isDisabled = state === "locked";
            const sharedClasses = cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition",
              isActive
                ? "bg-primary text-white"
                : state === "done"
                  ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300"
                  : "border-border/60 bg-background/50 text-muted-foreground",
              isInteractive && !isDisabled ? "hover:border-primary/40 hover:text-foreground" : "opacity-70"
            );

            if (!isInteractive) {
              return (
                <div key={step} className={sharedClasses}>
                  {stepToLabel(step, t)}
                </div>
              );
            }

            return (
              <button
                key={step}
                type="button"
                onClick={() => onSelect?.(step)}
                disabled={isDisabled}
                className={cn(
                  sharedClasses,
                  isDisabled ? "cursor-not-allowed opacity-40" : "hover:border-primary/40 hover:text-foreground"
                )}
              >
                {stepToLabel(step, t)}
              </button>
            );
          })}
        </div>
        {isInteractive ? (
          <button
            type="button"
            onClick={() => nextStep && !nextLocked && onSelect?.(nextStep)}
            disabled={!nextStep || nextLocked}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-full border border-border/60 text-muted-foreground transition",
              nextStep && !nextLocked ? "hover:text-foreground" : "cursor-not-allowed opacity-40"
            )}
            aria-label={t("deals.timeline.nextStage")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
