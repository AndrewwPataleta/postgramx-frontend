import { useEffect, useMemo, useState } from "react";
import { Info } from "lucide-react";
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router-dom";
import { useListingsByChannel } from "@/features/listings/hooks/useListingsByChannel";
import { toast } from "sonner";
import { ListingPreviewDetails } from "@/components/listings/ListingPreviewDetails";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  useDisableListing,
  useEnableListing,
  useUpdateListing,
} from "@/features/listings/hooks/useListingMutations";
import { mapChannelListItemToManagedChannel } from "@/features/channels/managedChannels";
import { useChannelDetail } from "@/features/channels/hooks/useChannelDetail";
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
import { listingTagCategories } from "@/features/listings/tagOptions";
import { getErrorMessage } from "@/lib/api/errors";
import { nanoToTonString } from "@/lib/ton";
import { toIsoZ } from "@/api/core/date";
import type { ListingListItem } from "@/types/listings";
import type { ChannelManageContext } from "@/pages/channel-manage/ChannelManageLayout";
import { useLanguage } from "@/i18n/LanguageProvider";
import { ROUTES } from "@/constants/routes";

const pinDurationOptions = [
  { label: "Not pinned", value: "none" },
  { label: "6 hours", value: "6" },
  { label: "12 hours", value: "12" },
  { label: "24 hours", value: "24" },
  { label: "48 hours", value: "48" },
  { label: "Custom", value: "custom" },
];

const visibilityDurationOptions = [
  { label: "24 hours", value: "24" },
  { label: "48 hours", value: "48" },
  { label: "72 hours", value: "72" },
  { label: "7 days", value: "168" },
  { label: "Custom", value: "custom" },
];

