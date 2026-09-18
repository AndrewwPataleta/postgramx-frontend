import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Toaster } from "@/design-system/ui/toaster";
import { Toaster as Sonner } from "@/design-system/ui/sonner";
import { useTelegramContext } from "@/components/telegram/TelegramProvider";
import { getTelegramWebApp } from "@/lib/telegram";
import { AppProviders } from "@/app/providers/AppProviders";
import { AppRoutes } from "@app/routes/index";

const NavigationHaptics = () => {
  const location = useLocation();
  const { webAppDetected } = useTelegramContext();
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    if (!webAppDetected) {
      lastPathRef.current = location.pathname;
      return;
    }

    if (lastPathRef.current && lastPathRef.current !== location.pathname) {
      const webApp = getTelegramWebApp();
      webApp?.HapticFeedback?.impactOccurred?.("light");
    }

    lastPathRef.current = location.pathname;
  }, [location.pathname, webAppDetected]);

  return null;
};

export const App = () => (
  <AppProviders>
    <Toaster />
    <Sonner />
    <NavigationHaptics />
    <AppRoutes />
  </AppProviders>
);
