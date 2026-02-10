import { useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listChannelModerators,
  setModeratorReviewEnabled,
} from "@/api/features/channelsModeratorsApi";
import type { ApiError } from "@/api/core/apiErrors";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/ui/avatar";
import { Switch } from "@/design-system/ui/switch";
import {
  ChannelDetailsModeratorsSkeleton,
} from "@/features/channels/ui/skeletons/ChannelDetailsSkeleton";
import { useAuth } from "@/features/auth/ui/AuthProvider";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getErrorMessage } from "@/lib/api/errors";
import { AnimatedList, AnimatedListItem } from "@/motion/AnimatedList";
import type {
  ChannelModeratorItemDto,
  ChannelModeratorsListResponse,
} from "@/models/entities";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";

const ChannelModerators = () => {
  const { channel } = useOutletContext<ChannelManageContext>();
  const { id: channelIdParam } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const channelId = channelIdParam ?? channel.id;
  const isOwner = channel.membership?.role === "OWNER";
  const [pendingModeratorId, setPendingModeratorId] = useState<string | null>(null);

  const moderatorsQuery = useQuery<ChannelModeratorsListResponse>({
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
  const moderatorsItems = moderatorsQuery.data?.items ?? [];
  const channelOwnerId = moderatorsQuery.data?.channel.ownerUserId ?? null;
  const sortedModerators = useMemo(() => {
    return [...moderatorsItems].sort((a, b) => {
      const aIsOwner = channelOwnerId ? a.userId === channelOwnerId : false;
      const bIsOwner = channelOwnerId ? b.userId === channelOwnerId : false;
      if (aIsOwner && !bIsOwner) {
        return -1;
      }
      if (!aIsOwner && bIsOwner) {
        return 1;
      }
      return a.displayName.localeCompare(b.displayName);
    });
  }, [moderatorsItems, channelOwnerId]);

  const getInitials = (name: string) => {
    const parts = name.split(" ").filter(Boolean);
    if (parts.length === 0) {
      return name.slice(0, 2).toUpperCase();
    }
    return parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const handleToggleReview = async (item: ChannelModeratorItemDto, nextValue: boolean) => {
    if (!channelId) {
      return;
    }
    setPendingModeratorId(item.userId);
    try {
      await reviewToggleMutation.mutateAsync({
        channelId,
        userId: item.userId,
        canReviewDeals: nextValue,
      });
    } catch {
      // Handled by mutation callbacks.
    }
  };

  if (!isOwner) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            {t("channelDetails.tabs.moderators")}
          </h3>
        </div>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">
            {t("channelModerators.accessDeniedTitle")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("channelModerators.accessDeniedSubtitle")}
          </p>
          <button
            type="button"
            onClick={() => navigate(ROUTES.CHANNEL_MANAGE_SETTINGS(channelId))}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            {t("common.back")}
          </button>
        </div>
      </div>
    );
  }

  const showModeratorsSkeleton =
    moderatorsQuery.isLoading && sortedModerators.length === 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-4">
        <p className="text-xs text-muted-foreground">
          {t("channelDetails.moderators.description")}
        </p>

        {showModeratorsSkeleton ? (
          <ChannelDetailsModeratorsSkeleton count={4} />
        ) : moderatorsQuery.isError ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {getErrorMessage(
              moderatorsQuery.error,
              t("channelDetails.moderators.loadError"),
              t
            )}
          </div>
        ) : sortedModerators.length > 0 ? (
          <AnimatedList itemsCount={sortedModerators.length} className="space-y-3">
            {sortedModerators.map((item, index) => {
              const isOwnerItem = channelOwnerId === item.userId;
              const isInactive = !item.isActive || item.isManuallyDisabled;
              const canManage = Boolean(currentUserId && isOwner);
              const shouldShowSwitch = isOwnerItem || canManage;
              const isPending = pendingModeratorId === item.userId;
              const isToggleDisabled =
                isOwnerItem ||
                isInactive ||
                !canManage ||
                isPending ||
                reviewToggleMutation.isPending;
              const roleLabel = isOwnerItem
                ? t("channelDetails.moderators.roleOwner")
                : t("channelDetails.moderators.roleModerator");
              const reviewEnabled = isOwnerItem ? true : item.canReviewDeals;
              return (
                <AnimatedListItem
                  key={item.userId}
                  index={index}
                  pulseKey={`${item.isActive}-${item.canReviewDeals}`}
                >
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/70 p-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10">
                        {item.avatar ? (
                          <AvatarImage src={item.avatar} alt={item.displayName} />
                        ) : null}
                        <AvatarFallback className="bg-secondary/60 text-xs font-semibold text-muted-foreground">
                          {getInitials(item.displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {item.displayName}
                          </p>
                          <span className="rounded-full border border-border/60 bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                            {roleLabel}
                          </span>
                          {isInactive ? (
                            <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">
                              {t("channelDetails.moderators.inactive")}
                            </span>
                          ) : null}
                        </div>
                        {item.username ? (
                          <p className="text-xs text-muted-foreground">@{item.username}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {shouldShowSwitch ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">
                            {reviewEnabled ? t("common.on") : t("common.off")}
                          </span>
                          <Switch
                            checked={reviewEnabled}
                            disabled={isToggleDisabled}
                            onCheckedChange={(checked) =>
                              handleToggleReview(item, checked)
                            }
                          />
                        </div>
                      ) : (
                        <span className="rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                          {reviewEnabled ? t("common.on") : t("common.off")}
                        </span>
                      )}
                    </div>
                  </div>
                </AnimatedListItem>
              );
            })}
          </AnimatedList>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/70 p-6 text-center">
            <p className="text-sm font-semibold text-foreground">
              {t("channelDetails.moderators.emptyTitle")}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("channelDetails.moderators.emptySubtitle")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelModerators;
