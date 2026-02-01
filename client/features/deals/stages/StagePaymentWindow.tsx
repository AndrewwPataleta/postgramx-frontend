import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import InfoCard from "@/components/deals/InfoCard";
import type { DealListItem } from "@/types/deals";
import { setPaymentWindow } from "@/api/features/deals/deals.api";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";
import { dealsQueryKeys } from "@/features/deals/hooks/useDeals";

interface StagePaymentWindowProps {
  deal: DealListItem;
  readonly: boolean;
  onAction?: {
    onSetWindow?: (hours: number) => Promise<void> | void;
  };
}

const WINDOW_OPTIONS = [1, 2, 24];

const formatCountdown = (expiresAt: string | null | undefined, t: (key: string) => string) => {
  if (!expiresAt) {
    return null;
  }
  const expiry = new Date(expiresAt).getTime();
  if (Number.isNaN(expiry)) {
    return null;
  }
  const diff = Math.max(0, expiry - Date.now());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  return `${hours}${t("common.hoursShort")} ${minutes}${t("common.minutesShort")}`;
};

export default function StagePaymentWindow({ deal, readonly, onAction }: StagePaymentWindowProps) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [hours, setHours] = useState<number>(WINDOW_OPTIONS[0]);

  const mutation = useMutation({
    mutationFn: async () => {
      return setPaymentWindow({ dealId: deal.id, hours });
    },
    onSuccess: () => {
      toast.success(t("deals.stage.paymentWindow.updatedToast"));
      queryClient.invalidateQueries({ queryKey: dealsQueryKeys.detail(deal.id) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("deals.stage.paymentWindow.saveError")));
    },
  });

  const countdown = useMemo(
    () => formatCountdown(deal.escrowExpiresAt, t),
    [deal.escrowExpiresAt, t]
  );

  const handleSetWindow = () => {
    if (onAction?.onSetWindow) {
      onAction.onSetWindow(hours);
      return;
    }
    mutation.mutate();
  };

  return (
    <InfoCard title={t("deals.stage.paymentWindow.title")}>
      <p className="text-xs text-muted-foreground">
        {t("deals.stage.paymentWindow.description")}
      </p>
      <div className="flex flex-wrap gap-2">
        {WINDOW_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setHours(option)}
            disabled={readonly}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold",
              option === hours
                ? "border-primary/50 bg-primary/15 text-primary-foreground"
                : "border-border/60 bg-background/50 text-muted-foreground",
              readonly && "cursor-not-allowed opacity-60"
            )}
          >
            {t("deals.stage.paymentWindow.option", { hours: option })}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleSetWindow}
          disabled={readonly || mutation.isPending}
          className={cn(
            "rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition",
            readonly || mutation.isPending ? "cursor-not-allowed opacity-60" : "hover:bg-primary/90"
          )}
        >
          {t("deals.stage.paymentWindow.confirm")}
        </button>
        {countdown ? (
          <span className="text-xs text-muted-foreground">
            {t("deals.stage.paymentWindow.expiresIn", { time: countdown })}
          </span>
        ) : null}
      </div>
    </InfoCard>
  );
}
