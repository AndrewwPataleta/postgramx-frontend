import type { ReactNode } from "react";
import DealHeaderCard from "@/features/deals/ui/DealHeaderCard";
import StageTimeline from "@/features/deals/ui/StageTimeline";
import DealDetailsSkeleton from "@/features/deals/ui/skeletons/DealDetailsSkeleton";
import ErrorState from "@/design-system/components/ErrorState";
import { PageContainer } from "@/design-system/components/PageContainer";
import type { DealStage } from "@/models/enums";
import type { DealEntity } from "@/models/entities";

interface DealDetailsViewProps {
  deal: DealEntity | null;
  stages: DealStage[];
  selectedStage: DealStage;
  currentStage: DealStage;
  stagePanel: ReactNode;
  isLoading: boolean;
  errorMessage: string | null;
  errorDescription: string;
  onRetry: () => void;
}

export function DealDetailsView(props: DealDetailsViewProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="py-6 space-y-4">
        {props.isLoading && !props.deal ? (
          <DealDetailsSkeleton />
        ) : props.errorMessage || !props.deal ? (
          <ErrorState message={props.errorMessage ?? "Error"} description={props.errorDescription} onRetry={props.onRetry} />
        ) : (
          <>
            <DealHeaderCard deal={props.deal} />
            <StageTimeline
              stages={props.stages}
              selectedStage={props.selectedStage}
              currentStage={props.currentStage}
            />
            {props.stagePanel}
          </>
        )}
      </PageContainer>
    </div>
  );
}
