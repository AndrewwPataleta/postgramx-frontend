import { CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { ROUTES } from "@/constants/routes";

export default function ListingSuccess() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="py-10">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-foreground">Listing published</h1>
            <p className="text-sm text-muted-foreground">
              Your ad offer is now visible in Marketplace.
            </p>
          </div>
          <div className="w-full space-y-3 mt-6">
            <Link
              to={ROUTES.MARKETPLACE}
              className="w-full button-primary py-3 text-base font-semibold text-center"
            >
              View in Marketplace
            </Link>
            <Link
              to={ROUTES.CHANNEL_MANAGE_LISTINGS_CREATE(id ?? "")}
              className="w-full rounded-lg border border-border/60 bg-card px-3 py-3 text-sm font-medium text-foreground text-center"
            >
              Create another listing
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
