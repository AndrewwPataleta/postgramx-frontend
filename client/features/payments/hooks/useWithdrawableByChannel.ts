import { useQuery } from "@tanstack/react-query";
import { listWithdrawableByChannel } from "@/api/features/payments/payments.api";

export const withdrawableQueryKeys = {
  all: ["payments", "payouts"] as const,
  byQuery: (q?: string) => ["payments", "payouts", q ?? ""] as const,
};

export const useWithdrawableByChannel = (query?: string) =>
  useQuery({
    queryKey: withdrawableQueryKeys.byQuery(query),
    queryFn: () => listWithdrawableByChannel(query ? { q: query } : {}),
    refetchOnWindowFocus: false,
  });
