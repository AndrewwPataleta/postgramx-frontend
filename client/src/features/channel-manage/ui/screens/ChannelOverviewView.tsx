import { Link } from "react-router-dom";
import { ListingCard } from "@/features/listings/ui/ListingCard";
import ListingsSkeleton from "@/features/listings/ui/skeletons/ListingsSkeleton";
import { ROUTES } from "@/constants/routes";
import { useLanguage } from "@/i18n/LanguageProvider";
import { AnimatedList, AnimatedListItem } from "@/motion/AnimatedList";
import type { ListingEntity } from "@/models/entities";

interface ChannelOverviewViewProps {
  channelId: string;
  description: string | null;
  listings: ListingEntity[];
  isLoading: boolean;
}

export function ChannelOverviewView({ channelId, description, listings, isLoading }: ChannelOverviewViewProps) {
  const { t } = useLanguage();
  const hasListings = listings.length > 0;

  return (
    <>
      {description ? <div className="glass p-4 text-sm text-muted-foreground">{description}</div> : null}

      <div className="glass p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-foreground">{t("listings.title")}</h3>
            <p className="text-xs text-muted-foreground">{t("channels.listingsSubtitle")}</p>
          </div>
          <Link
            to={ROUTES.CHANNEL_MANAGE_LISTINGS(channelId)}
            className="rounded-lg bg-primary/20 px-3 py-1 text-xs font-semibold text-primary"
          >
            {t("listings.viewAll")}
          </Link>
        </div>

        {isLoading && listings.length === 0 ? (
          <ListingsSkeleton count={3} variant="compact" />
        ) : hasListings ? (
          <AnimatedList itemsCount={listings.length} className="space-y-3">
            {listings.map((listing, index) => (
              <AnimatedListItem key={listing.id} index={index} pulseKey={listing.isActive}>
                <ListingCard listing={listing} variant="compact" />
              </AnimatedListItem>
            ))}
          </AnimatedList>
        ) : (
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 text-center">
            <p className="text-sm font-semibold text-foreground">{t("listings.emptyTitle")}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t("listings.emptySubtitle")}</p>
            <Link
              to={ROUTES.CHANNEL_MANAGE_LISTINGS_CREATE(channelId)}
              className="mt-3 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              {t("listings.createAction")}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
