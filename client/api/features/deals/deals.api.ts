import { postJson } from "@/api/core/apiClient";
import { buildAuthBody, requireInitDataToken } from "@/api/core/authEnvelope";
import type {
  CreateDealRequestData,
  CreateDealResponse,
  DealDetailRequestData,
  DealListItem,
  DealsListRequestData,
  DealsListResponse,
  DealScheduleRequestData,
  DealPaymentWindowRequestData,
  DealCreativeSubmitRequestData,
  DealCreativeApproveRequestData,
  DealCreativeEditsRequestData,
  DealCreativeRejectRequestData,
  DealCancelRequestData,
  PreDealDto,
  PreDealCreateRequestData,
  PreDealGetRequestData,
  PreDealCancelRequestData,
} from "./deals.types";

const withAuth = <T>(data: T) => buildAuthBody(data, requireInitDataToken());

export const createDeal = async (data: CreateDealRequestData): Promise<CreateDealResponse> =>
  postJson("/deals/create", withAuth(data));

export const listDealsGrouped = async (
  data: DealsListRequestData
): Promise<DealsListResponse> => postJson("/deals/list", withAuth(data));

export const getDealDetail = async (data: DealDetailRequestData): Promise<DealListItem> =>
  postJson("/deals/detail", withAuth(data));

export const scheduleDeal = async (data: DealScheduleRequestData): Promise<void> => {
  await postJson("/deals/schedule", withAuth(data));
};

export const setPaymentWindow = async (data: DealPaymentWindowRequestData): Promise<void> => {
  await postJson("/deals/payment-window", withAuth(data));
};

export const submitCreative = async (data: DealCreativeSubmitRequestData): Promise<void> => {
  await postJson("/deals/creative/submit", withAuth(data));
};

export const approveCreative = async (data: DealCreativeApproveRequestData): Promise<void> => {
  await postJson("/deals/creative/approve", withAuth(data));
};

export const requestCreativeEdits = async (data: DealCreativeEditsRequestData): Promise<void> => {
  await postJson("/deals/creative/edits", withAuth(data));
};

export const rejectCreative = async (data: DealCreativeRejectRequestData): Promise<void> => {
  await postJson("/deals/creative/reject", withAuth(data));
};

export const cancelDeal = async (data: DealCancelRequestData): Promise<void> => {
  await postJson("/deals/cancel", withAuth(data));
};

export const createPreDeal = async (data: PreDealCreateRequestData): Promise<PreDealDto> =>
  postJson("/predeals/create", withAuth(data));

export const getPreDeal = async (data: PreDealGetRequestData): Promise<PreDealDto> =>
  postJson("/predeals/get", withAuth(data));

export const cancelPreDeal = async (data: PreDealCancelRequestData): Promise<void> => {
  await postJson("/predeals/cancel", withAuth(data));
};
