import { useLanguage } from "@/i18n/LanguageProvider";

export interface TimelineItem {
  label: string;
  state: "completed" | "current" | "upcoming";
}

interface TimelineProps {
  items: TimelineItem[];
}

export default function Timeline({ items }: TimelineProps) {
  const { t } = useLanguage();
  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{t("deals.timeline.title")}</p>
        <span className="text-xs text-muted-foreground">
          {t("deals.timeline.steps", { count: items.length })}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
        {items.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-xs ${
              item.state === "completed"
                ? "border-success/40 bg-success/10 text-success"
                : item.state === "current"
                ? "border-success/40 bg-success/10 text-success"
                : "border-border/60 bg-background/40 text-muted-foreground"
            }`}
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                item.state === "completed"
                  ? "bg-success/80 text-success-foreground"
                  : item.state === "current"
                  ? "bg-success/10 text-success"
                  : "border border-border/70 text-muted-foreground"
              }`}
            >
              {item.state === "completed"
                ? t("common.checkSymbol")
                : item.state === "current"
                ? t("common.dotSymbol")
                : ""}
            </div>
            <p className="text-xs font-medium">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
