import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/ui/avatar";
import { Switch } from "@/design-system/ui/switch";
import { ChannelDetailsModeratorsSkeleton } from "@/features/channels/ui/skeletons/ChannelDetailsSkeleton";
import { useLanguage } from "@/i18n/LanguageProvider";
import { AnimatedList, AnimatedListItem } from "@/motion/AnimatedList";
import type { ChannelModeratorsItemViewState } from "../../model/types";

interface ChannelModeratorsViewProps {
  isOwner: boolean;
  moderators: ChannelModeratorsItemViewState[];
  currentUserId: string | null;
  pendingModeratorId: string | null;
  isLoading: boolean;
  isMutating: boolean;
  errorMessage: string | null;
  onToggleReview: (userId: string, checked: boolean) => void;
  onGoBack: () => void;
}

export function ChannelModeratorsView(props: ChannelModeratorsViewProps) {
  const { t } = useLanguage();

  if (!props.isOwner) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{t("channelDetails.tabs.moderators")}</h3>
        </div>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-2">
          <p className="text-sm font-semibold text-foreground">{t("channelModerators.accessDeniedTitle")}</p>
          <p className="text-xs text-muted-foreground">{t("channelModerators.accessDeniedSubtitle")}</p>
          <button
            type="button"
            onClick={props.onGoBack}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
          >
            {t("common.back")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-4">
        <p className="text-xs text-muted-foreground">{t("channelDetails.moderators.description")}</p>

        {props.isLoading ? (
          <ChannelDetailsModeratorsSkeleton count={4} />
        ) : props.errorMessage ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {props.errorMessage}
          </div>
        ) : props.moderators.length > 0 ? (
          <AnimatedList itemsCount={props.moderators.length} className="space-y-3">
            {props.moderators.map((item, index) => {
              const canManage = Boolean(props.currentUserId && props.isOwner);
              const shouldShowSwitch = item.isOwnerItem || canManage;
              const isPending = props.pendingModeratorId === item.userId;
              const isToggleDisabled =
                item.isOwnerItem || item.isInactive || !canManage || isPending || props.isMutating;
              return (
                <AnimatedListItem key={item.userId} index={index} pulseKey={`${item.isActive}-${item.canReviewDeals}`}>
                  <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/70 p-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar className="h-10 w-10">
                        {item.avatar ? <AvatarImage src={item.avatar} alt={item.displayName} /> : null}
                        <AvatarFallback className="bg-secondary/60 text-xs font-semibold text-muted-foreground">{item.initials}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-foreground truncate">{item.displayName}</p>
                          <span className="rounded-full border border-border/60 bg-background px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">{item.roleLabel}</span>
                          {item.isInactive ? <span className="rounded-full border border-warning/40 bg-warning/10 px-2 py-0.5 text-[10px] font-semibold text-warning">{t("channelDetails.moderators.inactive")}</span> : null}
                        </div>
                        {item.username ? <p className="text-xs text-muted-foreground">@{item.username}</p> : null}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {shouldShowSwitch ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">{item.reviewEnabled ? t("common.on") : t("common.off")}</span>
                          <Switch
                            checked={item.reviewEnabled}
                            disabled={isToggleDisabled}
                            onCheckedChange={(checked) => props.onToggleReview(item.userId, checked)}
                          />
                        </div>
                      ) : (
                        <span className="rounded-full border border-border/60 bg-background px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{item.reviewEnabled ? t("common.on") : t("common.off")}</span>
                      )}
                    </div>
                  </div>
                </AnimatedListItem>
              );
            })}
          </AnimatedList>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-card/70 p-6 text-center">
            <p className="text-sm font-semibold text-foreground">{t("channelDetails.moderators.emptyTitle")}</p>
            <p className="mt-2 text-xs text-muted-foreground">{t("channelDetails.moderators.emptySubtitle")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
