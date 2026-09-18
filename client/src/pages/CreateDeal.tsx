import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTelegramWebApp } from "@/lib/telegram";
import { useCreateDealMutation } from "@/hooks/use-deals";
import ErrorState from "@/design-system/components/ErrorState";
import { ScheduleDatePicker } from "@/features/deals/ui/ScheduleDatePicker";
import { PageContainer } from "@/design-system/components/PageContainer";
import { toUtcIsoString } from "@/utils/date";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/i18n/LanguageProvider";

interface CreateDealLocationState {
  listingId?: string;
}

export default function CreateDeal() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as CreateDealLocationState | null;
  const listingId = state?.listingId;
  const { t } = useLanguage();

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
      return toUtcIsoString(scheduledAt);
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
      if (scheduledIso && !scheduledIso.endsWith("Z")) {
        console.error("Scheduled date must be UTC ISO:", scheduledIso);
        throw new Error("Invalid datetime format");
      }
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
            message={t("deals.create.missingListing")}
            description={t("deals.create.missingListingHint")}
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
          <p className="text-xs text-muted-foreground">{t("deals.create.listingLabel")}</p>
          <p className="mt-1 text-sm font-semibold text-foreground">{listingId}</p>
          <p className="text-xs text-muted-foreground">{t("deals.create.readyLabel")}</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              {t("deals.create.briefLabel")}
            </label>
            <textarea
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              placeholder={t("deals.create.briefPlaceholder")}
              className="min-h-[120px] w-full rounded-xl border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              {t("deals.create.scheduleLabel")}
            </label>
            <div className="pb-safe-bottom rounded-2xl border border-border/60 bg-card/80 p-3">
              <ScheduleDatePicker value={scheduledAt} onChange={setScheduledAt} />
            </div>
            {!isValidSchedule && (
              <p className="text-xs text-destructive">
                {t("deals.create.scheduleHint")}
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
          {isSubmitting ? t("deals.create.creating") : t("deals.create.createAction")}
        </button>
      </PageContainer>
    </div>
  );
}
