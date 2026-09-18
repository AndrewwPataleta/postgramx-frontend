import { DealStage } from "@/models/enums";

export type DealsFilterRole = "all" | "advertiser" | "publisher";
export type DealsDatePreset = "all" | "today" | "7d" | "30d" | "custom";

export type DealSectionKey = "pending" | "active" | "completed";

export type DealsFilters = {
  role: DealsFilterRole;
  stages: DealStage[];
  query: string;
  amountMinTon?: number;
  amountMaxTon?: number;
  datePreset: DealsDatePreset;
  dateFrom?: string;
  dateTo?: string;
  expiring24h: boolean;
  hasIssues?: boolean;
  requiresReview?: boolean;
};

export const DEAL_STAGE_GROUPS: Record<DealSectionKey, DealStage[]> = {
  pending: [
    DealStage.CREATIVE_AWAITING_SUBMIT,
    DealStage.CREATIVE_AWAITING_FOR_CHANGES,
    DealStage.CREATIVE_AWAITING_CONFIRM,
    DealStage.SCHEDULING_AWAITING_SUBMIT,
    DealStage.SCHEDULE_AWAITING_FOR_CHANGES,
    DealStage.SCHEDULING_AWAITING_CONFIRM,
    DealStage.PAYMENT_AWAITING,
    DealStage.PAYMENT_PARTIALLY_PAID,
  ],
  active: [DealStage.POST_SCHEDULED, DealStage.POSTED_VERIFYING],
  completed: [DealStage.FINALIZED],
};
