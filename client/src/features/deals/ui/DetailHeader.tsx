import { DealStatusTone } from "./DealStatusPill";
import ChannelAvatar from "@/components/ChannelAvatar";

interface DetailHeaderProps {
  status: string;
  tone: DealStatusTone;
  title: string;
  username: string;
  price: string;
  dealId: string;
  avatarUrl?: string;
  statusDescription: string;
}

export default function DetailHeader({
  status,
  tone,
  title,
  username,
  price,
  dealId,
  avatarUrl,
  statusDescription,
}: DetailHeaderProps) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/80 p-6">
      <div className="flex items-center gap-3">
        <ChannelAvatar
          title={title}
          username={username}
          avatarUrl={avatarUrl}
          className="h-12 w-12 text-xl"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <span>{title}</span>
          </div>
          <p className="text-xs text-muted-foreground">@{username}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p className="font-semibold price-text">{price}</p>
        </div>
      </div>
    </div>
  );
}
