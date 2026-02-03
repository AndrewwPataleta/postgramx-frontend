import DealsFrame from "@/components/deals/DealsFrame";
import DetailFrame from "@/components/deals/DetailFrame";
import { useDealsOverview } from "@/hooks/use-deals-overview";

export default function Index() {
  const { data } = useDealsOverview();

  return (
    <div className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <DealsFrame title="Active" deals={data.active} quickFilters={data.quickFilters} />
          <DealsFrame title="Pending" deals={data.pending} quickFilters={data.quickFilters} />
          <DealsFrame title="Completed" deals={data.completed} quickFilters={data.quickFilters} />
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <DetailFrame
            title="TON Launchpad"
            username="tonlaunchpad"
            price="40 TON"
            dealId="DL-1002"
            status="Payment Required"
            statusKey="paymentRequired"
            icon="payment"
            timelineItems={data.timeline}
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
            icon="view"
            timelineItems={data.timelineVerifying}
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
