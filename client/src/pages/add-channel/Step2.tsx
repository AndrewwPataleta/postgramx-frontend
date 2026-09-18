import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/ui/avatar";
import { Button } from "@/design-system/ui/button";
import { Card, CardContent } from "@/design-system/ui/card";
import { verifyChannel } from "@/api/features/channelsApi";
import {
  mapApiErrorToUiAction,
  type BottomSheetPayload,
} from "@/api/errors/mapApiErrorToUiAction";
import ChannelOwnerLinkSheet from "@/features/channels/ui/ChannelOwnerLinkSheet";
import { getChannelErrorMessage } from "@/pages/add-channel/errorMapping";
import { useAddChannelFlow } from "@/pages/add-channel/useAddChannelFlow";
import { formatNumber } from "@/i18n/formatters";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { Language } from "@/i18n/translations";
import { ChannelStatus } from "@/models/enums";
import { ROUTES } from "@/constants/routes";

const formatMetric = (value: number | null | undefined, language: Language) => {
  if (value == null) {
    return null;
  }
  return formatNumber(value, language as never, { notation: "compact" });
};

const shouldLogChannelErrors =
  Boolean(import.meta.env.DEV) && import.meta.env.VITE_API_LOG === "true";

const AddChannelStep2 = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const {
    state,
    setLinkedChannelId,
    setVerifyStatus,
    setLastError,
  } = useAddChannelFlow();
  const [ownerLinkSheetOpen, setOwnerLinkSheetOpen] = useState(false);
  const [ownerLinkSheetPayload, setOwnerLinkSheetPayload] =
    useState<BottomSheetPayload | null>(null);

  const preview = state.preview;

  useEffect(() => {
    if (!preview) {
      navigate(ROUTES.ADD_CHANNEL_STEP("step-1"), { replace: true });
    }
  }, [navigate, preview]);

  const displayUsername = useMemo(() => {
    if (!preview?.username) {
      return t("common.emptyValue");
    }
    return preview.username.startsWith("@") ? preview.username : `@${preview.username}`;
  }, [preview?.username, t]);

  const verifyMutation = useMutation({
    mutationFn: (username: string) => verifyChannel({ username }),
    onMutate: () => {
      setVerifyStatus("loading");
      setLastError(null);
    },
    onSuccess: (response) => {
      const resolvedChannelId =
        response.id ??
        (response as { channelId?: string }).channelId ??
        (response as { _id?: string })._id ??
        null;
      setLinkedChannelId(resolvedChannelId ? String(resolvedChannelId) : null);
      if (response.status === ChannelStatus.Verified) {
        setVerifyStatus("success");
        setLastError(null);
        navigate(ROUTES.ADD_CHANNEL_STEP("step-3"));
        return;
      }
      if (shouldLogChannelErrors) {
        console.warn("[channels] verify response not verified", response);
      }
      setVerifyStatus("error");
      setLastError(t("channels.add.step2.verifyError"));
      toast.error(t("channels.add.step2.verifyError"));
    },
    onError: (error) => {
      const uiAction = mapApiErrorToUiAction(error);
      if (uiAction.handled && uiAction.action.type === "bottomSheet") {
        setOwnerLinkSheetPayload(uiAction.action.payload);
        setOwnerLinkSheetOpen(true);
        return;
      }
      const message = getChannelErrorMessage(error, t("errors.genericTitle"), t);
      setVerifyStatus("error");
      setLastError(message);
      toast.error(message);
    },
  });

  const handlePrimaryAction = () => {
    if (!preview) {
      return;
    }
    const username = (preview.normalizedUsername || preview.username || "").replace(/^@/, "");
    if (!username) {
      toast.error(t("channels.add.step2.missingUsername"));
      return;
    }
    verifyMutation.mutate(username);
  };

  const isLoading = verifyMutation.isPending;
  const primaryLabel = t("channels.add.step2.verifyAction");

  const memberCount = formatMetric(preview?.memberCount, language);

  if (!preview) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-4">
      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              {preview.photoUrl || preview.avatarUrl ? (
                <AvatarImage src={preview.photoUrl ?? preview.avatarUrl ?? ""} />
              ) : null}
              <AvatarFallback className="bg-secondary text-sm font-semibold text-foreground">
                {(preview.title || t("common.avatarFallback")).charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {preview.title}
              </p>
              <p className="text-xs text-muted-foreground">{displayUsername}</p>
            </div>
          </div>
          {memberCount ? (
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>
                {memberCount} {t("marketplace.subscribers")}
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/80 shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {t("channels.add.step2.title")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("channels.add.step2.subtitle")}
            </p>
          </div>
          <ol className="space-y-2 text-xs text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-foreground">1.</span>
              {t("channels.add.step2.instructions.1")}
            </li>
            <li className="flex gap-2">
              <span className="text-foreground">2.</span>
              {t("channels.add.step2.instructions.2")}
            </li>
            <li className="flex gap-2">
              <span className="text-foreground">3.</span>
              {t("channels.add.step2.instructions.3")}
            </li>
          </ol>
        </CardContent>
      </Card>

      <div className="mt-auto flex flex-col gap-3">
        <Button
          onClick={handlePrimaryAction}
          disabled={isLoading}
          className="w-full text-sm font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("channels.add.step2.verifying")}
            </>
          ) : (
            primaryLabel
          )}
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate(ROUTES.ADD_CHANNEL_STEP("step-1"))}
          disabled={isLoading}
          className="w-full text-sm font-semibold"
        >
          {t("common.back")}
        </Button>
      </div>

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

export default AddChannelStep2;
