import { Component, type ErrorInfo, type ReactNode } from "react";
import { LanguageContext } from "@/i18n/LanguageProvider";
import type { TranslationKey } from "@/i18n/translations";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };
  static contextType = LanguageContext;
  declare context: React.ContextType<typeof LanguageContext>;

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("AppShell error boundary caught an error", error, info);
  }

  render() {
    if (this.state.hasError) {
      const t = this.context?.t ?? ((key: TranslationKey) => key);
      return (
        <div className="flex min-h-[60vh] items-center justify-center px-6 text-center">
          <div className="space-y-2">
            <h2 className="text-base font-semibold text-foreground">
              {t("errors.genericTitle")}
            </h2>
            <p className="text-sm text-muted-foreground">
              {t("errors.genericSubtitle")}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
