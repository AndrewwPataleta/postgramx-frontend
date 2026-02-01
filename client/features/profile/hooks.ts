import { useQuery } from "@tanstack/react-query";
import { getBalance, getProfileOverview } from "@/api/features/profileApi";

const profileKeys = {
  all: ["profile"] as const,
  overview: () => ["profile", "overview"] as const,
  balance: () => ["profile", "balance"] as const,
};

const profileEndpointEnabled = false;

export const useProfile = () =>
  useQuery({
    queryKey: profileKeys.overview(),
    queryFn: getProfileOverview,
    enabled: profileEndpointEnabled,
    retry: false,
  });

export const useBalance = () =>
  useQuery({
    queryKey: profileKeys.balance(),
    queryFn: getBalance,
    enabled: profileEndpointEnabled,
    retry: false,
  });

export const profileQueryKeys = profileKeys;
