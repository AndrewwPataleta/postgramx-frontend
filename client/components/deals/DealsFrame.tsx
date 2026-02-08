import DealCard, { type DealCardData } from "./DealCard";
import { useLanguage } from "@/i18n/LanguageProvider";
import { AnimatedList, AnimatedListItem } from "@/motion/AnimatedList";

interface DealsFrameProps {
  title: string;
  deals: DealCardData[];
  quickFilters: string[];
}

export default function DealsFrame({ title, deals, quickFilters }: DealsFrameProps) {
  const { t } = useLanguage();
  return (
    <div className="rounded-[32px] border border-border/50 bg-card/80 p-6 shadow-[var(--shadow-md)]">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-foreground">{t("deals.title")}</p>
        <p className="text-xs text-muted-foreground">{t("deals.subtitle")}</p>
      </div>

      <div className="mt-5 flex items-center gap-2 rounded-full bg-secondary/60 p-1 text-xs text-muted-foreground">
        {[t("deals.tabs.active"), t("deals.tabs.pending"), t("deals.tabs.completed")].map(
          (tab) => (
          <span
            key={tab}
            className={`flex-1 rounded-full px-3 py-1 text-center text-xs font-semibold ${
              tab === title ? "bg-background text-foreground" : "text-muted-foreground"
            }`}
          >
            {tab}
          </span>
          )
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 rounded-2xl border border-border/60 bg-background/60 px-4 py-2 text-xs text-muted-foreground">
          {t("deals.searchPlaceholder")}
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/60 bg-background/60 text-muted-foreground">
          {t("common.filterIcon")}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickFilters.map((filter) => (
          <span
            key={filter}
            className="rounded-full border border-border/60 bg-secondary/50 px-3 py-1 text-[11px] text-muted-foreground"
          >
            {filter}
          </span>
        ))}
      </div>

      <AnimatedList itemsCount={deals.length} className="mt-5 space-y-4">
        {deals.map((deal, index) => (
          <AnimatedListItem key={deal.id} index={index} pulseKey={deal.statusLabel}>
            <DealCard {...deal} />
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </div>
  );
}
