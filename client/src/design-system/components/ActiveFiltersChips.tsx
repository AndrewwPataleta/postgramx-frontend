import { X } from "lucide-react";
import { FilterState } from "./FilterModal";
import { useLanguage } from "@/i18n/LanguageProvider";

interface ActiveFiltersChipsProps {
  filters: FilterState;
  onRemoveFilter: (filterType: string, value?: string) => void;
}

export const ActiveFiltersChips = ({
  filters,
  onRemoveFilter,
}: ActiveFiltersChipsProps) => {
  const { t } = useLanguage();
  const hasActiveFilters =
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 10 ||
    filters.subscribersRange[0] > 0 ||
    filters.subscribersRange[1] < 1000000 ||
    filters.languages.length > 0 ||
    filters.categories.length > 0 ||
    filters.tags.length > 0 ||
    filters.verifiedOnly;

  if (!hasActiveFilters) return null;

  return (
    <div className="px-4 py-3 bg-secondary/30 border-b border-border/30 space-y-2">
      <div className="flex items-center gap-1.5 flex-wrap">
        {filters.priceRange[0] > 0 || filters.priceRange[1] < 10 ? (
          <button
            onClick={() => onRemoveFilter("priceRange")}
            className="inline-flex items-center gap-1.5 bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          >
            {t("marketplace.filters.active.price")}: {filters.priceRange[0].toFixed(1)}-
            {filters.priceRange[1].toFixed(1)} {t("common.ton")}
            <X size={14} />
          </button>
        ) : null}

        {filters.subscribersRange[0] > 0 ||
        filters.subscribersRange[1] < 1000000 ? (
          <button
            onClick={() => onRemoveFilter("subscribersRange")}
            className="inline-flex items-center gap-1.5 bg-accent/20 hover:bg-accent/30 text-accent px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          >
            {t("marketplace.filters.active.subscribers")}:{" "}
            {(filters.subscribersRange[0] / 1000).toFixed(0)}K-
            {(filters.subscribersRange[1] / 1000).toFixed(0)}K
            <X size={14} />
          </button>
        ) : null}

        {filters.verifiedOnly ? (
          <button
            onClick={() => onRemoveFilter("verifiedOnly")}
            className="inline-flex items-center gap-1.5 bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          >
            {t("marketplace.filters.verifiedOnly")}
            <X size={14} />
          </button>
        ) : null}

        {filters.languages.map((lang) => (
          <button
            key={lang}
            onClick={() => onRemoveFilter("languages", lang)}
            className="inline-flex items-center gap-1.5 bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          >
            {lang}
            <X size={14} />
          </button>
        ))}

        {filters.categories.map((cat) => (
          <button
            key={cat}
            onClick={() => onRemoveFilter("categories", cat)}
            className="inline-flex items-center gap-1.5 bg-accent/20 hover:bg-accent/30 text-accent px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          >
            {cat}
            <X size={14} />
          </button>
        ))}

        {filters.tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onRemoveFilter("tags", tag)}
            className="inline-flex items-center gap-1.5 bg-secondary/70 hover:bg-secondary text-foreground px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
          >
            {tag}
            <X size={14} />
          </button>
        ))}
      </div>
    </div>
  );
};
