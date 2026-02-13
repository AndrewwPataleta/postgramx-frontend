import type { PropsWithChildren } from "react";
import { LanguageProvider } from "@/i18n/LanguageProvider";

export const I18nProvider = ({ children }: PropsWithChildren) => (
  <LanguageProvider>{children}</LanguageProvider>
);
