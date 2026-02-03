import { useEffect, useState, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  predealsCancel,
  predealsGet,
  type PreDealDto,
} from "@/api/features/predealsApi";
import ErrorState from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/api/errors";
import { formatStatusLabel } from "@/lib/formatting";
import { openTelegramLink } from "@/lib/telegramLinks";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";
import { PREDEAL_STATUS, type PredealStatus } from "@/constants/deals";
import { ROUTES } from "@/constants/routes";

const STATUS_STYLES: Record<PredealStatus, string> = {
  [PREDEAL_STATUS.AWAITING_CREATIVE]: "border-border/60 bg-secondary/40 text-muted-foreground",
  [PREDEAL_STATUS.AWAITING_CONFIRMATION]:
    "border-border/60 bg-secondary/40 text-muted-foreground",
  [PREDEAL_STATUS.AWAITING_ADMIN_APPROVAL]:
    "border-border/60 bg-secondary/40 text-muted-foreground",
  [PREDEAL_STATUS.READY_FOR_PAYMENT]: "border-success/30 bg-success/15 text-success",
  [PREDEAL_STATUS.REJECTED]: "border-destructive/30 bg-destructive/15 text-destructive",
  [PREDEAL_STATUS.EXPIRED]: "border-destructive/30 bg-destructive/15 text-destructive",
  [PREDEAL_STATUS.CANCELED]: "border-destructive/30 bg-destructive/15 text-destructive",
};

const TERMINAL_STATUSES = new Set<PredealStatus>([
  PREDEAL_STATUS.READY_FOR_PAYMENT,
  PREDEAL_STATUS.REJECTED,
  PREDEAL_STATUS.EXPIRED,
  PREDEAL_STATUS.CANCELED,
]);

const formatDuration = (totalSeconds: number) => {
  const clampedSeconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(clampedSeconds / 3600);
  const minutes = Math.floor((clampedSeconds % 3600) / 60);
  const seconds = clampedSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};

const formatPredealStatusLabel = (status?: string) =>
  formatStatusLabel(status) || "Awaiting update";

const StepCard = ({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn("rounded-2xl border border-border/60 bg-card/80 p-4 space-y-3", className)}>
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold text-muted-foreground">Step</span>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
    {children}
  </div>
);

export default function PreDealStatus() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());
  const { t } = useLanguage();

  const predealQuery = useQuery({
    queryKey: ["predeal", id],
    queryFn: () => predealsGet({ id: id ?? "" }),
    enabled: Boolean(id),
    refetchInterval: (query) => {
      const status = (query.state.data as PreDealDto | undefined)?.status;
      if (!status) {
        return 4000;
      }
      return TERMINAL_STATUSES.has(status) ? false : 4000;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: predealsCancel,
    onSuccess: () => {
      toast.success("Pre-deal canceled");
      navigate(ROUTES.MARKETPLACE, { replace: true });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to cancel pre-deal", t));
    },
  });

  useEffect(() => {
    if (predealQuery.error) {
      toast.error(getErrorMessage(predealQuery.error, "Unable to load pre-deal", t));
    }
  }, [predealQuery.error, t]);

  useEffect(() => {
    if (!predealQuery.data?.paymentExpiresAt) {
      return;
    }
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [predealQuery.data?.paymentExpiresAt]);

  if (!id) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <PageContainer className="py-6">
          <ErrorState
            message="Pre-deal not found"
            description="Return to the marketplace to choose a listing."
            onRetry={() => navigate(ROUTES.MARKETPLACE)}
          />
        </PageContainer>
      </div>
    );
  }

  if (predealQuery.isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <PageContainer className="py-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
          <div className="space-y-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-36 w-full" />
          </div>
        </PageContainer>
      </div>
    );
  }

  if (predealQuery.isError || !predealQuery.data) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <PageContainer className="py-6">
          <ErrorState
            message="Unable to load pre-deal"
            description="We could not fetch the latest status."
            onRetry={() => predealQuery.refetch()}
          />
        </PageContainer>
      </div>
    );
  }

  const predeal = predealQuery.data;
  const statusLabel = formatPredealStatusLabel(predeal.status);
  const statusClass = STATUS_STYLES[predeal.status] ?? "border-border/60 bg-secondary/40 text-muted-foreground";
  const isReadyForPayment = predeal.status === PREDEAL_STATUS.READY_FOR_PAYMENT;
  const expiresAt = predeal.paymentExpiresAt ? new Date(predeal.paymentExpiresAt) : null;
  const secondsRemaining = expiresAt ? (expiresAt.getTime() - now) / 1000 : null;
  const timeLeftLabel =
    secondsRemaining != null
      ? secondsRemaining > 0
        ? formatDuration(secondsRemaining)
        : "Payment window expired"
      : null;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="py-6 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Pre-deal status</p>
          <h1 className="text-xl font-semibold text-foreground">Send your post to the bot</h1>
        </div>

        <StepCard title="Send post to bot">
          <p className="text-sm text-foreground">
            {predeal.botInstructions?.message ?? "Open the bot and send your post for review."}
          </p>
          {predeal.botInstructions?.startUrl ? (
            <button
              type="button"
              onClick={() => openTelegramLink(predeal.botInstructions?.startUrl ?? "")}
              className="w-full rounded-lg border border-border/60 bg-secondary/40 px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-border"
            >
              Open bot
            </button>
          ) : null}
        </StepCard>

        <StepCard title="Wait for approvals">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className={cn(
                "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
                statusClass
              )}
            >
              {statusLabel}
            </span>
            <button
              type="button"
              onClick={() => predealQuery.refetch()}
              className="rounded-lg border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:border-border"
            >
              Refresh
            </button>
          </div>
          <p className="text-xs text-muted-foreground">
            We will keep checking for status updates every few seconds.
          </p>
        </StepCard>

        <StepCard title="Payment">
          {isReadyForPayment ? (
            <div className="space-y-3">
              {timeLeftLabel ? (
                <p className="text-xs text-muted-foreground">
                  Payment window: <span className="font-semibold text-foreground">{timeLeftLabel}</span>
                </p>
              ) : null}
              {predeal.payment?.escrowAddress ? (
                <div className="rounded-lg border border-border/60 bg-background px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">Escrow address</p>
                  <p className="text-xs font-semibold text-foreground break-all">
                    {predeal.payment.escrowAddress}
                  </p>
                </div>
              ) : null}
              {predeal.payment?.expectedAmountNano ? (
                <div className="rounded-lg border border-border/60 bg-background px-3 py-2">
                  <p className="text-[11px] text-muted-foreground">Amount (nano)</p>
                  <p className="text-xs font-semibold text-foreground">
                    {predeal.payment.expectedAmountNano}
                  </p>
                </div>
              ) : null}
              <button
                type="button"
                onClick={() => navigate(ROUTES.ESCROW(predeal.id))}
                className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Open Mini App Payment
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Payment details will appear once the post is approved.
            </p>
          )}
        </StepCard>

        <button
          type="button"
          onClick={() => cancelMutation.mutate({ id: predeal.id })}
          disabled={cancelMutation.isPending}
          className="w-full rounded-lg border border-border/60 bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition hover:border-border disabled:opacity-60"
        >
          {cancelMutation.isPending ? "Canceling..." : "Cancel pre-deal"}
        </button>
      </PageContainer>
    </div>
  );
}
