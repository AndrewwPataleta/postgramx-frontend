import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  getVerifyErrorMessage,
  getVerifyResponseErrorMessage,
  useVerifyChannel,
} from "@/features/channels/hooks/useVerifyChannel";
import {
  mapApiErrorToUiAction,
  type BottomSheetPayload,
} from "@/api/errors/mapApiErrorToUiAction";
import ChannelOwnerLinkSheet from "@/features/channels/ui/ChannelOwnerLinkSheet";
import { PageContainer } from "@/design-system/components/PageContainer";
import { ROUTES } from "@/constants/routes";
import type { ChannelEntity } from "@/models/entities";
import { ChannelStatus } from "@/models/enums";
import { useLanguage } from "@/i18n/LanguageProvider";

const formatMetric = (value?: number | null) => {
  if (value == null) {
    return "–";
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }

  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }

  return value.toString();
};

const ChannelPendingVerification = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [ownerLinkSheetOpen, setOwnerLinkSheetOpen] = useState(false);
  const [ownerLinkSheetPayload, setOwnerLinkSheetPayload] =
    useState<BottomSheetPayload | null>(null);
  const { mutateAsync, isPending } = useVerifyChannel();

  const channel = useMemo(() => {
    const state = location.state as { channel?: ChannelEntity } | null;
    return state?.channel ?? null;
  }, [location.state]);
  const rootBackTo = (location.state as { rootBackTo?: string } | null)?.rootBackTo;

  const handleRetry = async () => {
    if (!id) {
      return;
    }

    setInlineError(null);
    try {
      const response = await mutateAsync(id);
      if (response.status === ChannelStatus.Verified) {
        const nextChannel = channel ? { ...channel, status: ChannelStatus.Verified } : undefined;
        navigate(ROUTES.CHANNEL_MANAGE_LISTINGS(id), {
          replace: true,
          state: nextChannel
            ? { channel: nextChannel, rootBackTo }
            : rootBackTo
              ? { rootBackTo }
              : undefined,
        });
        return;
      }

      const message = getVerifyResponseErrorMessage(
        response,
        t("channels.pending.verifyFailed"),
      );
      setInlineError(message);
    } catch (error) {
      const uiAction = mapApiErrorToUiAction(error);
      if (uiAction.handled && uiAction.action.type === "bottomSheet") {
        setOwnerLinkSheetPayload(uiAction.action.payload);
        setOwnerLinkSheetOpen(true);
        return;
      }
      const message = getVerifyErrorMessage(
        error,
        t("channels.pending.verifyUnavailable"),
      );
      setInlineError(message);
      toast.error(message);
    }
  };

  if (!id) {
    const handleFallbackBack = () => {
      if (rootBackTo) {
        navigate(rootBackTo, { replace: true });
        return;
      }
      navigate(-1);
    };
    return (
      <div className="mx-auto w-full max-w-2xl">
        <PageContainer className="py-6">
          <p className="text-sm text-muted-foreground">Channel not found.</p>
          <button
            type="button"
            onClick={handleFallbackBack}
            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary"
          >
            <ChevronLeft size={14} />
            {t("common.back")}
          </button>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col">
      <PageContainer className="py-6 space-y-6">
        <button
          type="button"
          onClick={() => {
            if (rootBackTo) {
              navigate(rootBackTo, { replace: true });
              return;
            }
            navigate(-1);
          }}
          className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground"
        >
          <ChevronLeft size={14} />
          {t("common.back")}
        </button>

        <div className="rounded-2xl border border-border/60 bg-card/80 p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                {t("channels.pending.title")}
              </p>
              <h1 className="mt-1 text-lg font-semibold text-foreground">
                {channel?.title || t("channels.pending.heading")}
              </h1>
              {channel?.username ? (
                <p className="text-sm text-muted-foreground">@{channel.username}</p>
              ) : null}
            </div>
            <span className="rounded-full border border-warning/40 bg-warning/15 px-3 py-1 text-[11px] font-semibold text-warning">
              {t("channels.status.PENDING_VERIFY")}
            </span>
          </div>

          <div className="mt-4 rounded-xl bg-muted/30 p-3">
            <p className="text-xs text-muted-foreground">{t("channels.members")}</p>
            <p className="mt-1 text-base font-semibold text-foreground">
              {formatMetric(channel?.memberCount)}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card/70 p-5 text-sm text-muted-foreground">
          <p className="text-sm font-semibold text-foreground">
            {t("channels.pending.finishTitle")}
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-xs">
            <li>{t("channels.pending.step1")}</li>
            <li>{t("channels.pending.step2")}</li>
            <li>{t("channels.pending.step3")}</li>
          </ul>
        </div>

        {inlineError ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-xs text-destructive">
            {inlineError}
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleRetry}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {t("channels.pending.retry")}
          </button>
          <button
            type="button"
            onClick={() => navigate(ROUTES.CHANNELS)}
            className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-card/80 px-4 py-3 text-sm font-semibold text-foreground"
          >
            {t("channels.pending.backToChannels")}
          </button>
        </div>
      </PageContainer>

      <ChannelOwnerLinkSheet
        open={ownerLinkSheetOpen}
        onOpenChange={(open) => {
          setOwnerLinkSheetOpen(open);
          if (!open) {
            setOwnerLinkSheetPayload(null);
          }
        }}
        titleKey={ownerLinkSheetPayload?.titleKey}
        bodyKey={ownerLinkSheetPayload?.bodyKey}
        primaryActionKey={ownerLinkSheetPayload?.primaryActionKey}
      />
    </div>
  );
};

export default ChannelPendingVerification;
