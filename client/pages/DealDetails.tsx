import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import DealHeaderCard from "@/components/deals/DealHeaderCard";
import StageTimeline from "@/components/deals/StageTimeline";
import { getDealDetail, listDeals } from "@/api/features/dealsApi";
import { toast } from "sonner";
import LoadingSkeleton from "@/components/feedback/LoadingSkeleton";
import ErrorState from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { getErrorMessage } from "@/lib/api/errors";
import { DealStage, DealStatus } from "@/models/enums";
import type { DealEntity } from "@/models/entities";
import StageScheduleTime from "@/features/deals/stages/StageScheduleTime";
import StageSendPost from "@/features/deals/stages/StageSendPost";
import StagePayment from "@/features/deals/stages/StagePayment";
import StagePaymentPending from "@/features/deals/stages/StagePaymentPending";
import StageVerifying from "@/features/deals/stages/StageVerifying";
import StageDone from "@/features/deals/stages/StageDone";
import { useAuth } from "@/components/auth/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import InfoCard from "@/components/deals/InfoCard";
import { getCurrentStep, getStepState, orderedSteps, type StepId } from "@/features/deals/stage-ui";

export default function DealDetails() {
  const { dealId } = useParams<{ dealId: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useLanguage();
  const stateDeal = (location.state as { deal?: DealEntity } | null)?.deal;
  const cachedDeal = dealId ? queryClient.getQueryData<DealEntity>(["deal", dealId]) : undefined;
  const preferredDeal = stateDeal?.id === dealId ? stateDeal : cachedDeal;
  const [selectedStep, setSelectedStep] = useState<StepId | null>(null);

  const {
    data: deal,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["deal", dealId],
    queryFn: async () => {
      if (!dealId) {
        throw new Error("Missing deal id");
      }
      return getDealDetail(dealId);
    },
    enabled: Boolean(dealId),
    initialData: preferredDeal,
    refetchInterval: (data) => {
      if (!data) {
        return false;
      }
      if (data.status === DealStatus.Completed || data.status === DealStatus.Canceled) {
        return false;
      }
      return 10000;
    },
  });

  const fallbackListQuery = useQuery({
    queryKey: ["deals", "list", "detail-fallback", dealId],
    queryFn: () =>
      listDeals({
        role: "all",
        pendingLimit: 20,
        activeLimit: 20,
        completedLimit: 20,
      }),
    enabled: Boolean(dealId) && !deal,
    staleTime: 20_000,
  });

  const fallbackDeal = useMemo(() => {
    if (!fallbackListQuery.data || !dealId) {
      return null;
    }
    const allDeals = [
      ...fallbackListQuery.data.pending.items,
      ...fallbackListQuery.data.active.items,
      ...fallbackListQuery.data.completed.items,
    ];
    return allDeals.find((entry) => entry.id === dealId) ?? null;
  }, [dealId, fallbackListQuery.data]);

  const resolvedDeal = deal ?? fallbackDeal;

  useEffect(() => {
    if (error || fallbackListQuery.error) {
      toast.error(getErrorMessage(error ?? fallbackListQuery.error, "Unable to load deal"));
    }
  }, [error, fallbackListQuery.error]);

  const currentStep = resolvedDeal ? getCurrentStep(resolvedDeal.stage) : orderedSteps[0];

  useEffect(() => {
    if (!resolvedDeal) {
      return;
    }
    setSelectedStep(getCurrentStep(resolvedDeal.stage));
  }, [resolvedDeal?.stage]);

  const stagePanel = useMemo(() => {
    if (!resolvedDeal) {
      return null;
    }
    const currentUserId = (user as { id?: string } | null)?.id;
    const isAdvertiser = currentUserId && currentUserId === resolvedDeal.advertiserUserId;
    const readonlyForPublisher = !isAdvertiser;
    const activeStep = selectedStep ?? currentStep;
    const isViewOnly = activeStep !== currentStep;
    const latestCreative = resolvedDeal.creatives.reduce<DealEntity["creatives"][number] | null>(
      (latest, creative) => {
        if (!latest) {
          return creative;
        }
        if (creative.version > latest.version) {
          return creative;
        }
        const latestDate = new Date(latest.createdAt).getTime();
        const currentDate = new Date(creative.createdAt).getTime();
        return currentDate > latestDate ? creative : latest;
      },
      null
    );

    if (activeStep === "CREATIVE") {
      const canSubmit =
        isAdvertiser &&
        !isViewOnly &&
        (resolvedDeal.stage === DealStage.CreativePending ||
          resolvedDeal.stage === DealStage.CreativeChangesRequested);
      return (
        <StageSendPost
          deal={resolvedDeal}
          readonly={!isAdvertiser || isViewOnly}
          variant={
            resolvedDeal.stage === DealStage.CreativeChangesRequested ? "changesRequested" : "pending"
          }
          showSubmit={canSubmit}
          adminComment={latestCreative?.adminComment}
        />
      );
    }

    if (activeStep === "ADMIN_REVIEW") {
      const reviewText =
        resolvedDeal.stage === DealStage.CreativeSubmitted
          ? t("deals.stage.adminReview.pending")
          : t("deals.stage.adminReview.completed");
      return (
        <InfoCard title={t("deals.stage.adminReview.title")}>
          <p className="text-xs text-muted-foreground">
            {reviewText}
          </p>
        </InfoCard>
      );
    }

    if (activeStep === "SCHEDULE") {
      const canEditSchedule =
        isAdvertiser && !isViewOnly && resolvedDeal.stage === DealStage.CreativeApproved;
      return <StageScheduleTime deal={resolvedDeal} readonly={!canEditSchedule} />;
    }

    if (activeStep === "PAYMENT") {
      const paymentReadonly = readonlyForPublisher || isViewOnly;
      if (resolvedDeal.stage === DealStage.PaymentPending) {
        return (
          <StagePaymentPending
            deal={resolvedDeal}
            readonly={paymentReadonly}
            onAction={paymentReadonly ? undefined : { onRefresh: () => refetch() }}
            isRefreshing={isFetching}
          />
        );
      }
      if (resolvedDeal.stage === DealStage.Scheduled) {
        return (
          <StagePayment
            deal={resolvedDeal}
            readonly={paymentReadonly}
            onAction={paymentReadonly ? undefined : { onRefresh: () => refetch() }}
            isRefreshing={isFetching}
          />
        );
      }
      return (
        <InfoCard title={t("deals.stage.payment.title")}>
          <p className="text-xs text-muted-foreground">
            {t("deals.stage.payment.completed")}
          </p>
        </InfoCard>
      );
    }

    if (activeStep === "PUBLISH") {
      const publicationText =
        resolvedDeal.stage === DealStage.Paid
          ? t("deals.stage.publication.waiting")
          : t("deals.stage.publication.published");
      return (
        <InfoCard title={t("deals.stage.publication.title")}>
          <p className="text-xs text-muted-foreground">{publicationText}</p>
        </InfoCard>
      );
    }

    if (activeStep === "VERIFY") {
      if (resolvedDeal.stage === DealStage.Completed) {
        return <StageDone deal={resolvedDeal} readonly={readonlyForPublisher} />;
      }
      return <StageVerifying deal={resolvedDeal} readonly={readonlyForPublisher} />;
    }

    return null;
  }, [currentStep, isFetching, refetch, resolvedDeal, selectedStep, t, user]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="py-6 space-y-4">
        {isLoading ? (
          <LoadingSkeleton items={3} />
        ) : error || fallbackListQuery.error || !resolvedDeal ? (
          <ErrorState
            message={getErrorMessage(error ?? fallbackListQuery.error, t("deals.detailNotFound"))}
            description={t("deals.detailLoadHint")}
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <DealHeaderCard deal={resolvedDeal} />

            <StageTimeline
              steps={orderedSteps}
              selectedStep={selectedStep ?? currentStep}
              currentStage={resolvedDeal.stage}
              onSelect={(step) => {
                if (!resolvedDeal) {
                  return;
                }
                if (getStepState(step, resolvedDeal.stage) !== "locked") {
                  setSelectedStep(step);
                }
              }}
            />

            {stagePanel}
          </>
        )}
      </PageContainer>
    </div>
  );
}
