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
import { allStages } from "@/features/deals/dealStageMachine";
import DealScheduleCard from "@/components/deals/DealScheduleCard";
import StageScheduleTime from "@/features/deals/stages/StageScheduleTime";
import StageSendPost from "@/features/deals/stages/StageSendPost";
import StageScheduleApproval from "@/features/deals/stages/StageScheduleApproval.tsx";
import StagePayment from "@/features/deals/stages/StagePayment";
import StagePaymentPending from "@/features/deals/stages/StagePaymentPending";
import StageScheduled from "@/features/deals/stages/StageScheduled";
import StageVerifying from "@/features/deals/stages/StageVerifying";
import StageDone from "@/features/deals/stages/StageDone";
import { useAuth } from "@/components/auth/AuthProvider";
import { stageOrder } from "@/models/helpers";
import { useLanguage } from "@/i18n/LanguageProvider";
import StageCreativeApproval from "@/features/deals/stages/StageCreativeApproval.tsx";

export default function DealDetails() {
  const { dealId } = useParams<{ dealId: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useLanguage();
  const stateDeal = (location.state as { deal?: DealEntity } | null)?.deal;
  const cachedDeal = dealId ? queryClient.getQueryData<DealEntity>(["deal", dealId]) : undefined;
  const preferredDeal = stateDeal?.id === dealId ? stateDeal : cachedDeal;
  const [selectedStage, setSelectedStage] = useState<DealStage | null>(null);

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
      return getDealDetail({ id: dealId });
    },
    enabled: Boolean(dealId),
    initialData: preferredDeal,
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

  const resolvedDeal = deal

  useEffect(() => {
    if (error || fallbackListQuery.error) {
      toast.error(getErrorMessage(error ?? fallbackListQuery.error, "Unable to load deal", t));
    }
  }, [error, fallbackListQuery.error]);

  const currentStage = resolvedDeal?.stage ?? DealStage.CREATIVE_AWAITING_SUBMIT;

  const availableStages = resolvedDeal ? allStages : [];

  useEffect(() => {
    if (!resolvedDeal) {
      return;
    }
    setSelectedStage(resolvedDeal.stage);
  }, [resolvedDeal?.stage]);

  useEffect(() => {
    if (!resolvedDeal || resolvedDeal.status === DealStatus.Completed || resolvedDeal.status === DealStatus.Canceled) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      refetch();
    }, 10000);
    return () => window.clearInterval(interval);
  }, [refetch, resolvedDeal]);

  const stagePanel = useMemo(() => {
    if (!resolvedDeal) {
      return null;
    }
    const currentUserId = (user as { id?: string } | null)?.id;
    const isAdvertiser = currentUserId === resolvedDeal.advertiserUserId;
    console.log('is averstired '+isAdvertiser)
    console.log('currentUserId '+currentUserId)
    console.log('deal.advertiserUserId '+resolvedDeal.advertiserUserId)
    console.log('stage is '+resolvedDeal.stage)
    const readonlyForPublisher = !isAdvertiser;
    const stageComponents: Record<DealStage, JSX.Element> = {

      [DealStage.CREATIVE_AWAITING_SUBMIT]: (
        <StageSendPost deal={resolvedDeal} readonly={!isAdvertiser} />
      ),
      [DealStage.CREATIVE_AWAITING_CONFIRM]: (
        <StageCreativeApproval deal={resolvedDeal} readonly={isAdvertiser} />
      ),
      [DealStage.PAYMENT_AWAITING]: (
        <StagePayment
          deal={resolvedDeal}
          readonly={readonlyForPublisher}
          onAction={readonlyForPublisher ? undefined : { onRefresh: () => refetch() }}
          isRefreshing={isFetching}
        />
      ),
      [DealStage.SCHEDULING_AWAITING_SUBMIT]: (
        <StageScheduleTime deal={resolvedDeal} readonly={!isAdvertiser} />
      ),

      [DealStage.SCHEDULING_AWAITING_CONFIRM]: (
        <StageScheduleApproval deal={resolvedDeal} readonly={isAdvertiser} />
      ),
/*

      [DealStage.PaymentPending]: (
        <StagePaymentPending
          deal={resolvedDeal}
          readonly={readonlyForPublisher}
          onAction={readonlyForPublisher ? undefined : { onRefresh: () => refetch() }}
          isRefreshing={isFetching}
        />
      ),
      [DealStage.Scheduled]: (
        <StageScheduled deal={resolvedDeal} readonly={readonlyForPublisher} />
      ),
      [DealStage.Verifying]: (
        <StageVerifying deal={resolvedDeal} readonly={readonlyForPublisher} />
      ),
      [DealStage.Done]: <StageDone deal={resolvedDeal} readonly={readonlyForPublisher} />,*/
    };

    return stageComponents[resolvedDeal.stage];
  }, [isFetching, refetch, resolvedDeal]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="py-6 space-y-4">
        {isLoading ? (
          <LoadingSkeleton items={3} />
        ) : error || fallbackListQuery.error || !resolvedDeal ? (
          <ErrorState
            message={getErrorMessage(error ?? fallbackListQuery.error, t("deals.detailNotFound"), t)}
            description={t("deals.detailLoadHint")}
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <DealHeaderCard deal={resolvedDeal} />
            <DealScheduleCard scheduledAt={resolvedDeal.scheduledAt} />

            <StageTimeline
              stages={availableStages}
              selectedStage={selectedStage ?? currentStage}
              currentStage={currentStage}
              onSelect={(stage) => {
                if (!resolvedDeal) {
                  return;
                }
                const currentIndex = stageOrder.indexOf(resolvedDeal.stage);
                const nextIndex = stageOrder.indexOf(stage);
                if (nextIndex <= currentIndex) {
                  setSelectedStage(stage);
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
