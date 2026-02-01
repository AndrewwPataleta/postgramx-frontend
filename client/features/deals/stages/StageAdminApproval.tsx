import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import InfoCard from "@/components/deals/InfoCard";
import type { DealListItem } from "@/types/deals";
import {
  approveCreative,
  rejectCreative,
  requestCreativeEdits,
} from "@/api/features/deals/deals.api";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";
import { dealsQueryKeys } from "@/features/deals/hooks/useDeals";

interface StageAdminApprovalProps {
  deal: DealListItem;
  readonly: boolean;
  onAction?: {
    onApprove?: () => Promise<void> | void;
    onRequestChanges?: () => Promise<void> | void;
    onReject?: () => Promise<void> | void;
  };
}

const formatAdminCountdown = (deadline: string | null | undefined) => {
  if (!deadline) {
    return null;
  }
  const deadlineMs = new Date(deadline).getTime();
  if (Number.isNaN(deadlineMs)) {
    return null;
  }
  const diff = Math.max(0, deadlineMs - Date.now());
  const hours = Math.floor(diff / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);
  const seconds = Math.floor((diff % 60_000) / 1000);
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

export default function StageAdminApproval({
  deal,
  readonly,
  onAction,
}: StageAdminApprovalProps) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const [countdown, setCountdown] = useState<string | null>(() =>
    formatAdminCountdown(deal.adminReviewDeadlineAt)
  );

  useEffect(() => {
    if (!deal.adminReviewDeadlineAt) {
      setCountdown(null);
      return;
    }
    const updateCountdown = () => {
      setCountdown(formatAdminCountdown(deal.adminReviewDeadlineAt));
    };
    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [deal.adminReviewDeadlineAt]);

  const approveMutation = useMutation({
    mutationFn: async () => {
      return approveCreative({ dealId: deal.id });
    },
    onSuccess: () => {
      toast.success(t("deals.stage.adminApproval.approvedToast"));
      queryClient.invalidateQueries({ queryKey: dealsQueryKeys.detail(deal.id) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("deals.stage.adminApproval.approveError")));
    },
  });

  const requestChangesMutation = useMutation({
    mutationFn: async () => {
      return requestCreativeEdits({ dealId: deal.id });
    },
    onSuccess: () => {
      toast.success(t("deals.stage.adminApproval.requestedToast"));
      queryClient.invalidateQueries({ queryKey: dealsQueryKeys.detail(deal.id) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("deals.stage.adminApproval.requestError")));
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async () => {
      return rejectCreative({ dealId: deal.id });
    },
    onSuccess: () => {
      toast.success(t("deals.stage.adminApproval.rejectedToast"));
      queryClient.invalidateQueries({ queryKey: dealsQueryKeys.detail(deal.id) });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("deals.stage.adminApproval.rejectError")));
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
            approveMutation.isPending && "cursor-not-allowed opacity-60"
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
            requestChangesMutation.isPending && "cursor-not-allowed opacity-60"
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
            rejectMutation.isPending && "cursor-not-allowed opacity-60"
          )}
        >
          {t("common.reject")}
        </button>
      </div>
    </InfoCard>
  );
}
