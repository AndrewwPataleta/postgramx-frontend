import { getTelegramWebApp } from "@/lib/telegram";

export const getTelegramInitDataToken = (): string => {
  const webApp = getTelegramWebApp();
  const initData = webApp?.initData;

  if (initData && initData.trim().length > 0) {
    return initData;
  }

  throw new Error("Telegram initData missing");
};
