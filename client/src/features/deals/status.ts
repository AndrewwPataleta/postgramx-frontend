import { DealStatus } from "@/models/enums";
import type { DealEntity } from "./model/types";

export type DealTab = "active" | "pending" | "completed";

export const getDealCategory = (deal: DealEntity): DealTab => {
  switch (deal.status) {
    case DealStatus.Active:
      return "active";
    case DealStatus.Completed:
      return "completed";
    case DealStatus.Pending:
    case DealStatus.Canceled:
    default:
      return "pending";
  }
};
