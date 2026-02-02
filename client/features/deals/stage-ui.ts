import { DealStage } from "@/models/enums";
import type { TranslationKey } from "@/i18n/translations";

export const orderedSteps = [
  "CREATIVE",
  "ADMIN_REVIEW",
  "SCHEDULE",
  "PAYMENT",
  "PUBLISH",
  "VERIFY",
] as const;

export type StepId = (typeof orderedSteps)[number];

export type StepState = "done" | "active" | "locked";

const stageToStep: Record<DealStage, StepId> = {
  [DealStage.CreativePending]: "CREATIVE",
  [DealStage.CreativeChangesRequested]: "CREATIVE",
  [DealStage.CreativeSubmitted]: "ADMIN_REVIEW",
  [DealStage.CreativeApproved]: "SCHEDULE",
  [DealStage.Scheduled]: "PAYMENT",
  [DealStage.PaymentPending]: "PAYMENT",
  [DealStage.Paid]: "PUBLISH",
  [DealStage.Published]: "VERIFY",
  [DealStage.Verified]: "VERIFY",
  [DealStage.Completed]: "VERIFY",
};

export const getCurrentStep = (stage: DealStage): StepId =>
  stageToStep[stage] ?? orderedSteps[0];

export const getStepState = (step: StepId, stage: DealStage): StepState => {
  const currentStep = getCurrentStep(stage);
  const currentIndex = orderedSteps.indexOf(currentStep);
  const stepIndex = orderedSteps.indexOf(step);

  if (stepIndex < currentIndex) {
    return "done";
  }
  if (stepIndex === currentIndex) {
    return "active";
  }
  return "locked";
};

export const stepToLabel = (step: StepId, t: (key: TranslationKey) => string) =>
  t(`deals.timeline.step.${step}` as TranslationKey);
