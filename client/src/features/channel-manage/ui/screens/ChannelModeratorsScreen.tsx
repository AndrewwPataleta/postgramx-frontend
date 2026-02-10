import { useOutletContext, useParams } from "react-router-dom";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";
import { useChannelModeratorsViewModel } from "../../hooks/useChannelModeratorsViewModel";
import { ChannelModeratorsView } from "./ChannelModeratorsView";

const ChannelModeratorsScreen = () => {
  const { channel } = useOutletContext<ChannelManageContext>();
  const { id } = useParams<{ id: string }>();
  const vm = useChannelModeratorsViewModel(channel, id);

  return (
    <ChannelModeratorsView
      isOwner={vm.state.isOwner}
      moderators={vm.state.moderators}
      currentUserId={vm.state.currentUserId}
      pendingModeratorId={vm.state.pendingModeratorId}
      isLoading={vm.meta.isLoading}
      isMutating={vm.meta.isMutating}
      errorMessage={vm.meta.error?.message ?? null}
      onToggleReview={vm.actions.onToggleReview}
      onGoBack={vm.actions.onGoBack}
    />
  );
};

export default ChannelModeratorsScreen;
