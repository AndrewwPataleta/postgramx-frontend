import { useMutation, useQuery } from "@tanstack/react-query";
import { cancelPreDeal, getPreDeal } from "@/api/features/deals/deals.api";

export const preDealQueryKeys = {
  detail: (id: string) => ["deals", "predeal", id] as const,
};

export const usePreDealQuery = (id?: string) =>
  useQuery({
    queryKey: id ? preDealQueryKeys.detail(id) : preDealQueryKeys.detail("unknown"),
    queryFn: () => {
      if (!id) {
        throw new Error("Missing pre-deal id");
      }
      return getPreDeal({ id });
    },
    enabled: Boolean(id),
  });

export const useCancelPreDeal = () =>
  useMutation({
    mutationFn: (id: string) => cancelPreDeal({ id }),
  });
