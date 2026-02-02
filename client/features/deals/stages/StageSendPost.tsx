import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import InfoCard from "@/components/deals/InfoCard";
import type { DealEntity } from "@/models/entities";
import { openTelegramLink } from "@/lib/telegramLinks";
import { submitCreative } from "@/api/features/dealsApi";
import { getErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";

interface StageSendPostProps {
  deal: DealEntity;
  readonly: boolean;
  variant?: "pending" | "changesRequested";
  showSubmit?: boolean;
  adminComment?: string | null;
  onAction?: {
    onOpenBot?: () => void;
    onConfirmSent?: () => Promise<void> | void;
  };
}

const BOT_USERNAME = "postgramx_bot";

export default function StageSendPost({
  deal,
  readonly,
  variant = "pending",
  showSubmit = true,
  adminComment,
  onAction,
}: StageSendPostProps) {
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const botLink = `https://t.me/${BOT_USERNAME}?start=deal_${deal.id}`;
  const hasCreative = deal.creatives.length > 0;
  const isChangesRequested = variant === "changesRequested";

  const mutation = useMutation({
    mutationFn: async () => {
      return submitCreative(deal.id);
    },
    onSuccess: () => {
      toast.success(t("deals.stage.sendPost.submittedToast"));
      queryClient.invalidateQueries({ queryKey: ["deal", deal.id] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, t("deals.stage.sendPost.submitError"), t));
    },
  });

  if (readonly) {
    return (
      <InfoCard title={t("deals.stage.sendPost.title")}>
        <p className="text-xs text-muted-foreground">
          {t("deals.stage.sendPost.readonly")}
        </p>
        {adminComment ? (
          <div className="rounded-lg border border-border/60 bg-background/50 p-3 text-xs text-foreground">
            <p className="text-[11px] uppercase text-muted-foreground">
              {t("deals.stage.sendPost.adminComment")}
            </p>
            <p className="mt-1 text-xs text-foreground">{adminComment}</p>
          </div>
        ) : null}
        {hasCreative ? (
          <div className="rounded-lg border border-border/60 bg-background/50 p-3 text-xs text-foreground">
            {t("deals.stage.sendPost.creativeSubmitted")}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{t("deals.stage.sendPost.noCreative")}</p>
        )}
      </InfoCard>
    );
  }

  const handleOpenBot = () => {
    if (onAction?.onOpenBot) {
      onAction.onOpenBot();
      return;
    }
    openTelegramLink(botLink);
  };

  const handleConfirmSent = () => {
    if (onAction?.onConfirmSent) {
      onAction.onConfirmSent();
      return;
    }
    mutation.mutate();
  };

  return (
    <InfoCard title={t("deals.stage.sendPost.title")}>
      <p className="text-xs text-muted-foreground">
        {isChangesRequested
          ? t("deals.stage.sendPost.changesRequested")
          : t("deals.stage.sendPost.description")}
      </p>
      {adminComment ? (
        <div className="rounded-lg border border-border/60 bg-background/50 p-3 text-xs text-foreground">
          <p className="text-[11px] uppercase text-muted-foreground">
            {t("deals.stage.sendPost.adminComment")}
          </p>
          <p className="mt-1 text-xs text-foreground">{adminComment}</p>
        </div>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleOpenBot}
          className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          {isChangesRequested
            ? t("deals.stage.sendPost.openBotResend")
            : t("deals.stage.sendPost.openBot")}
        </button>
        {showSubmit ? (
          <button
            type="button"
            onClick={handleConfirmSent}
            disabled={mutation.isPending}
            className={cn(
              "rounded-lg border border-border/60 px-4 py-2 text-xs font-semibold text-foreground",
              mutation.isPending && "cursor-not-allowed opacity-60"
            )}
          >
            {t("deals.stage.sendPost.submitCreative")}
          </button>
        ) : null}
      </div>
      {hasCreative && showSubmit ? (
        <p className="text-xs text-muted-foreground">
          {t("deals.stage.sendPost.waitingReview")}
        </p>
      ) : null}
    </InfoCard>
  );
}
