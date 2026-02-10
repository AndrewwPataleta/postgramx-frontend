import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageProvider";

interface ErrorStateProps {
  message?: string;
  description?: string;
  onRetry?: () => void;
}

const ErrorState = ({
  message,
  description,
  onRetry,
}: ErrorStateProps) => {
  const { t } = useLanguage();
  const resolvedMessage = message ?? t("errors.genericTitle");
  const resolvedDescription = description ?? t("errors.genericSubtitle");

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-6 text-center text-sm text-muted-foreground">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle size={20} />
      </div>
      <p className="text-sm font-semibold text-foreground">{resolvedMessage}</p>
      <p className="mt-1 text-xs text-muted-foreground">{resolvedDescription}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
        >
          {t("common.retry")}
        </button>
      ) : null}
    </div>
  );
};

export default ErrorState;
