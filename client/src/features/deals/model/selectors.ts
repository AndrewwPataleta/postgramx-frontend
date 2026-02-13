import { DealStage } from "@/models/enums";
import { stageOrder } from "@/models/helpers";
import { normalizeDealStage } from "@/features/deals/dealStageMachine";

export const canSelectDealStage = (currentStage: DealStage, nextStage: DealStage) => {
  const currentIndex = stageOrder.indexOf(normalizeDealStage(currentStage));
  const nextIndex = stageOrder.indexOf(nextStage);
  return nextIndex <= currentIndex;
};
