import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { predealsCreate } from "@/api/features/predealsApi";
import { ScheduleDatePicker } from "@/components/deals/ScheduleDatePicker";
import ErrorState from "@/components/feedback/ErrorState";
import { PageContainer } from "@/components/layout/PageContainer";
import { getErrorMessage } from "@/lib/api/errors";
import { useLanguage } from "@/i18n/LanguageProvider";
import { toUtcIsoString } from "@/utils/date";
import { ROUTES } from "@/constants/routes";

export default function CreatePreDeal() {
  const { listingId } = useParams<{ listingId: string }>();
  const navigate = useNavigate();
  const [scheduledAt, setScheduledAt] = useState<Date | null>(null);
  const { t } = useLanguage();

  const createMutation = useMutation({
    mutationFn: predealsCreate,
    onSuccess: (predeal) => {
      navigate(ROUTES.DEAL_PREDEAL(predeal.id));
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to create pre-deal", t));
    },
  });

  const scheduledIso = useMemo(() => {
    if (!scheduledAt) {
      return null;
    }
    try {
      return toUtcIsoString(scheduledAt);
    } catch {
      return null;
    }
  }, [scheduledAt]);

  const isScheduledInFuture = useMemo(() => {
    if (!scheduledIso) {
      return false;
    }
    const scheduledTime = new Date(scheduledIso).getTime();
    return scheduledTime > Date.now() + 60 * 60 * 1000;
  }, [scheduledIso]);

  const handleSubmit = async () => {
    if (!listingId) {
      return;
    }
    if (!scheduledIso) {
      toast.error("Please select a valid date and time.");
      return;
    }
    if (!isScheduledInFuture) {
      toast.error("Scheduled time must be at least 1 hour from now.");
      return;
    }
    if (!scheduledIso.endsWith("Z")) {
      console.error("Scheduled date must be UTC ISO:", scheduledIso);
      throw new Error("Invalid datetime format");
    }

    createMutation.mutate({ listingId, scheduledAt: scheduledIso });
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
      <PageContainer className="py-6 space-y-6">
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Schedule ad post</p>
          <h1 className="text-xl font-semibold text-foreground">
            Choose when the post should be published
          </h1>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Scheduled date & time</label>
            <div className="pb-safe-bottom rounded-2xl border border-border/60 bg-card/80 p-3">
              <ScheduleDatePicker value={scheduledAt} onChange={setScheduledAt} />
            </div>
            {!isScheduledInFuture && scheduledAt && (
              <p className="text-xs text-destructive">
                Scheduled time must be at least 1 hour from now.
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              We will remind the channel owner at the scheduled time.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!scheduledAt || !isScheduledInFuture || createMutation.isPending}
          className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition disabled:opacity-60"
        >
          {createMutation.isPending ? "Scheduling..." : "Continue"}
        </button>
      </PageContainer>
    </div>
  );
}
