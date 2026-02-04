import { useQuery } from "@tanstack/react-query";
import { getEarningsByChannel, type EarningsByChannelRequest } from "@/api/paymentsEarningsApi";

export const useEarningsByChannel = (params: EarningsByChannelRequest) => {
  return useQuery({
    queryKey: ["earningsByChannel", params.page ?? 1, params.limit ?? 10],
    queryFn: () => getEarningsByChannel(params),
    refetchOnWindowFocus: false,
  });
};
