import { TELEGRAM_MOCK } from "@/config/env";
import { getTelegramWebApp, mockTelegramAuth } from "@/lib/telegram";

export const getTelegramInitDataToken = (): string => {
  const webApp = getTelegramWebApp();
  const initData = webApp?.initData;

  if (initData && initData.trim().length > 0) {
    return initData;
  }
  if (TELEGRAM_MOCK) {
    return mockTelegramAuth.initData;
  }

  throw new Error("Telegram initData missing");
};