const resolveHours = (choice: string, customValue: string, fallback: number) => {
  if (choice === "custom") {
    const parsed = Number(customValue);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }
  const parsed = Number(choice);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export default function EditListing() {
  const { id, listingId } = useParams<{ id: string; listingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const outletContext = useOutletContext<ChannelManageContext | null>();
  const channelQuery = useChannelDetail(id);
  const fallbackChannel = channelQuery.data
    ? mapChannelListItemToManagedChannel(channelQuery.data, t("channels.untitled"))
    : null;
  const channel = outletContext?.channel ?? fallbackChannel;
  const rootBackTo = (location.state as { rootBackTo?: string } | null)?.rootBackTo;

  const listingsFilters = useMemo(
    () => ({
      channelId: id ?? "",
      page: 1,
      limit: 50,
      onlyActive: false,
      sort: "recent" as const,
    }),
    [id]
  );
  const listingsQuery = useListingsByChannel(listingsFilters, { enabled: Boolean(id) });

  useEffect(() => {
    if (listingsQuery.error) {
      toast.error(getErrorMessage(listingsQuery.error, "Unable to load listing"));
    }
  }, [listingsQuery.error]);

  const listing = useMemo<ListingListItem | undefined>(
    () => listingsQuery.data?.items.find((item) => item.id === listingId),
    [listingsQuery.data?.items, listingId],
  );
  const updateListingMutation = useUpdateListing();
  const disableListingMutation = useDisableListing();
  const enableListingMutation = useEnableListing();

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
          <p className="text-muted-foreground">Loading listing...</p>
        </PageContainer>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="w-full max-w-2xl mx-auto">
        <PageContainer className="py-6">
          <p className="text-muted-foreground">Listing not found</p>
        </PageContainer>
      </div>
    );
  }

  const applySave = () => {
    const ensuredTags = selectedTags.includes("Must be pre-approved")
      ? selectedTags
      : [...selectedTags, "Must be pre-approved"];

    updateListingMutation.mutate({
      listingId: listing.id,
      channelId: channel.id,
      format: "POST",
      priceTon: Number(priceTon || 0),
      availabilityFrom: toIsoZ(new Date(listing.availabilityFrom ?? new Date())),
      availabilityTo: toIsoZ(new Date(listing.availabilityTo ?? new Date())),
      pinDurationHours,
      visibilityDurationHours,
      allowEdits,
      allowLinkTracking,
      contentRulesText,
      tags: ensuredTags,
      requiresApproval: listing.requiresApproval ?? true,
      isActive: listing.isActive ?? true,
      allowPinnedPlacement: pinDurationHours !== null,
    });

    navigate(ROUTES.CHANNEL_MANAGE_LISTINGS(channel.id), {
      state: rootBackTo ? { rootBackTo } : undefined,
    });
  };

  const handleSave = () => {
    const hasActiveDeals = channel.activeDeals > 0;
    const pinChanged = (listing.pinDurationHours ?? null) !== pinDurationHours;
    const visibilityChanged =
      (listing.visibilityDurationHours ?? 24) !== visibilityDurationHours;

    if (hasActiveDeals && (pinChanged || visibilityChanged)) {
      setShowVisibilityWarning(true);
      return;
    }

    applySave();
  };

  const handleDisable = () => {
    disableListingMutation.mutate(listing.id);
    navigate(ROUTES.CHANNEL_MANAGE_LISTINGS(channel.id), {
      state: rootBackTo ? { rootBackTo } : undefined,
    });
  };

  const handleEnable = () => {
    enableListingMutation.mutate(listing.id);
    navigate(ROUTES.CHANNEL_MANAGE_LISTINGS(channel.id), {
      state: rootBackTo ? { rootBackTo } : undefined,
    });
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <PageContainer className="py-6 space-y-6">
        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Ad format</h2>
            <p className="text-xs text-muted-foreground">Post format only in MVP.</p>
          </div>
          <select
            disabled
            className="w-full rounded-xl border border-border/40 bg-card/60 px-3 py-3 text-sm text-muted-foreground"
          >
            <option value="POST">Post</option>
          </select>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Price per post</h2>
            <p className="text-xs text-muted-foreground">Price shown publicly in Marketplace.</p>
          </div>
          <input
            type="number"
            value={priceTon}
            onChange={(event) => setPriceTon(event.target.value)}
            placeholder="Example: 25 TON"
            className="w-full rounded-xl border border-border/60 bg-card px-3 py-3 text-sm text-foreground"
          />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Post visibility requirements</h2>
            <p className="text-xs text-muted-foreground">
              Define how long the ad post must remain published to receive payment.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Pinned post duration</label>
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
                  {hours}h
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
                Off
              </button>
            </div>
            {pinDurationChoice === "custom" ? (
              <input
                type="number"
                value={pinCustomHours}
                onChange={(event) => setPinCustomHours(event.target.value)}
                placeholder="Custom hours"
                className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
              />
            ) : null}
            <p className="text-xs text-muted-foreground">
              If enabled, the ad will stay pinned at the top of your channel.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              Post visibility duration
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
                  {hours === 168 ? "7d" : `${hours}h`}
                </button>
              ))}
            </div>
            {visibilityDurationChoice === "custom" ? (
              <input
                type="number"
                value={visibilityCustomHours}
                onChange={(event) => setVisibilityCustomHours(event.target.value)}
                placeholder="Custom hours"
                className="w-full rounded-xl border border-border/60 bg-card px-3 py-2 text-sm text-foreground"
              />
            ) : null}
            <p className="text-xs text-muted-foreground">
              The post must stay visible in the channel feed without deletion or major edits.
            </p>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/10 px-3 py-3 text-xs text-primary">
            <p className="font-semibold text-foreground">Escrow verification rule</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Funds will be released only after the post remains published and pinned (if
              enabled) for the selected duration.
            </p>
          </div>
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Posting conditions</h2>
            <p className="text-xs text-muted-foreground">Control what advertisers can change.</p>
          </div>
          <div className="space-y-2">
            <label className="flex items-center justify-between rounded-xl border border-border/40 bg-card/60 px-3 py-3 text-sm opacity-80">
              <span className="text-foreground">
                Require pre-approval before publishing
                <span className="ml-2 text-[10px] font-semibold text-primary">Locked</span>
              </span>
              <input type="checkbox" checked disabled className="h-4 w-4" />
            </label>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Content Tags</h2>
            <p className="text-xs text-muted-foreground">
              Help advertisers understand what content is allowed in your channel.
            </p>
            <p className="text-[11px] text-muted-foreground">
              Tags are used for discovery and matching.
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={tagQuery}
              onChange={(event) => setTagQuery(event.target.value)}
              placeholder="Search tags"
              className="w-full rounded-xl border border-border/60 bg-card px-3 py-3 text-sm text-foreground"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(event) => setCustomTag(event.target.value)}
                placeholder="Add custom tag"
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
                Add
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
                    {tag}
                    {isLocked ? " • Locked" : " ×"}
                  </button>
                );
              })}
            </div>
          ) : null}

          <div className="space-y-4">
            {listingTagCategories.map((category) => {
              const filteredTags = category.tags.filter((tag) =>
                tag.toLowerCase().includes(tagQuery.trim().toLowerCase()),
              );
              const displayTags = tagQuery ? filteredTags : category.tags;
              if (displayTags.length === 0) {
                return null;
              }
              return (
                <div key={category.title} className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">{category.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {displayTags.map((tag) => {
                      const isLocked = tag === "Must be pre-approved";
                      const isSelected = selectedTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            if (isLocked) {
                              return;
                            }
                            setSelectedTags((prev) =>
                              prev.includes(tag)
                                ? prev.filter((item) => item !== tag)
                                : [...prev, tag],
                            );
                          }}
                          className={`rounded-lg border px-3 py-1 text-xs transition-colors ${
                            isSelected
                              ? "border-primary/60 bg-primary/20 text-primary"
                              : "border-border/60 bg-card text-muted-foreground hover:text-foreground"
                          } ${isLocked ? "cursor-not-allowed opacity-70" : ""}`}
                        >
                          {tag}
                          {isLocked ? " • Locked" : ""}
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
              Additional requirements (optional)
            </h2>
            <p className="text-xs text-muted-foreground">Add any restrictions or notes.</p>
          </div>
          <textarea
            value={contentRulesText}
            onChange={(event) => setContentRulesText(event.target.value)}
            placeholder="Example: No gambling links, English language only, max 2 emojis."
            className="min-h-[120px] w-full rounded-xl border border-border/60 bg-card px-3 py-3 text-sm text-foreground"
          />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Listing preview</h2>
            <p className="text-xs text-muted-foreground">Review how your offer appears.</p>
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
            Save changes
          </button>
          <AlertDialog open={showVisibilityWarning} onOpenChange={setShowVisibilityWarning}>
            <AlertDialogContent className="max-w-sm rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Update visibility rules?</AlertDialogTitle>
                <AlertDialogDescription>
                  Changing visibility rules will only apply to new deals.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={applySave}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <div className="flex items-start gap-2 rounded-xl border border-border/60 bg-card px-3 py-3 text-xs text-muted-foreground">
            <Info size={16} className="text-primary" />
            <span>
              Funds are locked in escrow before posting. Payment is released only after
              delivery verification.
            </span>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
