import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createDeal, getDealDetail, listDealsGrouped } from "@/api/features/deals/deals.api";
import type {
  CreateDealRequestData,
  CreateDealResponse,
  DealListItem,
  DealsListRequestData,
  DealsListResponse,
} from "@/api/features/deals/deals.types";
import { getTelegramWebApp } from "@/lib/telegram";
import { ROUTES } from "@/constants/routes";

export const dealsQueryKeys = {
  all: ["deals"] as const,
  list: (params: DealsListRequestData) => ["deals", "list", params] as const,
  detail: (dealId: string) => ["deals", "detail", dealId] as const,
};

export const useDealsListQuery = (
  params: DealsListRequestData,
  options?: { enabled?: boolean; staleTime?: number }
) =>
  useQuery<DealsListResponse>({
    queryKey: dealsQueryKeys.list(params),
    queryFn: () => listDealsGrouped(params),
    staleTime: options?.staleTime ?? 20_000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });

export const useDealDetailQuery = (
  dealId?: string,
  options?: { refetchInterval?: number; initialData?: DealListItem }
) =>
  useQuery({
    queryKey: dealId ? dealsQueryKeys.detail(dealId) : dealsQueryKeys.detail("unknown"),
    queryFn: () => {
      if (!dealId) {
        throw new Error("Missing deal id");
      }
      return getDealDetail({ dealId });
    },
    enabled: Boolean(dealId),
    initialData: options?.initialData,
    refetchInterval: options?.refetchInterval ?? 10000,
  });

export const useCreateDealMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<CreateDealResponse, Error, CreateDealRequestData>({
    mutationFn: (payload) => createDeal(payload),
    onSuccess: () => {
      toast.success("Deal created");
      const webApp = getTelegramWebApp();
      webApp?.HapticFeedback?.notificationOccurred?.("success");
      queryClient.invalidateQueries({ queryKey: dealsQueryKeys.all });
      navigate(ROUTES.DEALS, { state: { activeTab: "pending" }, replace: true });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
