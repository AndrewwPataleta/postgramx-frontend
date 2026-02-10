import { useOutletContext } from "react-router-dom";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";
import { useChannelOverviewViewModel } from "../../hooks/useChannelOverviewViewModel";
import { ChannelOverviewView } from "./ChannelOverviewView";

const ChannelOverviewScreen = () => {
  const { channel } = useOutletContext<ChannelManageContext>();
  const vm = useChannelOverviewViewModel(channel);

  return (
    <ChannelOverviewView
      channelId={vm.state.channelId}
      description={vm.state.description}
      listings={vm.state.listings}
      isLoading={vm.meta.isLoading}
    />
  );
};

export default ChannelOverviewScreen;
