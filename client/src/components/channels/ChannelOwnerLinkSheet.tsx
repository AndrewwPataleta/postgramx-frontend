import BottomSheet from "@/components/BottomSheet";
import { useLanguage } from "@/i18n/LanguageProvider";

type ChannelOwnerLinkSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  titleKey?: string;
  bodyKey?: string;
  primaryActionKey?: string;
};

const ChannelOwnerLinkSheet = ({
  open,
  onOpenChange,
  titleKey = "channels.ownerLinkSheet.title",
  bodyKey = "channels.ownerLinkSheet.body",
  primaryActionKey = "channels.ownerLinkSheet.primaryAction",
}: ChannelOwnerLinkSheetProps) => {
  const { t } = useLanguage();

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title={t(titleKey)}
    >
      <p className="text-sm text-muted-foreground">
        {t(bodyKey)}
      </p>
      <div className="mt-4">
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          {t(primaryActionKey)}
        </button>
      </div>
    </BottomSheet>
  );
};

export default ChannelOwnerLinkSheet;
