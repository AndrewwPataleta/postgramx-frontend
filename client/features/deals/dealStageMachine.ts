import { DealStage } from "@/models/enums";
import { stageOrder } from "@/models/helpers";
import type { TranslationKey } from "@/i18n/translations";

export type DealStageId = DealStage;

export const allStages: DealStageId[] = [...stageOrder];

export const stageToLabel = (stage: DealStageId, t: (key: TranslationKey) => string) =>
  t(`deals.timeline.stage.${stage}` as TranslationKey);

export const canNavigateTo = (stage: DealStageId, currentStage: DealStageId) =>
  stageOrder.indexOf(stage) <= stageOrder.indexOf(currentStage);
