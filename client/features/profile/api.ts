import type { ProfileOverview, WalletBalance } from "./types";
import { postJson } from "@/api/core/apiClient";
import { buildAuthBody, requireInitDataToken } from "@/api/core/authEnvelope";

export const getProfileOverview = async (): Promise<ProfileOverview> => {
  const token = requireInitDataToken();
  return postJson("/profile", buildAuthBody({}, token));
};

export const getBalance = async (): Promise<WalletBalance> => {
  const token = requireInitDataToken();
  return postJson("/profile/balance", buildAuthBody({}, token));
};

export const profileApi = {
  getProfileOverview,
  getBalance,
};
