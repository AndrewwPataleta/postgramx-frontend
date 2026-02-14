import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listMyChannels } from "@/api/features/channelsApi";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent } from "@/design-system/ui/card";
import { useAddChannelFlow } from "@/pages/add-channel/useAddChannelFlow";
import type { ChannelEntity } from "@/models/entities";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ChannelStatus } from "@/models/enums";
import { ROUTES } from "@/constants/routes";

const AddChannelStep3 = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { state } = useAddChannelFlow();
  const preview = state.preview;
  const [isOpeningChannel, setIsOpeningChannel] = useState(false);

  useEffect(() => {
    if (!preview) {
      navigate(ROUTES.ADD_CHANNEL_STEP("step-1"), { replace: true });
      return;
    }
    if (state.verifyStatus === "idle") {
      navigate(ROUTES.ADD_CHANNEL_STEP("step-2"), { replace: true });
    }
  }, [navigate, preview, state.verifyStatus]);

  const displayUsername = useMemo(() => {
    if (!preview?.username) {
      return t("common.emptyValue");
    }
    return preview.username.startsWith("@") ? preview.username : `@${preview.username}`;
  }, [preview?.username, t]);

  const isSuccess = state.verifyStatus === "success";
  const message =
    state.lastError || t("channels.add.step3.defaultError");
  const linkedChannelId = state.linkedChannelId;

  const handleManageChannelClick = async () => {
    if (!linkedChannelId || isOpeningChannel) {
      return;
    }

    setIsOpeningChannel(true);
    try {
      const channels = await listMyChannels({ page: 1, limit: 50 });
      const actualChannel = channels.items.find((channel) => channel.id === linkedChannelId);

      navigate(ROUTES.CHANNEL_MANAGE_LISTINGS(linkedChannelId), {
        state: {
          rootBackTo: ROUTES.CHANNELS,
          ...(actualChannel
            ? { channel: actualChannel }
            : channelState
              ? { channel: channelState }
              : {}),
        },
      });
    } finally {
      setIsOpeningChannel(false);
    }
  };

  const channelState: ChannelEntity | null =
    preview && linkedChannelId
      ? {
          id: linkedChannelId,
          username: (preview.username || preview.normalizedUsername || "").replace(/^@/, ""),
          title: preview.title || t("channels.untitled"),
          status: ChannelStatus.Verified,
          telegramChatId: preview.telegramChatId ? String(preview.telegramChatId) : null,
          memberCount: preview.memberCount ?? null,
          subscribersCount: preview.memberCount ?? null,
          avgViews: null,
          createdByUserId: "",
          verifiedAt: new Date().toISOString(),
          lastCheckedAt: new Date().toISOString(),
          isDisabled: false,
          languageStats: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      : null;

  if (!preview) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-5">
      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
          <div
            className={`flex h-16 w-16 items-center justify-center rounded-full ${
              isSuccess
                ? "bg-success/20 text-success"
                : "bg-destructive/15 text-destructive"
            }`}
          >
            {isSuccess ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">
              {isSuccess ? t("channels.add.step3.successTitle") : t("channels.add.step3.failedTitle")}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {preview.title} · {displayUsername}
            </p>
          </div>
          {!isSuccess ? (
            <p className="text-xs text-muted-foreground">{message}</p>
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-auto flex flex-col gap-3">
        {isSuccess ? (
          <>
            <Button
              onClick={() => {
                void handleManageChannelClick();
              }}
              className="w-full text-sm font-semibold"
              disabled={!linkedChannelId || isOpeningChannel}
            >
              {t("channels.add.step3.manageChannel")}
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={() => navigate(ROUTES.ADD_CHANNEL_STEP("step-2"))}
              className="w-full text-sm font-semibold"
            >
              {t("channels.add.step3.retryVerification")}
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(ROUTES.CHANNELS)}
              className="w-full text-sm font-semibold"
            >
              {t("channels.add.step3.backToChannels")}
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default AddChannelStep3;
