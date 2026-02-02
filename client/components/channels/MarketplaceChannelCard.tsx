import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ChannelCard, { type ChannelCardModel } from "@/components/channels/ChannelCard";
import ChannelListingsPreview from "@/features/channels/components/ChannelListingsPreview";
import { openTelegramLink } from "@/lib/telegramLinks";
import { getAllowEditsLabel, getAllowLinkTrackingLabel } from "@/i18n/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ListingEntity, MarketplaceChannelSummary } from "@/models/entities";
import { ROUTES } from "@/constants/routes";

interface MarketplaceChannelCardProps {
  channel: MarketplaceChannelSummary;
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
  const listings = channel.listings ?? [];
  const hasListings = listings.length > 0;
  const placementsCount = channel.placementsCount ?? listings.length;
  const hasExpandableListings = placementsCount > 0;
  const rules = hasListings ? collectRules(listings, t) : null;

  const minListingPrice = useMemo(() => {
    if (!hasListings) {
      return null;
    }
    return (
      listings
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
    );
  }, [hasListings, listings]);

  const cardModel = useMemo<ChannelCardModel>(
    () => ({
      id: channel.id,
      name:
        channel.name ??
        channel.title ??
        channel.username?.replace(/^@/, "") ??
        t("marketplace.channelTitle"),
      username: channel.username,
      about: channel.about ?? null,
      avatarUrl: channel.avatarUrl ?? null,
      subscribers: channel.subscribers ?? channel.subscribersCount ?? channel.memberCount ?? null,
      placementsCount: channel.placementsCount ?? (hasListings ? listings.length : null),
      minPriceNano: channel.minPriceNano ?? minListingPrice,
      currency: channel.currency ?? "TON",
      tags: channel.tags ?? Array.from(new Set(listings.flatMap((listing) => listing.tags))),
      listingsPreview: hasListings ? listings : null,
      rules,
    }),
    [channel, hasListings, listings, minListingPrice, rules, t]
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
      isExpanded={hasExpandableListings ? isExpanded : undefined}
      onToggleExpand={hasExpandableListings ? () => setIsExpanded((prev) => !prev) : undefined}
      expandedContent={
        hasExpandableListings ? (
          <ChannelListingsPreview channelId={channel.id} isExpanded={isExpanded} mode="viewer" />
        ) : undefined
      }

    />
  );
}
