import type { TranslationKey } from "@/i18n/translations";

export interface TagOption {
  value: string;
  labelKey: TranslationKey;
}

export interface TagCategory {
  titleKey: TranslationKey;
  tags: TagOption[];
}

const hiddenTagValues = new Set(["Can edit after posting", "No edits after posting"]);

const tagLabelOverrides: Record<string, TranslationKey> = {
  "Must be pre-approved": "listings.tags.mustBeApproved",
};

export const filterListingTags = (tags?: string[] | null) =>
  (tags ?? []).filter((tag) => !hiddenTagValues.has(tag));

export const listingTagCategories: TagCategory[] = [
  {
    titleKey: "listings.tags.categories.prohibited",
    tags: [
      { value: "Casino", labelKey: "listings.tags.casino" },
      { value: "Betting", labelKey: "listings.tags.betting" },
      { value: "Gambling", labelKey: "listings.tags.gambling" },
      { value: "Adult content", labelKey: "listings.tags.adultContent" },
      { value: "Crypto tokens / ICO", labelKey: "listings.tags.cryptoTokens" },
      { value: "Financial advice", labelKey: "listings.tags.financialAdvice" },
      { value: "Political ads", labelKey: "listings.tags.politicalAds" },
      { value: "Supplements / pills", labelKey: "listings.tags.supplements" },
    ],
  },
  {
    titleKey: "listings.tags.categories.allowed",
    tags: [
      { value: "Links allowed", labelKey: "listings.tags.linksAllowed" },
      { value: "Promo codes allowed", labelKey: "listings.tags.promoCodesAllowed" },
      { value: "Giveaway allowed", labelKey: "listings.tags.giveawayAllowed" },
      { value: "NSFW not allowed", labelKey: "listings.tags.nsfwNotAllowed" },
      { value: "English only", labelKey: "listings.tags.englishOnly" },
      { value: "Russian allowed", labelKey: "listings.tags.russianAllowed" },
    ],
  },
];

export const flattenTagOptions = (
  categories: TagCategory[],
  t: (key: TranslationKey) => string
): Array<{ value: string; label: string }> =>
  categories.flatMap((category) =>
    category.tags.map((tag) => ({
      value: tag.value,
      label: t(tag.labelKey),
    }))
  );

export const getListingTagLabel = (value: string, t: (key: TranslationKey) => string) => {
  const override = tagLabelOverrides[value];
  if (override) {
    return t(override);
  }
  for (const category of listingTagCategories) {
    const match = category.tags.find((tag) => tag.value === value);
    if (match) {
      return t(match.labelKey);
    }
  }
  return value;
};
