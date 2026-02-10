import { useMemo, useRef, useState, type ChangeEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api/errors";
import { ListingPreviewDetails } from "@/features/listings/ui/ListingPreviewDetails";
import { PageContainer } from "@/design-system/components/PageContainer";
import { filterListingTags, listingTagCategories } from "@/features/listings/tagOptions";
import { createListing } from "@/api/features/listingsApi";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { getListingTagLabel } from "@/features/listings/tagOptions";
import { formatNumber } from "@/i18n/formatters";
import { formatDuration } from "@/i18n/labels";
import { CurrencyCode, ListingFormat } from "@/models/enums";
import { ROUTES } from "@/constants/routes";

const resolveHours = (choice: string, customValue: string, fallback: number) => {
  if (choice === "custom") {
    const parsed = Number(customValue);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
  const parsed = Number(choice);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseTonInputToNano = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === ".") {
    return "0";
  }
  if (!/^\d*\.?\d*$/.test(trimmed)) {
    return "0";
  }
  const [integerPartRaw, fractionRaw = ""] = trimmed.split(".");
  const integerPart = integerPartRaw === "" ? "0" : integerPartRaw;
  const fractionPadded = (fractionRaw + "000000000").slice(0, 9);
  return (BigInt(integerPart) * 1_000_000_000n + BigInt(fractionPadded)).toString();
};

export default function CreateListing() {
  const { t, language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const outletContext = useOutletContext<ChannelManageContext | null>();
  const channel = outletContext?.channel ?? null;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const rootBackTo = (location.state as { rootBackTo?: string } | null)?.rootBackTo;
  const [priceTon, setPriceTon] = useState("25");
  const priceInputRef = useRef<HTMLInputElement | null>(null);
  const [pinDurationChoice, setPinDurationChoice] = useState("none");
  const [pinCustomHours, setPinCustomHours] = useState("");
  const [visibilityDurationChoice, setVisibilityDurationChoice] = useState("24");
  const [visibilityCustomHours, setVisibilityCustomHours] = useState("");
  const [contentRulesText, setContentRulesText] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Must be pre-approved"]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const parsedPrice = Number(priceTon);
  const isPriceValid = Number.isFinite(parsedPrice) && parsedPrice >= 1;
  const showPriceError = priceTon.trim() !== "" && !isPriceValid;

  const handlePriceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value.replace(",", ".");
    if (!/^[0-9]*\.?[0-9]*$/.test(nextValue)) {
      return;
    }
    setPriceTon(nextValue);
  };

  const handlePriceFocus = () => {
    const input = priceInputRef.current;
    if (!input) {
      return;
    }
    const length = input.value.length;
    input.setSelectionRange(length, length);
  };
  const pinDurationOptions = useMemo(
    () => [
      { label: t("listings.pinDuration.none"), value: "none" },
      { label: t("listings.pinDuration.optionHours", { hours: 6 }), value: "6" },
      { label: t("listings.pinDuration.optionHours", { hours: 12 }), value: "12" },
      { label: t("listings.pinDuration.optionHours", { hours: 24 }), value: "24" },
      { label: t("listings.pinDuration.optionHours", { hours: 48 }), value: "48" },
      { label: t("common.custom"), value: "custom" },
    ],
    [t]
  );
  const visibilityDurationOptions = useMemo(
    () => [
      { label: t("listings.visibilityDuration.optionHours", { hours: 24 }), value: "24" },
      { label: t("listings.visibilityDuration.optionHours", { hours: 48 }), value: "48" },
      { label: t("listings.visibilityDuration.optionHours", { hours: 72 }), value: "72" },
      { label: t("listings.visibilityDuration.optionDays", { days: 7 }), value: "168" },
      { label: t("common.custom"), value: "custom" },
    ],
    [t]
  );

  const pinDurationHours =
    pinDurationChoice === "none" ? null : resolveHours(pinDurationChoice, pinCustomHours, 24);
  const visibilityDurationHours = resolveHours(
    visibilityDurationChoice,
    visibilityCustomHours,
    24,
  );

  if (!channel) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <PageContainer className="py-6">
          <p className="text-muted-foreground">{t("channels.notFound")}</p>
        </PageContainer>
      </div>
    );
  }

  const handlePublish = async () => {
    if (isSubmitting) {
      return;
    }
    if (!isPriceValid) {
      toast.error(t("listings.priceMinError"));
      return;
    }

    const ensuredTags = selectedTags.includes("Must be pre-approved")
      ? selectedTags
      : [...selectedTags, "Must be pre-approved"];

    const payload = {
      channelId: channel.id,
      format: ListingFormat.Post,
      priceTon: priceTon,
      currency: CurrencyCode.Ton,
      pinDurationHours,
      visibilityDurationHours,
      allowEdits: true,
      requiresApproval: true,
      contentRulesText,
      tags: filterListingTags(ensuredTags),
      isActive: true,
      allowLinkTracking: true,
      allowPinnedPlacement: pinDurationHours !== null,
    };

    try {
      setIsSubmitting(true);
      await createListing(payload);
      await queryClient.invalidateQueries({
        queryKey: ["listingsByChannel", channel.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["marketplaceListingsByChannel", channel.id],
      });
      queryClient.invalidateQueries({ queryKey: ["channelListingsPreview", channel.id] });
      queryClient.invalidateQueries({ queryKey: ["channelsList"] });
      navigate(ROUTES.CHANNEL_MANAGE_LISTINGS(channel.id), {
        state: rootBackTo ? { rootBackTo } : undefined,
      });
    } catch (error) {
      toast.error(getErrorMessage(error, t("listings.publishError"), t));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="px-3 pt-4 pb-20 space-y-6">
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("listings.adFormatTitle")}</h2>
            <p className="text-xs text-muted-foreground">{t("listings.adFormatSubtitle")}</p>
          </div>
          <select
            className="w-full rounded-xl border border-border/60 bg-card px-3 py-3 text-sm text-foreground"
          >
            <option value="POST">{t("listings.format.POST")}</option>
            <option value="FORWARD" disabled>
              {t("listings.format.forwardComingSoon")}
            </option>
            <option value="STORY" disabled>
              {t("listings.format.storyComingSoon")}
            </option>
          </select>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("listings.pricePerPostTitle")}</h2>
            <p className="text-xs text-muted-foreground">{t("listings.pricePerPostSubtitle")}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              ref={priceInputRef}
              type="text"
              inputMode="decimal"
              value={priceTon}
              onChange={handlePriceChange}
              onFocus={handlePriceFocus}
              placeholder={t("listings.pricePlaceholder")}
              className="w-full rounded-xl border border-border/60 bg-card px-3 py-3 text-sm text-foreground sm:flex-1"
            />
            <div className="flex items-center justify-between gap-2 rounded-xl border border-border/60 bg-card/60 px-2 py-2 text-xs text-muted-foreground sm:w-auto">
              <button
                type="button"
                className="rounded-lg bg-primary/20 px-3 py-1 text-xs font-semibold text-primary"
              >
                {t("common.ton")}
              </button>
              <div className="rounded-lg border border-border/60 bg-muted/60 px-3 py-1 text-center text-[11px] font-semibold text-muted-foreground">
                {t("common.usd")}
                <div className="text-[9px] text-muted-foreground">
                  {t("common.comingSoon")}
                </div>
              </div>
            </div>
          </div>
          {showPriceError && (
            <p className="text-xs text-destructive">{t("listings.priceMinError")}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {[10, 25, 50].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPriceTon(String(value))}
                className="rounded-lg border border-border/60 bg-secondary/60 px-3 py-1 text-xs text-foreground"
              >
                +{formatNumber(value, language)} {t("common.ton")}
              </button>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {t("listings.visibilityRequirementsTitle")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("listings.visibilityRequirementsSubtitle")}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              {t("listings.pinnedDurationLabel")}
            </label>
            <select
              value={pinDurationChoice}
              onChange={(event) => setPinDurationChoice(event.target.value)}
              className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
            >
              {pinDurationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              {[6, 12, 24, 48].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setPinDurationChoice(String(hours))}
                  className={`rounded-lg border px-3 py-1 text-[11px] ${
                    pinDurationChoice === String(hours)
                      ? "border-primary/60 bg-primary/20 text-primary"
                      : "border-border/60 bg-secondary/60 text-foreground"
                  }`}
                >
                  {formatDuration(hours, t)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPinDurationChoice("none")}
                className={`rounded-lg border px-3 py-1 text-[11px] ${
                  pinDurationChoice === "none"
                    ? "border-primary/60 bg-primary/20 text-primary"
                    : "border-border/60 bg-secondary/60 text-foreground"
                }`}
              >
                {t("common.off")}
              </button>
            </div>
            {pinDurationChoice === "custom" ? (
              <input
                type="number"
                value={pinCustomHours}
                onChange={(event) => setPinCustomHours(event.target.value)}
                placeholder={t("listings.customHours")}
                className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
              />
            ) : null}
            <p className="text-xs text-muted-foreground">
              {t("listings.pinnedDurationHint")}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              {t("listings.visibilityDurationLabel")}
            </label>
            <select
              value={visibilityDurationChoice}
              onChange={(event) => setVisibilityDurationChoice(event.target.value)}
              className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
            >
              {visibilityDurationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2">
              {[24, 48, 72, 168].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setVisibilityDurationChoice(String(hours))}
                  className={`rounded-lg border px-3 py-1 text-[11px] ${
                    visibilityDurationChoice === String(hours)
                      ? "border-primary/60 bg-primary/20 text-primary"
                      : "border-border/60 bg-secondary/60 text-foreground"
                  }`}
                >
                  {formatDuration(hours, t)}
                </button>
              ))}
            </div>
            {visibilityDurationChoice === "custom" ? (
              <input
                type="number"
                value={visibilityCustomHours}
                onChange={(event) => setVisibilityCustomHours(event.target.value)}
                placeholder={t("listings.customHours")}
                className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
              />
            ) : null}
            <p className="text-xs text-muted-foreground">
              {t("listings.visibilityDurationHint")}
            </p>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-3 text-xs text-primary">
            <p className="font-semibold text-foreground">{t("listings.escrowRuleTitle")}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {t("listings.escrowRuleSubtitle")}
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("listings.conditionsTitle")}</h2>
            <p className="text-xs text-muted-foreground">
              {t("listings.conditionsSubtitle")}
            </p>
          </div>
          <div className="space-y-2">
            <label className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-3 py-3 text-sm opacity-80">
              <span className="text-foreground">
                {t("listings.preApprovalLocked")}
                <span className="ml-2 text-[10px] font-semibold text-primary">
                  {t("common.locked")}
                </span>
              </span>
              <input type="checkbox" checked disabled className="h-4 w-4" />
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("listings.tagsTitle")}</h2>
            <p className="text-xs text-muted-foreground">
              {t("listings.tagsSubtitle")}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {t("listings.tagsHint")}
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={tagQuery}
              onChange={(event) => setTagQuery(event.target.value)}
              placeholder={t("common.search")}
              className="w-full rounded-xl border border-border/60 bg-card px-3 py-3 text-sm text-foreground"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(event) => setCustomTag(event.target.value)}
                placeholder={t("listings.addCustomTag")}
                className="flex-1 rounded-xl border border-border/60 bg-card px-3 py-3 text-sm text-foreground"
              />
              <button
                type="button"
                onClick={() => {
                  const nextTag = customTag.trim();
                  if (!nextTag) {
                    return;
                  }
                  if (!selectedTags.includes(nextTag)) {
                    setSelectedTags((prev) => [...prev, nextTag]);
                  }
                  setCustomTag("");
                }}
                className="rounded-lg border border-primary/40 bg-primary/10 px-4 py-3 text-xs font-semibold text-primary"
              >
                {t("common.add")}
              </button>
            </div>
          </div>

          {selectedTags.length > 0 ? (
            <div className="flex flex-wrap gap-2 text-[11px] text-foreground">
              {selectedTags.map((tag) => {
                const isLocked = tag === "Must be pre-approved";
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (isLocked) {
                        return;
                      }
                      setSelectedTags((prev) => prev.filter((item) => item !== tag));
                    }}
                    className={`rounded-lg px-2.5 py-1 ${
                      isLocked
                        ? "bg-secondary/60 text-foreground"
                        : "bg-secondary/60 text-foreground hover:bg-secondary"
                    }`}
                  >
                    {getListingTagLabel(tag, t)}
                    {isLocked ? ` • ${t("common.locked")}` : ` ${t("common.removeTagSuffix")}`}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="space-y-4">
            {listingTagCategories.map((category) => {
              const filteredTags = category.tags.filter((tag) =>
                getListingTagLabel(tag.value, t)
                  .toLowerCase()
                  .includes(tagQuery.trim().toLowerCase()),
              );
              if (!tagQuery && filteredTags.length === 0) {
                return null;
              }
              const displayTags = tagQuery ? filteredTags : category.tags;
              if (displayTags.length === 0) {
                return null;
              }
              return (
                <div key={category.titleKey} className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">{t(category.titleKey)}</p>
                  <div className="flex flex-wrap gap-2">
                    {displayTags.map((tag) => {
                      const isLocked = tag.value === "Must be pre-approved";
                      const isSelected = selectedTags.includes(tag.value);
                      return (
                        <button
                          key={tag.value}
                          type="button"
                          onClick={() => {
                            if (isLocked) {
                              return;
                            }
                            setSelectedTags((prev) =>
                              prev.includes(tag.value)
                                ? prev.filter((item) => item !== tag.value)
                                : [...prev, tag.value],
                            );
                          }}
                          className={`rounded-lg border px-3 py-1 text-xs transition-colors ${
                            isSelected
                              ? "border-primary/60 bg-primary/20 text-primary"
                              : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
                          } ${isLocked ? "cursor-not-allowed opacity-70" : ""}`}
                        >
                          {t(tag.labelKey)}
                          {isLocked ? ` • ${t("common.locked")}` : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              {t("listings.additionalRequirementsTitle")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {t("listings.additionalRequirementsSubtitle")}
            </p>
          </div>
          <textarea
            value={contentRulesText}
            onChange={(event) => setContentRulesText(event.target.value)}
            placeholder={t("listings.additionalRequirementsPlaceholder")}
            className="min-h-[120px] w-full rounded-xl border border-border/60 bg-card px-3 py-3 text-sm text-foreground"
          />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("listings.previewTitle")}</h2>
            <p className="text-xs text-muted-foreground">{t("listings.previewSubtitle")}</p>
          </div>
          <ListingPreviewDetails
            priceTon={Number(priceTon || 0)}
            format="POST"
            pinDurationHours={pinDurationHours}
            visibilityDurationHours={visibilityDurationHours}
            allowPinnedPlacement={pinDurationHours !== null}
            tags={selectedTags}
            requiresApproval
            additionalRequirementsText={contentRulesText}
          />
        </section>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handlePublish}
            disabled={isSubmitting || !isPriceValid}
            className="w-full button-primary py-3 text-base font-semibold disabled:opacity-70"
          >
            {isSubmitting ? t("listings.publishing") : t("listings.publishAction")}
          </button>
          <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-card px-3 py-3 text-xs text-muted-foreground">
            <Info size={16} className="text-primary" />
            <span>
              {t("listings.escrowNote")}
            </span>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
