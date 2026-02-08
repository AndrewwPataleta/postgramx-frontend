import BottomSheet from "@/components/BottomSheet";
import { useLanguage } from "@/i18n/LanguageProvider";

type ChannelOwnerLinkSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ChannelOwnerLinkSheet = ({ open, onOpenChange }: ChannelOwnerLinkSheetProps) => {
  const { t } = useLanguage();

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t("channels.ownerLinkSheet.title")}
    >
      <p className="text-sm text-muted-foreground">
        {t("channels.ownerLinkSheet.body")}
      </p>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          {t("channels.ownerLinkSheet.primaryAction")}
        </button>
      </div>
    </BottomSheet>
  );
};

export default ChannelOwnerLinkSheet;
