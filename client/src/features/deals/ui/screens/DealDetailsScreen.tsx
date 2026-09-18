import { useDealDetailsViewModel } from "../../hooks/useDealDetailsViewModel";
import { DealDetailsView } from "./DealDetailsView";

const DealDetailsScreen = () => {
  const vm = useDealDetailsViewModel();

  return (
    <DealDetailsView
      deal={vm.state.deal}
      stages={vm.state.availableStages}
      selectedStage={vm.state.selectedStage}
      currentStage={vm.state.currentStage}
      stagePanel={vm.state.stagePanel}
      isLoading={vm.meta.isLoading}
      errorMessage={vm.meta.error?.message ?? null}
      errorDescription={vm.meta.errorDescription}
      onRetry={vm.actions.onRetry}
    />
  );
};

export default DealDetailsScreen;
