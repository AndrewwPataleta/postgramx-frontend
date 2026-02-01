import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import DealHeaderCard from "@/components/deals/DealHeaderCard";
import StageTimeline from "@/components/deals/StageTimeline";
import { toast } from "sonner";
import LoadingSkeleton from "@/components/feedback/LoadingSkeleton";
import ErrorState from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { getErrorMessage } from "@/lib/api/errors";
import { DEAL_ESCROW_STATUS } from "@/constants/deals";
import { USER_ROLE } from "@/constants/roles";
import type { DealListItem } from "@/types/deals";
import { allStages, getCurrentStage } from "@/features/deals/dealStageMachine";
import {
  dealsQueryKeys,
  useDealDetailQuery,
  useDealsListQuery,
} from "@/features/deals/hooks/useDeals";
import type { EscrowStatus } from "@/types/deals";
import StageScheduleTime from "@/features/deals/stages/StageScheduleTime";
import StageSendPost from "@/features/deals/stages/StageSendPost";
import StageAdminApproval from "@/features/deals/stages/StageAdminApproval";
import StagePayment from "@/features/deals/stages/StagePayment";
import StagePaymentPending from "@/features/deals/stages/StagePaymentPending";
import StageScheduled from "@/features/deals/stages/StageScheduled";
import StageVerifying from "@/features/deals/stages/StageVerifying";
import StageDone from "@/features/deals/stages/StageDone";

export default function DealDetails() {
  const { dealId } = useParams<{ dealId: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const stateDeal = (location.state as { deal?: DealListItem } | null)?.deal;
  const cachedDeal = dealId
    ? queryClient.getQueryData<DealListItem>(dealsQueryKeys.detail(dealId))
    : undefined;
  const preferredDeal = stateDeal?.id === dealId ? stateDeal : cachedDeal;

  const {
    data: deal,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useDealDetailQuery(dealId, { refetchInterval: 10000, initialData: preferredDeal });

  const fallbackListQuery = useDealsListQuery(
    {
      role: "all",
      pendingLimit: 20,
      activeLimit: 20,
      completedLimit: 20,
    },
    { enabled: Boolean(dealId) && !deal, staleTime: 20_000 }
  );

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

  const currentStage = resolvedDeal ? getCurrentStage(resolvedDeal.escrowStatus) : "SCHEDULE";
  const availableStages = resolvedDeal ? allStages : [];

  const stagePanel = useMemo(() => {
    if (!resolvedDeal) {
      return null;
    }
    const isAdvertiser = resolvedDeal.userRoleInDeal === USER_ROLE.ADVERTISER;
    const isPublisher =
      resolvedDeal.userRoleInDeal === USER_ROLE.PUBLISHER ||
      resolvedDeal.userRoleInDeal === USER_ROLE.PUBLISHER_MANAGER;
    const readonlyForPublisher = !isAdvertiser;

    const stageComponents: Record<EscrowStatus, JSX.Element> = {
      [DEAL_ESCROW_STATUS.SCHEDULING_PENDING]: (
        <StageScheduleTime deal={resolvedDeal} readonly={!isAdvertiser} />
      ),
      [DEAL_ESCROW_STATUS.CREATIVE_AWAITING_SUBMIT]: (
        <StageSendPost deal={resolvedDeal} readonly={!isAdvertiser} />
      ),
      [DEAL_ESCROW_STATUS.CREATIVE_AWAITING_ADMIN_REVIEW]: (
        <StageAdminApproval deal={resolvedDeal} readonly={!isPublisher} />
      ),
      [DEAL_ESCROW_STATUS.PAYMENT_AWAITING]: (
        <StagePayment
          deal={resolvedDeal}
          readonly={readonlyForPublisher}
          onAction={readonlyForPublisher ? undefined : { onRefresh: () => refetch() }}
          isRefreshing={isFetching}
        />
      ),
      [DEAL_ESCROW_STATUS.FUNDS_PENDING]: (
        <StagePaymentPending
          deal={resolvedDeal}
          readonly={readonlyForPublisher}
          onAction={readonlyForPublisher ? undefined : { onRefresh: () => refetch() }}
          isRefreshing={isFetching}
        />
      ),
      [DEAL_ESCROW_STATUS.FUNDS_CONFIRMED]: (
        <StageScheduled deal={resolvedDeal} readonly={readonlyForPublisher} />
      ),
      [DEAL_ESCROW_STATUS.APPROVED_SCHEDULED]: (
        <StageScheduled deal={resolvedDeal} readonly={readonlyForPublisher} />
      ),
      [DEAL_ESCROW_STATUS.POSTED_VERIFYING]: (
        <StageVerifying deal={resolvedDeal} readonly={readonlyForPublisher} />
      ),
      [DEAL_ESCROW_STATUS.COMPLETED]: <StageDone deal={resolvedDeal} readonly={readonlyForPublisher} />,
      [DEAL_ESCROW_STATUS.CANCELED]: <StageDone deal={resolvedDeal} readonly={readonlyForPublisher} />,
      [DEAL_ESCROW_STATUS.REFUNDED]: <StageDone deal={resolvedDeal} readonly={readonlyForPublisher} />,
      [DEAL_ESCROW_STATUS.DISPUTED]: <StageDone deal={resolvedDeal} readonly={readonlyForPublisher} />,
    };

    return stageComponents[resolvedDeal.escrowStatus];
  }, [isFetching, refetch, resolvedDeal]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="py-6 space-y-4">
        {isLoading ? (
          <LoadingSkeleton items={3} />
        ) : error || fallbackListQuery.error || !resolvedDeal ? (
          <ErrorState
            message={getErrorMessage(error ?? fallbackListQuery.error, "Deal not found")}
            description="We couldn't load this deal right now."
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <DealHeaderCard deal={resolvedDeal} />

            <StageTimeline
              stages={availableStages}
              selectedStage={currentStage}
              escrowStatus={resolvedDeal.escrowStatus}
            />

            {stagePanel}
          </>
        )}
      </PageContainer>
    </div>
  );
}
