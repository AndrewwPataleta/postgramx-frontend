import InfoCard from "@/components/deals/InfoCard";
import type { DealEntity } from "@/models/entities";
import { openTelegramLink } from "@/lib/telegramLinks";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/i18n/LanguageProvider";

interface StageVerifyingProps {
  deal: DealEntity;
  readonly: boolean;
  onAction?: Record<string, never>;
}

export default function StageVerifying({ deal }: StageVerifyingProps) {
  const { t } = useLanguage();
  const channelUsername = deal.channel?.username;
  const postUrl =
    channelUsername && deal.publication?.publishedMessageId
      ? `https://t.me/${channelUsername}/${deal.publication.publishedMessageId}`
      : null;
  const handleOpenPost = () => {
    if (postUrl) {
      openTelegramLink(postUrl);
    }
  };

  return (
    <InfoCard title={t("deals.stage.verifyingPost.title")}>
      <p className="text-xs text-muted-foreground">
        {t("deals.stage.verifyingPost.description")}
      </p>
      {postUrl ? (
        <button
          type="button"
          onClick={handleOpenPost}
          className={cn(
            "rounded-lg border border-border/60 px-4 py-2 text-xs font-semibold text-foreground",
            "hover:border-primary/40"
          )}
        >
          {t("deals.stage.verifyingPost.open")}
        </button>
      ) : (
        <p className="text-xs text-muted-foreground">
          {t("deals.stage.verifyingPost.pendingLink")}
        </p>
      )}
    </InfoCard>
  );
}
