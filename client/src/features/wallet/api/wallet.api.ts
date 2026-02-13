import { apiPost } from "@/api/core/http";

type SetWalletPayload = {
  tonAddress: string;
};

type SetWalletResponse = {
  success: boolean;
};

export const setWallet = async (tonAddress: string): Promise<SetWalletResponse> =>
  apiPost<SetWalletResponse, SetWalletPayload>("/users/wallet", { tonAddress });

export const walletApi = {
  setWallet,
};
