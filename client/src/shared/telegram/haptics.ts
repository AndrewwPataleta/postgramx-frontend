import { getTelegramWebApp } from "./webApp";

export const lightImpact = () => getTelegramWebApp()?.HapticFeedback?.impactOccurred?.("light");
