import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { ListingPreviewDetails } from "@/components/listings/ListingPreviewDetails";
import { PageContainer } from "@/components/layout/PageContainer";
import { listListingsByChannel, updateListing } from "@/api/features/listingsApi";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getListingTagLabel, listingTagCategories } from "@/features/listings/tagOptions";
import { getErrorMessage } from "@/lib/api/errors";
import { nanoToTonString } from "@/lib/ton";
import type { ListingEntity } from "@/models/entities";
import { CurrencyCode, ListingFormat } from "@/models/enums";
import { useLanguage } from "@/i18n/LanguageProvider";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";
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

export default function EditListing() {
  const { id, listingId } = useParams<{ id: string; listingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const outletContext = useOutletContext<ChannelManageContext | null>();
  const channel = outletContext?.channel ?? null;
  const { t } = useLanguage();
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
  const rootBackTo = (location.state as { rootBackTo?: string } | null)?.rootBackTo;

  const listingsQuery = useQuery({
    queryKey: [
      "listingsByChannel",
      id,
      { page: 1, limit: 50, onlyActive: false, sort: "recent" },
    ],
    queryFn: () =>
      listListingsByChannel({
        channelId: id ?? "",
        page: 1,
        limit: 50,
        activeOnly: false,
      }),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (listingsQuery.error) {
      toast.error(getErrorMessage(listingsQuery.error, t("listings.loadError"), t));
    }
  }, [listingsQuery.error, t]);

  const listing = useMemo<ListingEntity | undefined>(
    () => listingsQuery.data?.items.find((item) => item.id === listingId),
    [listingsQuery.data?.items, listingId],
  );
  const queryClient = useQueryClient();

  const [priceTon, setPriceTon] = useState("25");
  const [pinDurationChoice, setPinDurationChoice] = useState("none");
  const [pinCustomHours, setPinCustomHours] = useState("");
  const [visibilityDurationChoice, setVisibilityDurationChoice] = useState("24");
  const [visibilityCustomHours, setVisibilityCustomHours] = useState("");
  const [allowEdits, setAllowEdits] = useState(true);
  const [allowLinkTracking, setAllowLinkTracking] = useState(true);
  const [contentRulesText, setContentRulesText] = useState("");
  const [tagQuery, setTagQuery] = useState("");
  const [customTag, setCustomTag] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Must be pre-approved"]);
  const [showVisibilityWarning, setShowVisibilityWarning] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    if (!listing || hasInitialized) {
      return;
    }
    const initialPinDuration = listing.pinDurationHours ?? null;
    const initialPinChoice = initialPinDuration
      ? [6, 12, 24, 48].includes(initialPinDuration)
        ? String(initialPinDuration)
        : "custom"
      : "none";
    const initialPinCustom =
      initialPinDuration && ![6, 12, 24, 48].includes(initialPinDuration)
        ? String(initialPinDuration)
        : "";
    const initialVisibilityDuration = listing.visibilityDurationHours ?? 24;
    const initialVisibilityChoice = [24, 48, 72, 168].includes(initialVisibilityDuration)
      ? String(initialVisibilityDuration)
      : "custom";
    const initialVisibilityCustom = [24, 48, 72, 168].includes(initialVisibilityDuration)
      ? ""
      : String(initialVisibilityDuration);
    const listingPrice = Number.parseFloat(nanoToTonString(listing.priceNano));

    setPriceTon(Number.isFinite(listingPrice) ? String(listingPrice) : "25");
    setPinDurationChoice(initialPinChoice);
    setPinCustomHours(initialPinCustom);
    setVisibilityDurationChoice(initialVisibilityChoice);
    setVisibilityCustomHours(initialVisibilityCustom);
    setAllowEdits(listing.allowEdits);
    setAllowLinkTracking(listing.allowLinkTracking);
    setContentRulesText(listing.contentRulesText ?? "");
    const initialTags = listing.tags?.length ? listing.tags : ["Must be pre-approved"];
    setSelectedTags(
      initialTags.includes("Must be pre-approved")
        ? initialTags
        : [...initialTags, "Must be pre-approved"],
    );
    setHasInitialized(true);
  }, [hasInitialized, listing]);

  const pinDurationHours =
    pinDurationChoice === "none" ? null : resolveHours(pinDurationChoice, pinCustomHours, 24);
  const visibilityDurationHours = resolveHours(
    visibilityDurationChoice,
    visibilityCustomHours,
    24,
  );

  if (!channel || listingsQuery.isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <PageContainer className="py-6">
          <p className="text-muted-foreground">{t("listings.loading")}</p>
        </PageContainer>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <PageContainer className="py-6">
          <p className="text-muted-foreground">{t("listings.notFound")}</p>
        </PageContainer>
      </div>
    );
  }

  const applySave = async () => {
    const ensuredTags = selectedTags.includes("Must be pre-approved")
      ? selectedTags
      : [...selectedTags, "Must be pre-approved"];

    await updateListing({
      id: listing.id,
      patch: {
        format: ListingFormat.Post,
        priceNano: parseTonInputToNano(priceTon),
        currency: CurrencyCode.Ton,
        pinDurationHours,
        visibilityDurationHours,
        allowEdits,
        allowLinkTracking,
        contentRulesText,
        tags: ensuredTags,
        allowPinnedPlacement: pinDurationHours !== null,
        requiresApproval: listing.requiresApproval,
        isActive: listing.isActive,
      },
    });

    queryClient.invalidateQueries({ queryKey: ["channelListingsPreview", channel.id] });
    queryClient.invalidateQueries({ queryKey: ["channelsList"] });
    navigate(ROUTES.CHANNEL_MANAGE_LISTINGS(channel.id), {
      state: rootBackTo ? { rootBackTo } : undefined,
    });
  };

  const handleSave = () => {
    const hasActiveDeals = false;
    const pinChanged = (listing.pinDurationHours ?? null) !== pinDurationHours;
    const visibilityChanged =
      (listing.visibilityDurationHours ?? 24) !== visibilityDurationHours;

    if (hasActiveDeals && (pinChanged || visibilityChanged)) {
      setShowVisibilityWarning(true);
      return;
    }

    void applySave();
  };

  const handleDisable = async () => {
    await updateListing({ id: listing.id, patch: { isActive: false } });
    queryClient.invalidateQueries({ queryKey: ["channelListingsPreview", channel.id] });
    queryClient.invalidateQueries({ queryKey: ["channelsList"] });
    navigate(ROUTES.CHANNEL_MANAGE_LISTINGS(channel.id), {
      state: rootBackTo ? { rootBackTo } : undefined,
    });
  };

  const handleEnable = async () => {
    await updateListing({ id: listing.id, patch: { isActive: true } });
    queryClient.invalidateQueries({ queryKey: ["channelListingsPreview", channel.id] });
    queryClient.invalidateQueries({ queryKey: ["channelsList"] });
    navigate(ROUTES.CHANNEL_MANAGE_LISTINGS(channel.id), {
      state: rootBackTo ? { rootBackTo } : undefined,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="py-6 space-y-6">
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("listings.adFormatTitle")}</h2>
            <p className="text-xs text-muted-foreground">{t("listings.adFormatSubtitle")}</p>
          </div>
          <select
            disabled
            className="w-full rounded-xl border border-border/40 bg-card/60 px-3 py-3 text-sm text-muted-foreground"
          >
            <option value="POST">{t("listings.format.POST")}</option>
          </select>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("listings.pricePerPostTitle")}</h2>
            <p className="text-xs text-muted-foreground">{t("listings.pricePerPostSubtitle")}</p>
          </div>
          <input
            type="number"
            value={priceTon}
            onChange={(event) => setPriceTon(event.target.value)}
            placeholder={t("listings.pricePlaceholder")}
            className="w-full rounded-xl border border-border/60 bg-card px-3 py-3 text-sm text-foreground"
          />
        </section>

        <section className="space-y-3">
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
                  {t("listings.visibilityDuration.optionHours", { hours })}
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
                {t("listings.pinDuration.none")}
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
                  {hours === 168
                    ? t("listings.visibilityDuration.optionDays", { days: 7 })
                    : t("listings.visibilityDuration.optionHours", { hours })}
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
            <h2 className="text-sm font-semibold text-foreground">
              {t("listings.conditionsTitle")}
            </h2>
            <p className="text-xs text-muted-foreground">{t("listings.conditionsSubtitle")}</p>
          </div>
          <div className="space-y-2">
            <label className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-3 py-3 text-sm opacity-80">
              <span className="text-foreground">
                {t("listings.preApprovalRequired")}
                <span className="ml-2 text-[10px] font-semibold text-primary">
                  {t("listings.preApprovalLocked")}
                </span>
              </span>
              <input type="checkbox" checked disabled className="h-4 w-4" />
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">{t("listings.tagsTitle")}</h2>
            <p className="text-xs text-muted-foreground">{t("listings.tagsSubtitle")}</p>
            <p className="text-[11px] text-muted-foreground">{t("listings.tagsHint")}</p>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={tagQuery}
              onChange={(event) => setTagQuery(event.target.value)}
              placeholder={t("listings.tagsSearchPlaceholder")}
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
                const label = getListingTagLabel(tag, t);
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
                    {label}
                    {isLocked ? ` • ${t("listings.lockedLabel")}` : ` ${t("common.removeSymbol")}`}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="space-y-4">
            {listingTagCategories.map((category) => {
              const query = tagQuery.trim().toLowerCase();
              const filteredTags = category.tags.filter((tag) => {
                if (!query) {
                  return true;
                }
                const label = t(tag.labelKey).toLowerCase();
                return label.includes(query) || tag.value.toLowerCase().includes(query);
              });
              const displayTags = query ? filteredTags : category.tags;
              if (displayTags.length === 0) {
                return null;
              }
              return (
                <div key={category.titleKey} className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    {t(category.titleKey)}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {displayTags.map((tag) => {
                      const isLocked = tag.value === "Must be pre-approved";
                      const isSelected = selectedTags.includes(tag.value);
                      const label = t(tag.labelKey);
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
                          {label}
                          {isLocked ? ` • ${t("listings.lockedLabel")}` : ""}
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
            <p className="text-xs text-muted-foreground">{t("listings.additionalRequirementsSubtitle")}</p>
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
            allowEdits={allowEdits}
            allowLinkTracking={allowLinkTracking}
            allowPinnedPlacement={pinDurationHours !== null}
            tags={selectedTags}
            requiresApproval
            additionalRequirementsText={contentRulesText}
          />
        </section>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleSave}
            className="w-full button-primary py-3 text-base font-semibold"
          >
            {t("listings.saveChanges")}
          </button>
          <AlertDialog open={showVisibilityWarning} onOpenChange={setShowVisibilityWarning}>
            <AlertDialogContent className="max-w-sm rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>{t("listings.visibilityWarningTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("listings.visibilityWarningDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                <AlertDialogAction onClick={applySave}>{t("common.continue")}</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
