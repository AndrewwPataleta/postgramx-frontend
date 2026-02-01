import { apiPost } from "@/api/core/http";
import type { ProfileOverview, WalletBalance } from "@/features/profile/types";

export const getProfileOverview = async (): Promise<ProfileOverview> =>
  apiPost<ProfileOverview, Record<string, never>>("/profile", {});

export const getBalance = async (): Promise<WalletBalance> =>
  apiPost<WalletBalance, Record<string, never>>("/profile/balance", {});
