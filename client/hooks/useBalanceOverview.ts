import { useQuery } from "@tanstack/react-query";
import { getBalanceOverview } from "@/api/paymentsBalanceApi";

export const useBalanceOverview = () => {
  return useQuery({
    queryKey: ["balanceOverview"],
    queryFn: () => getBalanceOverview(),
    refetchInterval: 15_000,
    refetchOnWindowFocus: false,
  });
};
