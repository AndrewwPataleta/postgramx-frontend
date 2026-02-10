import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { listChannelModerators, setModeratorReviewEnabled } from "@/api/features/channelsModeratorsApi";
import type { ApiError } from "@/api/core/apiErrors";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getErrorMessage } from "@/lib/api/errors";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";
import { toModeratorView } from "../model/mappers";
import { sortModerators } from "../model/selectors";

export const useChannelModeratorsViewModel = (
  channel: ChannelManageContext["channel"],
  channelIdParam?: string,
) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelId = channelIdParam ?? channel.id;
  const isOwner = channel.membership?.role === "OWNER";
  const [pendingModeratorId, setPendingModeratorId] = useState<string | null>(null);

  const moderatorsQuery = useQuery({
    queryKey: ["channelModerators", channelId],
    queryFn: () => listChannelModerators({ channelId }),
    enabled: Boolean(channelId) && isOwner,
  });

  const reviewToggleMutation = useMutation({
    mutationFn: setModeratorReviewEnabled,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["channelModerators", channelId] });
      toast.success(t("channelDetails.moderators.updateSuccess"));
    },
    onError: (error: ApiError | Error) => {
      if (error instanceof Error && "statusCode" in error) {
        const statusCode = (error as ApiError).statusCode;
        if (statusCode === 403) {
          toast.error(t("channelDetails.moderators.permissionError"));
          return;
        }
        if (statusCode === 404) {
          toast.error(t("channelDetails.moderators.notFoundError"));
          return;
        }
      }
      toast.error(getErrorMessage(error, t("channelDetails.moderators.updateError"), t));
    },
    onSettled: () => {
      setPendingModeratorId(null);
    },
  });

  const currentUserId = (user as { id?: string } | null)?.id ?? null;
  const channelOwnerId = moderatorsQuery.data?.channel.ownerUserId ?? null;
  const moderators = useMemo(() => {
    const mapped = (moderatorsQuery.data?.items ?? []).map((item) => toModeratorView(item, channelOwnerId, t));
    return sortModerators(mapped);
  }, [channelOwnerId, moderatorsQuery.data?.items, t]);

  const onToggleReview = async (userId: string, canReviewDeals: boolean) => {
    if (!channelId) {
      return;
    }
    setPendingModeratorId(userId);
    try {
      await reviewToggleMutation.mutateAsync({ channelId, userId, canReviewDeals });
    } catch {
      // handled
    }
  };

  const onGoBack = () => navigate(ROUTES.CHANNEL_MANAGE_SETTINGS(channelId));

  return {
    state: {
      isOwner,
      currentUserId,
      moderators,
      pendingModeratorId,
    },
    actions: {
      onToggleReview,
      onGoBack,
    },
    meta: {
      isLoading: moderatorsQuery.isLoading && moderators.length === 0,
      error: moderatorsQuery.isError
        ? { message: getErrorMessage(moderatorsQuery.error, t("channelDetails.moderators.loadError"), t) }
        : null,
      isMutating: reviewToggleMutation.isPending,
    },
  };
};
