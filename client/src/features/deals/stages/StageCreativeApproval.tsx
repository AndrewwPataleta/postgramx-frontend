import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import InfoCard from "@/features/deals/ui/InfoCard";
import type { DealEntity } from "@/models/entities";
import {
  approveCreative,
  rejectCreative,
  requestCreativeEdits,
} from "@/api/features/dealsApi";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";
import { COUNTDOWN_TICK_MS, formatHmsCountdown } from "@/features/deals/time";

interface StageAdminApprovalProps {
  deal: DealEntity;
  readonly: boolean;
  onAction?: {
    onApprove?: () => Promise<void> | void;
    onRequestChanges?: () => Promise<void> | void;
    onReject?: () => Promise<void> | void;
  };
}

export default function StageCreativeApproval({
  deal,
  readonly,
  onAction,
}: StageAdminApprovalProps) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState<string | null>(() =>
    formatHmsCountdown(deal.idleExpiresAt),
  );

  useEffect(() => {
    if (!deal.idleExpiresAt) {
      setCountdown(null);
      return;
    }
    const updateCountdown = () => {
      setCountdown(formatHmsCountdown(deal.idleExpiresAt));
    };
    updateCountdown();
    const interval = window.setInterval(updateCountdown, COUNTDOWN_TICK_MS);
    return () => window.clearInterval(interval);
  }, [deal.idleExpiresAt]);

  const approveMutation = useMutation({
    mutationFn: async () => {
      return approveCreative({ id: deal.id });
    },
    onSuccess: () => {
      toast.success(t("deals.stage.adminApproval.approvedToast"));
      queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, t("deals.stage.adminApproval.approveError"), t),
      );
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: async () => {
      return requestCreativeEdits({ id: deal.id });
    },
    onSuccess: () => {
      toast.success(t("deals.stage.adminApproval.requestedToast"));
      queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, t("deals.stage.adminApproval.requestError"), t),
      );
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      return rejectCreative({ id: deal.id });
    },
    onSuccess: () => {
      toast.success(t("deals.stage.adminApproval.rejectedToast"));
      queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });
    },
    onError: (error) => {
      toast.error(
        getErrorMessage(error, t("deals.stage.adminApproval.rejectError"), t),
      );
    },
  });

  if (readonly) {
    return (
      <InfoCard title={t("deals.stage.adminApproval.title")}>
        <p className="text-xs text-muted-foreground">
          {t("deals.stage.adminApproval.readonly")}
        </p>
        {countdown ? (
          <p className="text-xs text-muted-foreground">
            {t("deals.stage.adminApproval.timeLeft", { time: countdown })}
          </p>
        ) : null}
      </InfoCard>
    );
  }

  const handleApprove = () => {
    if (onAction?.onApprove) {
      onAction.onApprove();
      return;
    }
    approveMutation.mutate();
  };

  const handleRequestChanges = () => {
    if (onAction?.onRequestChanges) {
      onAction.onRequestChanges();
      return;
    }
    requestChangesMutation.mutate();
  };

  const handleReject = () => {
    if (onAction?.onReject) {
      onAction.onReject();
      return;
    }
    rejectMutation.mutate();
  };

  return (
    <InfoCard title={t("deals.stage.adminApproval.title")}>
      <p className="text-xs text-muted-foreground">
        {t("deals.stage.adminApproval.description")}
      </p>
      {countdown ? (
        <p className="text-xs text-muted-foreground">
          {t("deals.stage.adminApproval.timeLeft", { time: countdown })}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleApprove}
          disabled={approveMutation.isPending}
          className={cn(
            "rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground",
            approveMutation.isPending && "cursor-not-allowed opacity-60",
          )}
        >
          {t("common.approve")}
        </button>
        <button
          type="button"
          onClick={handleRequestChanges}
          disabled={requestChangesMutation.isPending}
          className={cn(
            "rounded-lg border border-border/60 px-4 py-2 text-xs font-semibold text-foreground",
            requestChangesMutation.isPending && "cursor-not-allowed opacity-60",
          )}
        >
          {t("common.requestChanges")}
        </button>
        <button
          type="button"
          onClick={handleReject}
          disabled={rejectMutation.isPending}
          className={cn(
            "rounded-lg border border-border/60 px-4 py-2 text-xs font-semibold text-foreground",
            rejectMutation.isPending && "cursor-not-allowed opacity-60",
          )}
        >
          {t("common.reject")}
        </button>
      </div>
    </InfoCard>
  );
}
