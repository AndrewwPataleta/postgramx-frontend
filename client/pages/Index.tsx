import DealsFrame from "@/components/deals/DealsFrame";
import DetailFrame from "@/components/deals/DetailFrame";
import { useDealsOverview } from "@/features/deals/hooks/useDealsOverview";

export default function Index() {
  const { data } = useDealsOverview();
  const overview = data ?? {
    active: [],
    pending: [],
    completed: [],
    quickFilters: [],
    timeline: [],
    timelineVerifying: [],
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <DealsFrame title="Active" deals={overview.active} quickFilters={overview.quickFilters} />
          <DealsFrame title="Pending" deals={overview.pending} quickFilters={overview.quickFilters} />
          <DealsFrame title="Completed" deals={overview.completed} quickFilters={overview.quickFilters} />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <DetailFrame
            title="TON Launchpad"
            username="tonlaunchpad"
            price="40 TON"
            dealId="DL-1002"
            status="Payment Required"
            statusKey="paymentRequired"
            icon="💳"
            timelineItems={overview.timeline}
            primary="Pay Now"
            secondary="Open Chat Bot"
            delivery="Awaiting post"
            statusDescription="Secure escrow locks funds once payment is confirmed."
          />
          <DetailFrame
            title="Crypto Atlas"
            username="cryptoatlas"
            price="48 TON"
            dealId="DL-1006"
            status="Post Live — Verifying"
            statusKey="verifying"
            icon="👁️"
            timelineItems={overview.timelineVerifying}
            primary="View Post"
            secondary="Message via Bot"
            delivery="Post Live"
            statusDescription="Post is live while verification checks engagement and integrity."
          />
        </div>
      </div>
    </div>
  );
}
