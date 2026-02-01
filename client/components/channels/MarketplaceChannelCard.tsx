import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChannelCard, { type ChannelCardModel } from "@/components/channels/ChannelCard";
import ChannelListingsPreview from "@/features/channels/components/ChannelListingsPreview";
import { openTelegramLink } from "@/lib/telegramLinks";
import { getAllowEditsLabel, getAllowLinkTrackingLabel } from "@/i18n/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ChannelEntity, ListingEntity } from "@/models/entities";
import { ROUTES } from "@/constants/routes";

interface MarketplaceChannelCardProps {
  channel: ChannelEntity & { listings: ListingEntity[] };
}

const collectRules = (
  listings: ListingEntity[],
  t: (key: string) => string
): { allowed: string[]; prohibited: string[] } => {
  const allowed = new Set<string>();
  const prohibited = new Set<string>();

  listings.forEach((listing) => {
    if (listing.allowEdits) {
      allowed.add(getAllowEditsLabel(t, true));
    }
    if (listing.allowLinkTracking) {
      allowed.add(getAllowLinkTrackingLabel(t, true));
    }
    if (listing.allowPinnedPlacement) {
      allowed.add(t("listings.allowPinned.allowed"));
    }
    if (listing.requiresApproval) {
      allowed.add(t("listings.requiresApproval"));
    }
    listing.tags.forEach((tag) => prohibited.add(tag));
    listing.contentRulesText
      .split(/\n|•|,/)
      .map((rule) => rule.trim())
      .filter(Boolean)
      .forEach((rule) => prohibited.add(rule));
  });

  return {
    allowed: Array.from(allowed),
    prohibited: Array.from(prohibited),
  };
};

export default function MarketplaceChannelCard({ channel }: MarketplaceChannelCardProps) {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);
  const trimmedUsername = channel.username?.replace(/^@/, "");
  const telegramLink = trimmedUsername ? `https://t.me/${trimmedUsername}` : null;
  const rules = collectRules(channel.listings ?? [], t);

  const cardModel = useMemo<ChannelCardModel>(
    () => ({
      id: channel.id,
      name: channel.title,
      username: channel.username,
      about: null,
      avatarUrl: null,
      subscribers: channel.subscribersCount ?? null,
      placementsCount: channel.listings?.length ?? 0,
      minPriceNano: channel.listings?.length
        ? channel.listings
            .map((listing) => {
              try {
                return BigInt(listing.priceNano);
              } catch {
                return null;
              }
            })
            .filter((price): price is bigint => price !== null)
            .reduce<bigint | null>(
              (currentMin, price) => (currentMin === null || price < currentMin ? price : currentMin),
              null
            )
            ?.toString() ?? null
        : null,
      currency: "TON",
      tags: Array.from(new Set(channel.listings?.flatMap((listing) => listing.tags) ?? [])),
      listingsPreview: channel.listings ?? [],
      rules,
    }),
    [channel, rules]
  );

  const handleNavigate = () => {
    navigate(ROUTES.CHANNEL_DETAILS(channel.id), {
      state: {
        channel,
        rootBackTo: ROUTES.MARKETPLACE,
      },
    });
  };

  return (
    <ChannelCard
      channel={cardModel}
      onClick={handleNavigate}
      isExpanded={isExpanded}
      onToggleExpand={() => setIsExpanded((prev) => !prev)}
      expandedContent={
        <ChannelListingsPreview channelId={channel.id} isExpanded={isExpanded} mode="viewer" />
      }
      actions={
        telegramLink ? (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              openTelegramLink(telegramLink);
            }}
            className="rounded-lg border border-border/60 bg-background/70 px-3 py-1 text-[11px] font-semibold text-muted-foreground"
          >
            {t("marketplace.openChannel")}
          </button>
        ) : null
      }
    />
  );
}
