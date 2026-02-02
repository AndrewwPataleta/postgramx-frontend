import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createDeal, listDeals } from "@/api/features/dealsApi";
import { getTelegramWebApp } from "@/lib/telegram";
import { ROUTES } from "@/constants/routes";
import type { DealEntity } from "@/models/entities";

export const useDealsListQuery = (params: {
  role?: "all" | "advertiser" | "publisher";
  pendingPage?: number;
  pendingLimit?: number;
  activePage?: number;
  activeLimit?: number;
  completedPage?: number;
  completedLimit?: number;
}) =>
  useQuery({
    queryKey: [
      "deals",
      params.role ?? "all",
      params.pendingPage ?? 1,
      params.activePage ?? 1,
      params.completedPage ?? 1,
    ],
    queryFn: () => listDeals(params),
    staleTime: 20_000,
    refetchOnWindowFocus: false,
  });

export const useCreateDealMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation<DealEntity, Error, { listingId: string; brief?: string }>({
    mutationFn: (payload) => createDeal(payload),
    onSuccess: (deal) => {
      toast.success("Deal created");
      const webApp = getTelegramWebApp();
      webApp?.HapticFeedback?.notificationOccurred?.("success");
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      navigate(ROUTES.DEAL_DETAILS(deal.id), { state: { deal, dealRole: "advertiser" }, replace: true });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
