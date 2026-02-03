import { useState, useEffect, useMemo } from "react";
import { X, ChevronDown } from "lucide-react";
import { flattenTagOptions, listingTagCategories } from "@/features/listings/tagOptions";
import { useLanguage } from "@/i18n/LanguageProvider";
import { formatNumber } from "@/i18n/formatters";

export interface FilterState {
  priceRange: [number, number];
  subscribersRange: [number, number];
  languages: string[];
  categories: string[];
  tags: string[];
  verifiedOnly: boolean;
  dateRange: [string, string];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  onReset: () => void;
}



export const FilterModal = ({
  isOpen,
  onClose,
  filters,
  onApply,
  onReset,
}: FilterModalProps) => {
  const { t, language } = useLanguage();
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const formatCompact = (value: number) =>
    formatNumber(value, language, { notation: "compact", maximumFractionDigits: 1 });
  const [expandedSections, setExpandedSections] = useState({
    pricing: true,
    audience: true,
    language: false,
    category: false,
    tags: false,
    availability: false,
    verification: false,
  });
  const [tagQuery, setTagQuery] = useState("");
  const [customTag, setCustomTag] = useState("");
  const tagOptions = useMemo(() => flattenTagOptions(listingTagCategories, t), [t]);

  const pricePresets: Array<{ label: string; range: [number, number] }> = [
    { label: t("common.any"), range: [0, 10] },
    { label: `0-1 ${t("common.ton")}`, range: [0, 1] },
    { label: `1-5 ${t("common.ton")}`, range: [1, 5] },
    { label: `5-10 ${t("common.ton")}`, range: [5, 10] },
  ];

  const subscribersPresets: Array<{ label: string; range: [number, number] }> = [
    { label: t("common.any"), range: [0, 1000000] },
    { label: "0-10K", range: [0, 10000] },
    { label: "10-100K", range: [10000, 100000] },
    { label: "100K-1M", range: [100000, 1000000] },
  ];

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handlePriceChange = (
    index: 0 | 1,
    value: number
  ) => {
    const newRange = [...localFilters.priceRange] as [number, number];
    newRange[index] = value;
    setLocalFilters((prev) => ({
      ...prev,
      priceRange: newRange,
    }));
  };

  const handleSubscribersChange = (
    index: 0 | 1,
    value: number
  ) => {
    const newRange = [...localFilters.subscribersRange] as [number, number];
    newRange[index] = value;
    setLocalFilters((prev) => ({
      ...prev,
      subscribersRange: newRange,
    }));
  };

  const toggleLanguage = (lang: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      languages: prev.languages.includes(lang)
        ? prev.languages.filter((l) => l !== lang)
        : [...prev.languages, lang],
    }));
  };

  const toggleCategory = (cat: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    onReset();
    setLocalFilters({
      priceRange: [0, 10],
      subscribersRange: [0, 1000000],
      languages: [],
      categories: [],
      tags: [],
      verifiedOnly: false,
      dateRange: ["", ""],
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-label={t("common.close")}
      />

      {/* Bottom Sheet Modal */}
      <div className="fixed inset-x-0 bottom-0 top-0 bg-card rounded-t-2xl z-50 animate-in slide-in-from-bottom-10 duration-300 flex flex-col h-[100dvh] sm:h-auto sm:top-auto sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border/50 px-4 py-4 flex items-center justify-between rounded-t-2xl shrink-0">
          <h2 className="text-lg font-semibold text-foreground">
            {t("marketplace.filters.title")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
            aria-label={t("common.close")}
          >
            <X size={20} className="text-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-4 space-y-4 flex-1 overflow-y-auto">
          {/* Pricing Section */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection("pricing")}
              className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <span className="font-semibold text-foreground">
                {t("marketplace.filters.pricingTitle")}
              </span>
              <ChevronDown
                size={18}
                className={`text-muted-foreground transition-transform ${
                  expandedSections.pricing ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.pricing && (
              <div className="px-3 space-y-3 pb-3">
                <div className="flex flex-wrap gap-2">
                  {pricePresets.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() =>
                        setLocalFilters((prev) => ({
                          ...prev,
                          priceRange: preset.range,
                        }))
                      }
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        localFilters.priceRange[0] === preset.range[0] &&
                        localFilters.priceRange[1] === preset.range[1]
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground hover:bg-secondary/80"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="number"
                    value={localFilters.priceRange[0]}
                    onChange={(e) =>
                      handlePriceChange(0, parseFloat(e.target.value) || 0)
                    }
                    className="w-full min-w-0 flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={t("common.min")}
                  />
                  <input
                    type="number"
                    value={localFilters.priceRange[1]}
                    onChange={(e) =>
                      handlePriceChange(1, parseFloat(e.target.value) || 10)
                    }
                    className="w-full min-w-0 flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder={t("common.max")}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  <span className="price-text">
                    {formatNumber(localFilters.priceRange[0], language)} -{" "}
                    {formatNumber(localFilters.priceRange[1], language)} {t("common.ton")}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Audience Section */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection("audience")}
              className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <span className="font-semibold text-foreground">
                {t("marketplace.filters.audienceTitle")}
              </span>
              <ChevronDown
                size={18}
                className={`text-muted-foreground transition-transform ${
                  expandedSections.audience ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.audience && (
              <div className="px-3 space-y-4 pb-3">
                {/* Subscribers */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    {t("marketplace.filters.subscribersLabel")}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {subscribersPresets.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            subscribersRange: preset.range,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                          localFilters.subscribersRange[0] === preset.range[0] &&
                          localFilters.subscribersRange[1] === preset.range[1]
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 mb-2 sm:flex-row">
                    <input
                      type="number"
                      value={localFilters.subscribersRange[0]}
                      onChange={(e) =>
                        handleSubscribersChange(0, parseInt(e.target.value) || 0)
                      }
                      className="w-full min-w-0 flex-1 bg-input border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder={t("common.min")}
                    />
                    <input
                      type="number"
                      value={localFilters.subscribersRange[1]}
                      onChange={(e) =>
                        handleSubscribersChange(1, parseInt(e.target.value) || 1000000)
                      }
                      className="w-full min-w-0 flex-1 bg-input border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      placeholder={t("common.max")}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCompact(localFilters.subscribersRange[0])} -{" "}
                    {formatCompact(localFilters.subscribersRange[1])}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tags Section */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection("tags")}
              className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <span className="font-semibold text-foreground">
                {t("marketplace.filters.tagsTitle")}
              </span>
              <ChevronDown
                size={18}
                className={`text-muted-foreground transition-transform ${
                  expandedSections.tags ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.tags && (
              <div className="px-3 pb-3 space-y-3">
                <input
                  type="text"
                  value={tagQuery}
                  onChange={(event) => setTagQuery(event.target.value)}
                  placeholder={t("marketplace.filters.tagsSearch")}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(event) => setCustomTag(event.target.value)}
                    placeholder={t("marketplace.filters.tagsCustom")}
                    className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const nextTag = customTag.trim();
                      if (!nextTag) {
                        return;
                      }
                      setLocalFilters((prev) => ({
                        ...prev,
                        tags: prev.tags.includes(nextTag) ? prev.tags : [...prev.tags, nextTag],
                      }));
                      setCustomTag("");
                    }}
                    className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary"
                  >
                    {t("common.add")}
                  </button>
                </div>
                {localFilters.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {localFilters.tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          setLocalFilters((prev) => ({
                            ...prev,
                            tags: prev.tags.filter((item) => item !== tag),
                          }))
                        }
                        className="rounded-full bg-secondary px-3 py-1 text-xs text-foreground hover:bg-secondary/80"
                      >
                        {tag} {t("common.removeTagSuffix")}
                      </button>
                    ))}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {tagOptions
                    .filter((tag) =>
                      tag.label.toLowerCase().includes(tagQuery.trim().toLowerCase()),
                    )
                    .map((tag) => {
                      const isSelected = localFilters.tags.includes(tag.value);
                      return (
                        <button
                          key={tag.value}
                          type="button"
                          onClick={() =>
                            setLocalFilters((prev) => ({
                              ...prev,
                              tags: isSelected
                                ? prev.tags.filter((item) => item !== tag.value)
                                : [...prev.tags, tag.value],
                            }))
                          }
                          className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                            isSelected
                              ? "border-primary/60 bg-primary/20 text-primary"
                              : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {tag.label}
                        </button>
                      );
                    })}
                </div>
              </div>
            )}
          </div>



          {/* Verification Section */}
          <div className="space-y-3">
            <button
              onClick={() => toggleSection("verification")}
              className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg transition-colors"
            >
              <span className="font-semibold text-foreground">
                {t("marketplace.filters.verificationTitle")}
              </span>
              <ChevronDown
                size={18}
                className={`text-muted-foreground transition-transform ${
                  expandedSections.verification ? "rotate-180" : ""
                }`}
              />
            </button>
            {expandedSections.verification && (
              <div className="px-3 pb-3">
                <label className="flex items-center gap-3 p-3 cursor-pointer hover:bg-secondary/50 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={localFilters.verifiedOnly}
                    onChange={(e) =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        verifiedOnly: e.target.checked,
                      }))
                    }
                    className="w-5 h-5 bg-secondary border border-border rounded accent-primary cursor-pointer"
                  />
                  <span className="text-foreground font-medium">
                    {t("marketplace.filters.verifiedOnly")}
                  </span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border/50 px-4 py-4 space-y-3">
          <button
            onClick={handleApply}
            className="button-primary w-full py-3 text-base font-semibold"
          >
            {t("marketplace.filters.apply")}
          </button>
          <button
            onClick={handleReset}
            className="button-secondary w-full py-3 text-base font-semibold"
          >
            {t("common.reset")}
          </button>
        </div>
      </div>
    </>
  );
};
