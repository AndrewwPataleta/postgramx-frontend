import { apiPost } from "@/api/core/http";

export type UserWalletResponse = {
  tonAddress: string | null;
};

export type UserWalletSetRequest = {
  tonAddress: string;
};

export const getUserWallet = async (): Promise<UserWalletResponse> => {
  return apiPost<UserWalletResponse, Record<string, never>>("/users/wallet/get", {});
};

export const setUserWallet = async (
  data: UserWalletSetRequest
): Promise<UserWalletResponse> => {
  return apiPost<UserWalletResponse, UserWalletSetRequest>("/users/wallet/set", data);
};
