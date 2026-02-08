import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { updateChannelDisabledStatus } from "@/api/features/channelsApi";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ROUTES } from "@/constants/routes";

const ChannelSettings = () => {
  const { channel } = useOutletContext<ChannelManageContext>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isDisabled, setIsDisabled] = useState(channel.isDisabled);
  const [isUpdating, setIsUpdating] = useState(false);
  const isOwner = channel.membership?.role === "OWNER";

  const handleToggleDisabled = async () => {
    const nextValue = !isDisabled;
    setIsUpdating(true);
    try {
      await updateChannelDisabledStatus({ id: channel.id, disabled: nextValue });
      setIsDisabled(nextValue);
      toast.success(nextValue ? t("channels.settings.disabledToast") : t("channels.settings.enabledToast"));
    } catch (error) {
      toast.error(t("channels.settings.updateError"));
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-2">
      {isOwner ? (
        <button
          type="button"
          onClick={() => navigate(ROUTES.CHANNEL_MANAGE_MODERATORS(channel.id))}
          className="w-full glass p-4 rounded-lg flex items-center justify-between hover:bg-card/60 transition-colors text-left"
        >
          <span className="text-foreground font-medium">{t("channels.settings.manageManagers")}</span>
          <span className="text-muted-foreground">{t("common.arrowSymbol")}</span>
        </button>
      ) : null}
      <div className="glass rounded-lg p-4 space-y-2">
        <button
          type="button"
          onClick={handleToggleDisabled}
          disabled={isUpdating}
          className="w-full flex items-center justify-between text-left hover:text-foreground transition-colors disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span className="text-foreground font-medium">
            {isDisabled ? t("channels.settings.resumeChannel") : t("channels.settings.pauseChannel")}
          </span>
          <span className="text-muted-foreground">{t("common.arrowSymbol")}</span>
        </button>
        <p className="text-xs text-muted-foreground">
          {t("channels.settings.pauseHint")}
        </p>
      </div>

      <button className="w-full glass p-4 rounded-lg flex items-center justify-between hover:bg-destructive/20 transition-colors text-left mt-4">
        <span className="text-destructive font-medium">{t("channels.settings.removeChannel")}</span>
        <span className="text-destructive">{t("common.arrowSymbol")}</span>
      </button>
    </div>
  );
};

export default ChannelSettings;
