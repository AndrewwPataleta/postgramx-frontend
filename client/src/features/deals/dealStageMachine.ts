import { DealStage } from "@/models/enums";
import { stageOrder } from "@/models/helpers";
import type { TranslationKey } from "@/i18n/translations";

export type DealStageId = DealStage;

export const allStages: DealStageId[] = [...stageOrder];

export const normalizeDealStage = (stage: DealStageId): DealStageId => {
  if (stage === DealStage.CREATIVE_AWAITING_FOR_CHANGES) {
    return DealStage.CREATIVE_AWAITING_SUBMIT;
  }
  return stage;
};

export const stageToLabel = (
  stage: DealStageId,
  t: (key: TranslationKey) => string,
) => t(`deals.timeline.stage.${normalizeDealStage(stage)}` as TranslationKey);

export const canNavigateTo = (stage: DealStageId, currentStage: DealStageId) =>
  stageOrder.indexOf(normalizeDealStage(stage)) <=
  stageOrder.indexOf(normalizeDealStage(currentStage));
