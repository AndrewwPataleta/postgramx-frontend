import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getDealDetail, listDeals } from "@/api/features/dealsApi";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { allStages, normalizeDealStage } from "@/features/deals/dealStageMachine";
import StageCreativeApproval from "@/features/deals/stages/StageCreativeApproval";
import StageDone from "@/features/deals/stages/StageDone";
import StagePayment from "@/features/deals/stages/StagePayment";
import StageScheduled from "@/features/deals/stages/StageScheduled";
import StageScheduleApproval from "@/features/deals/stages/StageScheduleApproval";
import StageScheduleTime from "@/features/deals/stages/StageScheduleTime";
import StageSendPost from "@/features/deals/stages/StageSendPost";
import StageVerifying from "@/features/deals/stages/StageVerifying";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getErrorMessage } from "@/lib/api/errors";
import { DealStage, DealStatus } from "@/models/enums";
import type { DealEntity } from "@/models/entities";
import { canSelectDealStage } from "../model/selectors";

export const useDealDetailsViewModel = () => {
  const { dealId } = useParams<{ dealId: string }>();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { t } = useLanguage();
  const stateDeal = (location.state as { deal?: DealEntity } | null)?.deal;
  const cachedDeal = dealId ? queryClient.getQueryData<DealEntity>(["deal", dealId]) : undefined;
  const preferredDeal = stateDeal?.id === dealId ? stateDeal : cachedDeal;
  const [selectedStage, setSelectedStage] = useState<DealStage | null>(null);

  const detailQuery = useQuery({
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
      listDeals({ role: "all", pendingLimit: 20, activeLimit: 20, completedLimit: 20 }),
    enabled: Boolean(dealId) && !detailQuery.data,
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

  const resolvedDeal = detailQuery.data ?? fallbackDeal;

  useEffect(() => {
    if (detailQuery.error || fallbackListQuery.error) {
      toast.error(getErrorMessage(detailQuery.error ?? fallbackListQuery.error, "Unable to load deal", t));
    }
  }, [detailQuery.error, fallbackListQuery.error, t]);

  const currentStage = normalizeDealStage(resolvedDeal?.stage ?? DealStage.CREATIVE_AWAITING_SUBMIT);

  useEffect(() => {
    if (!resolvedDeal) return;
    setSelectedStage(normalizeDealStage(resolvedDeal.stage));
  }, [resolvedDeal?.stage]);

  useEffect(() => {
    if (!resolvedDeal || resolvedDeal.status === DealStatus.Completed || resolvedDeal.status === DealStatus.Canceled) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      detailQuery.refetch();
    }, 10000);
    return () => window.clearInterval(interval);
  }, [detailQuery, resolvedDeal]);

  const stagePanel = useMemo(() => {
    if (!resolvedDeal) return null;
    const currentUserId = (user as { id?: string } | null)?.id;
    const isAdvertiser = currentUserId === resolvedDeal.advertiserUserId;
    const readonlyForPublisher = !isAdvertiser;
    const stageComponents: Partial<Record<DealStage, JSX.Element>> = {
      [DealStage.CREATIVE_AWAITING_SUBMIT]: <StageSendPost deal={resolvedDeal} readonly={!isAdvertiser} />,
      [DealStage.CREATIVE_AWAITING_CONFIRM]: <StageCreativeApproval deal={resolvedDeal} readonly={isAdvertiser} />,
      [DealStage.PAYMENT_AWAITING]: (
        <StagePayment
          deal={resolvedDeal}
          readonly={readonlyForPublisher}
          onAction={readonlyForPublisher ? undefined : { onRefresh: () => detailQuery.refetch() }}
          isRefreshing={detailQuery.isFetching}
        />
      ),
      [DealStage.SCHEDULING_AWAITING_SUBMIT]: <StageScheduleTime deal={resolvedDeal} readonly={!isAdvertiser} />,
      [DealStage.SCHEDULING_AWAITING_CONFIRM]: <StageScheduleApproval deal={resolvedDeal} readonly={isAdvertiser} />,
      [DealStage.SCHEDULE_AWAITING_FOR_CHANGES]: <StageScheduleApproval deal={resolvedDeal} readonly={isAdvertiser} />,
      [DealStage.POST_SCHEDULED]: <StageScheduled deal={resolvedDeal} readonly={readonlyForPublisher} />,
      [DealStage.POSTED_VERIFYING]: <StageVerifying deal={resolvedDeal} readonly={readonlyForPublisher} />,
      [DealStage.FINALIZED]: <StageDone deal={resolvedDeal} readonly={readonlyForPublisher} />,
    };
    return stageComponents[normalizeDealStage(resolvedDeal.stage)] ?? stageComponents[DealStage.CREATIVE_AWAITING_SUBMIT] ?? null;
  }, [detailQuery, resolvedDeal, user]);

  return {
    state: {
      deal: resolvedDeal,
      currentStage,
      selectedStage: selectedStage ?? currentStage,
      availableStages: resolvedDeal ? allStages : [],
      stagePanel,
    },
    actions: {
      onSelectStage: (stage: DealStage) => {
        if (!resolvedDeal) return;
        if (canSelectDealStage(resolvedDeal.stage, stage)) {
          setSelectedStage(stage);
        }
      },
      onRetry: () => detailQuery.refetch(),
    },
    meta: {
      isLoading: detailQuery.isLoading && !resolvedDeal,
      error:
        detailQuery.error || fallbackListQuery.error || !resolvedDeal
          ? {
              message: getErrorMessage(
                detailQuery.error ?? fallbackListQuery.error,
                t("deals.detailNotFound"),
                t,
              ),
            }
          : null,
      errorDescription: t("deals.detailLoadHint"),
    },
  };
};
