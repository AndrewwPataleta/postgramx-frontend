export * from "./api/deals.api";
export * from "./api/predeals.api";

import {
  approveCreative as approveCreativeRequest,
  createDeal,
  getDealDetail,
  listDeals,
  requestCreativeEdits,
} from "./api/deals.api";
import { apiPost } from "@/api/core/http";
import type { DealDetailResponse, DealEntity } from "@/models/entities";

export { createDeal };

export const getDeals = () => listDeals({});

export const getDeal = (id: string): Promise<DealEntity> =>
  getDealDetail({ id });

export const approveCreative = (id: string): Promise<DealDetailResponse> =>
  approveCreativeRequest({ id });

export const requestEdits = (id: string): Promise<DealDetailResponse> =>
  requestCreativeEdits({ id });

export const simulatePayment = (id: string): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, { id: string }>("/deals/simulate/payment", { id });

export const simulatePost = (id: string): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, { id: string }>("/deals/simulate/post", { id });

export const simulateVerifyPass = (id: string): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, { id: string }>("/deals/simulate/verify-pass", { id });

export const simulateVerifyFail = (id: string): Promise<DealDetailResponse> =>
  apiPost<DealDetailResponse, { id: string }>("/deals/simulate/verify-fail", { id });
