import { formatTonValue } from "@/i18n/formatters";
import { formatDuration, getListingFormatLabel } from "@/i18n/labels";
import { useLanguage } from "@/i18n/LanguageProvider";
import {
  filterListingTags,
  getListingTagLabel,
  listingTagCategories,
} from "@/features/listings/tagOptions";

interface ListingPreviewDetailsProps {
  priceTon: number;
  format?: "POST";
  pinDurationHours: number | null;
  visibilityDurationHours: number;
  allowPinnedPlacement?: boolean;
  tags: string[];
  requiresApproval?: boolean;
  restrictionRulesText?: string;
  additionalRequirementsText?: string;
}

const buildAvailabilityLabel = (
  from: string | undefined,
  to: string | undefined,
  t: (key: string, params?: Record<string, string | number>) => string
) => {
  if (!from || !to) {
    return null;
  }
  const start = new Date(from);
  const end = new Date(to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }
  const diffMs = end.getTime() - start.getTime();
  const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  return t("listings.availabilityLabel", { days: diffDays });
};

export function ListingPreviewDetails({
  priceTon,
  format = "POST",
  pinDurationHours,
  visibilityDurationHours,
  allowPinnedPlacement,
  tags,
  requiresApproval,
  restrictionRulesText,
  additionalRequirementsText,
}: ListingPreviewDetailsProps) {
  const { t, language } = useLanguage();
  const pinnedLabel = pinDurationHours ? formatDuration(pinDurationHours, t) : t("common.none");
  const visibilityLabel = formatDuration(visibilityDurationHours, t);
  const pinnedAvailable = pinDurationHours !== null || Boolean(allowPinnedPlacement);
  const filteredTags = filterListingTags(tags);
  const allowedTagValues = new Set(
    listingTagCategories
      .find((category) => category.titleKey === "listings.tags.categories.allowed")
      ?.tags.map((tag) => tag.value) ?? []
  );
  const allowedTags = filteredTags.filter((tag) => allowedTagValues.has(tag));
  const restrictedTags = filteredTags.filter((tag) => !allowedTagValues.has(tag));
  const orderedRestrictedTags = [
    ...new Set([
      ...restrictedTags.filter((tag) => tag === "Must be pre-approved"),
      ...restrictedTags.filter((tag) => tag !== "Must be pre-approved"),
    ]),
  ];
  const priceLabel = formatTonValue(priceTon, language);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-4 space-y-6">
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("listings.preview.pricingTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">{t("listings.preview.pricingSubtitle")}</p>
        </div>
        <div className="grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
          <div className="rounded-xl border border-border/60 bg-card px-3 py-2">
            <p className="text-[11px] font-semibold text-muted-foreground">
              {t("common.price")}
            </p>
            <p className="text-sm font-semibold price-text">
              {priceLabel} {t("common.ton")}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card px-3 py-2">
            <p className="text-[11px] font-semibold text-muted-foreground">
              {t("listings.formatLabel")}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {getListingFormatLabel(t, format)}
            </p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card px-3 py-2">
            <p className="text-[11px] font-semibold text-muted-foreground">
              {t("listings.pinnedLabel")}
            </p>
            <p className="text-sm font-semibold text-foreground">{pinnedLabel}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card px-3 py-2">
            <p className="text-[11px] font-semibold text-muted-foreground">
              {t("listings.visibleInFeed")}
            </p>
            <p className="text-sm font-semibold text-foreground">{visibilityLabel}</p>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("listings.preview.allowedTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">{t("listings.preview.allowedSubtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full bg-secondary/60 px-3 py-1 text-foreground">
            {pinnedAvailable
              ? t("listings.pinnedPlacementAvailable")
              : t("listings.noPinnedPlacement")}
          </span>
          {allowedTags.length ? (
            allowedTags.map((tag) => (
              <span
                key={`allowed-${tag}`}
                className="rounded-full bg-secondary/60 px-3 py-1 text-foreground"
              >
                {getListingTagLabel(tag, t)}
              </span>
            ))
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("listings.preview.restrictedTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("listings.preview.restrictedSubtitle")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px]">
          {orderedRestrictedTags.length ? (
            orderedRestrictedTags.map((tag) => {
              const isLocked = tag === "Must be pre-approved";
              return (
                <span
                  key={tag}
                  className={`rounded-full border px-3 py-1 ${
                    isLocked
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border/60 bg-card text-foreground"
                  }`}
                >
                  {getListingTagLabel(tag, t)}
                </span>
              );
            })
          ) : (
            <span className="text-muted-foreground">{t("listings.tagsEmpty")}</span>
          )}
        </div>
        {requiresApproval ? (
          <span className="inline-flex w-fit rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold text-primary">
            {t("listings.preApprovalRequired")}
          </span>
        ) : null}
      </section>

      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {t("listings.preview.additionalTitle")}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t("listings.preview.additionalSubtitle")}
          </p>
        </div>
        <div className="rounded-xl border border-border/60 bg-card px-3 py-3 text-sm text-foreground">
          {additionalRequirementsText?.trim() ? additionalRequirementsText : t("common.emptyValue")}
        </div>
      </section>
    </div>
  );
}
