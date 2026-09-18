import { useState, type ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { TooltipProvider } from "@/design-system/ui/tooltip";
import { TelegramProvider } from "@/components/telegram/TelegramProvider";
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { AuthProvider } from "@/features/auth/ui/AuthProvider";
import { WalletProvider } from "@/contexts/WalletContext";
import { createQueryClient } from "@/shared/api/queryClient";
import { ThemeProvider } from "@/theme/ThemeProvider";

/**
 * Composes every app-wide provider in one place so App stays flat and the
 * provider order is explicit and easy to reason about.
 */
export const AppProviders = ({ children }: { children: ReactNode }) => {
  const manifestUrl = `${window.location.origin}/tonconnect-manifest.json`;
  const [queryClient] = useState(() => createQueryClient());

  return (
    <BrowserRouter>
      <ThemeProvider>
        <TonConnectUIProvider manifestUrl={manifestUrl}>
          <WalletProvider>
            <TelegramProvider>
              <AuthProvider>
                <QueryClientProvider client={queryClient}>
                  <LanguageProvider>
                    <TooltipProvider>{children}</TooltipProvider>
                  </LanguageProvider>
                </QueryClientProvider>
              </AuthProvider>
            </TelegramProvider>
          </WalletProvider>
        </TonConnectUIProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};
