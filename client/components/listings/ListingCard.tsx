import type { ReactNode } from "react";
import type { ListingEntity } from "@/models/entities";
import { formatTon } from "@/i18n/formatters";
import { formatDuration } from "@/i18n/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import { filterListingTags, getListingTagLabel } from "@/features/listings/tagOptions";

type ListingCardVariant = "compact" | "full";

interface ListingCardProps {
  listing: ListingEntity;
  variant?: ListingCardVariant;
  actionSlot?: ReactNode;
}

export function ListingCard({ listing, variant = "full", actionSlot }: ListingCardProps) {
  const { t, language } = useLanguage();
  const tags = filterListingTags(listing.tags ?? []);
  const normalizedTags = [
    ...new Set([
      ...tags.filter((tag) => tag === "Must be pre-approved"),
      ...tags.filter((tag) => tag !== "Must be pre-approved"),
    ]),
  ];
  const maxTags = variant === "compact" ? 3 : normalizedTags.length;
  const visibleTags = normalizedTags.slice(0, maxTags);
  const remainingTags = Math.max(0, normalizedTags.length - visibleTags.length);
  const visibilityDuration = listing.visibilityDurationHours ?? 24;
  const pinnedDurationLabel = listing.pinDurationHours
    ? formatDuration(listing.pinDurationHours, t)
    : null;
  const visibleDurationLabel = formatDuration(visibilityDuration, t);
  const priceTonLabel = formatTon(listing.priceNano, language);

  return (
    <div
      className={`rounded-2xl border border-border/60 bg-card/80 p-4 ${
        variant === "compact" ? "space-y-3" : "space-y-4"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            {t("listings.format.POST")} •{" "}
            <span className="price-text">
              {priceTonLabel} {t("common.ton")}
            </span>
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            listing.isActive
              ? "bg-success/15 text-success"
              : "bg-destructive/15 text-destructive"
          }`}
        >
          {listing.isActive ? t("listings.status.active") : t("listings.status.inactive")}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-[11px] text-foreground">
        {pinnedDurationLabel ? (
            <span className="rounded-full bg-secondary/60 px-2.5 py-1">
            {t("listings.pinnedLabel")}: {pinnedDurationLabel}
          </span>
        ) : (
            <span className="rounded-full bg-secondary/60 px-2.5 py-1">
            {t("listings.pinnedLabel")}: {t("common.none")}
          </span>
        )}
        <span className="rounded-full bg-secondary/60 px-2.5 py-1">
          {t("listings.visibleLabel")}: {visibleDurationLabel}
        </span>
      </div>
      {normalizedTags.length > 0 ? (
        <div className="flex flex-wrap gap-2 text-[11px] text-foreground">
          {visibleTags.map((tag) => {
            const isLocked = tag === "Must be pre-approved";
            return (
              <span
                key={tag}
                className={`rounded-full border px-2.5 py-1 ${
                  isLocked
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border/60 bg-card text-foreground"
                }`}
              >
                {getListingTagLabel(tag, t)}
              </span>
            );
          })}
          {remainingTags > 0 ? (
            <span className="rounded-full border border-border/60 bg-card px-2.5 py-1 text-muted-foreground">
              +{remainingTags}
            </span>
          ) : null}
        </div>
      ) : null}

      {variant === "full" && actionSlot ? (
        <div className="flex gap-2">{actionSlot}</div>
      ) : null}
    </div>
  );
}
