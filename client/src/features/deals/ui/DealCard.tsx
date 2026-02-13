import DealStatusPill, { DealStatusTone } from "./DealStatusPill";
import ChannelAvatar from "@/components/ChannelAvatar";
import { useLanguage } from "@/i18n/LanguageProvider";

interface DealCardProps {
  name: string;
  username: string;
  avatarUrl: string;
  price: string;
  statusLabel: string;
  statusTone: DealStatusTone;
  updatedLabel: string;
  ctaLabel: string;
  onSelect?: () => void;
  onAction?: () => void;
}

export default function DealCard({
  name,
  username,
  avatarUrl,
  price,
  statusLabel,
  statusTone,
  updatedLabel,
  ctaLabel,
  onSelect,
  onAction,
}: DealCardProps) {
  const { t } = useLanguage();
  return (
    <div
      className={`glass p-4 transition-colors ${
        onSelect ? "cursor-pointer hover:bg-card/60" : ""
      }`}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (!onSelect) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ChannelAvatar
            title={name}
            username={username}
            avatarUrl={avatarUrl}
            className="h-11 w-11 text-xl"
          />
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span>{name}</span>
            </div>
            <p className="text-xs text-muted-foreground">@{username}</p>
          </div>
        </div>
        <DealStatusPill label={statusLabel} tone={statusTone} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-muted-foreground">{t("common.price")}</p>
          <p className="text-sm font-semibold price-text">{price}</p>
        </div>
        <p className="text-xs text-muted-foreground">{updatedLabel}</p>
      </div>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onAction?.();
        }}
        className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
      >
        {ctaLabel}
      </button>
    </div>
  );
}
