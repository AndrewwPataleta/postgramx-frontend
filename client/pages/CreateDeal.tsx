import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTelegramWebApp } from "@/lib/telegram";
import { useCreateDealMutation } from "@/features/deals/hooks/useDeals";
import ErrorState from "@/components/feedback/ErrorState";
import { ScheduleDatePicker } from "@/components/deals/ScheduleDatePicker";
import { PageContainer } from "@/components/layout/PageContainer";
import { toIsoZ } from "@/api/core/date";
import { ROUTES } from "@/constants/routes";

interface CreateDealLocationState {
  listingId?: string;
}

export default function CreateDeal() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CreateDealLocationState | null;
  const listingId = state?.listingId;

  const [brief, setBrief] = useState("");
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const createDealMutation = useCreateDealMutation();
  const isSubmitting = createDealMutation.isPending;

  const isValidSchedule =
    !scheduledAt || scheduledAt.getTime() > Date.now() + 60 * 60 * 1000;
  const canSubmit = Boolean(listingId) && !isSubmitting && isValidSchedule;

  const scheduledIso = useMemo(() => {
    if (!scheduledAt) {
      return undefined;
    }
    try {
      return toIsoZ(scheduledAt);
    } catch {
      return undefined;
    }
  }, [scheduledAt]);

  useEffect(() => {
    const webApp = getTelegramWebApp();
    if (!webApp?.MainButton?.showProgress || !webApp.MainButton.hideProgress) {
      return;
    }

    if (isSubmitting) {
      webApp.MainButton.showProgress(true);
    } else {
      webApp.MainButton.hideProgress();
    }
  }, [isSubmitting]);

  const handleSubmit = async () => {
    if (!listingId) {
      return;
    }
    if (!isValidSchedule) {
      return;
    }

    try {
      await createDealMutation.mutateAsync({
        listingId,
        brief: brief.trim() || undefined,
        scheduledAt: scheduledIso,
      });
    } catch {
      return;
    }
  };

  if (!listingId) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <PageContainer className="py-6">
          <ErrorState
            message="Listing not selected"
            description="Please return to the marketplace and select a listing to continue."
            onRetry={() => navigate(ROUTES.MARKETPLACE)}
          />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="py-6 space-y-4">
        <div className="rounded-2xl border border-border/60 bg-card/80 p-4">
          <p className="text-xs text-muted-foreground">Listing</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{listingId}</p>
          <p className="text-xs text-muted-foreground">Ready to create a deal</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Brief (optional)</label>
            <textarea
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              placeholder="Describe your product, key message, and desired tone."
              className="min-h-[120px] w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Schedule datetime (optional)
            </label>
            <div className="pb-safe-bottom rounded-2xl border border-border/60 bg-card/80 p-3">
              <ScheduleDatePicker value={scheduledAt} onChange={setScheduledAt} />
            </div>
            {!isValidSchedule && (
              <p className="text-xs text-destructive">
                Scheduled time must be at least 1 hour from now.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
        >
          {isSubmitting ? "Creating deal..." : "Create deal"}
        </button>
      </PageContainer>
    </div>
  );
}
