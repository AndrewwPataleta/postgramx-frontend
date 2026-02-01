import "./global.css";

import { createRoot } from "react-dom/client";
import { useEffect, useRef, useState } from "react";
import { BrowserRouter, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TelegramProvider, useTelegramContext } from "@/components/telegram/TelegramProvider";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { WalletProvider } from "@/contexts/WalletContext";
import { getTelegramWebApp } from "@/lib/telegram";
import { createQueryClient } from "@/lib/reactQuery/queryClient";
import { AppRoutes } from "@/routes";

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
      if (window.Telegram?.WebApp?.HapticFeedback && webApp?.HapticFeedback) {
        webApp.HapticFeedback.impactOccurred?.("light");
      }
    }

    lastPathRef.current = location.pathname;
  }, [location.pathname, webAppDetected]);

  return null;
};

const AppRoot = () => {
  const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;
  const [queryClient] = useState(() => createQueryClient());

  return (
    <BrowserRouter>
      <TonConnectUIProvider manifestUrl={manifestUrl}>
        <WalletProvider>
          <TelegramProvider>
            <AuthProvider>
              <QueryClientProvider client={queryClient}>
                <LanguageProvider>
                  <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <NavigationHaptics />
                    <AppRoutes />
                  </TooltipProvider>
                </LanguageProvider>
              </QueryClientProvider>
            </AuthProvider>
          </TelegramProvider>
        </WalletProvider>
      </TonConnectUIProvider>
    </BrowserRouter>
  );
};

createRoot(document.getElementById("root")!).render(<AppRoot />);
