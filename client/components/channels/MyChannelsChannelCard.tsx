import { useMemo, type ReactNode } from "react";
import { Link } from "react-router-dom";
import ChannelCard, { type ChannelCardModel } from "@/components/channels/ChannelCard";
import type { ChannelEntity } from "@/models/entities";
import { useLanguage } from "@/i18n/LanguageProvider";

interface MyChannelsChannelCardProps {
  channel: ChannelEntity;
  placementsCount?: number | null;
  minPriceNano?: string | null;
  tags?: string[];
  rules?: ChannelCardModel["rules"];
  onClick?: () => void;
  onToggleExpand?: () => void;
  isExpanded?: boolean;
  expandedContent?: ReactNode;
  onUnlink?: () => void;
  createListingTo: string;
  createListingState?: Record<string, unknown>;
}

export default function MyChannelsChannelCard({
  channel,
  placementsCount,
  minPriceNano,
  tags,
  rules,
  onClick,
  onToggleExpand,
  isExpanded,
  expandedContent,
  onUnlink,
  createListingTo,
  createListingState,
}: MyChannelsChannelCardProps) {
  const { t } = useLanguage();
  const cardModel = useMemo<ChannelCardModel>(
    () => ({
      id: channel.id,
      name: channel.title || t("channels.untitled"),
      username: channel.username,
      avatarUrl: null,
      subscribers: channel.subscribersCount ?? channel.memberCount ?? null,
      placementsCount: placementsCount ?? null,
      minPriceNano: minPriceNano ?? null,
      tags: tags ?? [],
      preview: channel.preview,
      isMine: true,
      rules: rules ?? null,
    }),
    [channel, placementsCount, minPriceNano, tags, rules, t]
  );

  return (
    <ChannelCard
      channel={cardModel}
      onClick={onClick}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      expandedContent={expandedContent}
      headerActions={
        onUnlink ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onUnlink();
            }}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-background/70 text-muted-foreground transition hover:text-foreground"
            aria-label={t("channels.unlinkAction")}
          >
            {t("common.closeSymbol")}
          </button>
        ) : null
      }
      primaryAction={
        <Link
          to={createListingTo}
          state={createListingState}
          onClick={(event) => event.stopPropagation()}
          className="block w-full rounded-lg bg-primary px-3 py-2 text-center text-[11px] font-semibold leading-snug text-primary-foreground"
        >
          {t("listings.createAction")}
        </Link>
      }
    />
  );
}
