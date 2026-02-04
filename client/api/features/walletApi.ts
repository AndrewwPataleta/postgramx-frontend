import { apiPost } from "@/api/core/http";

type SetWalletPayload = {
  walletAddress: string;
};

type SetWalletResponse = {
  success: boolean;
};

export const setWallet = async (walletAddress: string): Promise<SetWalletResponse> =>
  apiPost<SetWalletResponse, SetWalletPayload>("/wallet/set", { walletAddress });

export const walletApi = {
  setWallet,
};
