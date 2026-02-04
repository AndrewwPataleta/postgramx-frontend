import { useQuery } from "@tanstack/react-query";
import { getUserWallet } from "@/api/walletApi";

export const useUserWallet = () => {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: () => getUserWallet(),
    refetchOnWindowFocus: false,
  });
};
