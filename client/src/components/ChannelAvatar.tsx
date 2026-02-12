import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";

const getFallbackLetter = (title?: string | null, fallback = "C") =>
  title?.trim()?.charAt(0)?.toUpperCase() || fallback;

const resolveAvatarUrl = (
  avatarUrl?: string | null,
  username?: string | null,
) => {
  if (!avatarUrl) {
    return null;
  }

  if (avatarUrl.includes("api.telegram.org/file/bot")) {
    const cleanUsername = username?.replace(/^@/, "");
    return cleanUsername
      ? `https://t.me/i/userpic/320/${cleanUsername}.jpg`
      : null;
  }

  return avatarUrl;
};

interface ChannelAvatarProps {
  title?: string | null;
  username?: string | null;
  avatarUrl?: string | null;
  fallback?: string;
  className?: string;
  fallbackClassName?: string;
}

export default function ChannelAvatar({
  title,
  username,
  avatarUrl,
  fallback,
  className,
  fallbackClassName,
}: ChannelAvatarProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedAvatarUrl = useMemo(
    () => resolveAvatarUrl(avatarUrl, username),
    [avatarUrl, username],
  );
  const canShowImage = Boolean(resolvedAvatarUrl) && !hasError;

  if (canShowImage) {
    return (
      <img
        src={resolvedAvatarUrl ?? undefined}
        alt={title ?? username ?? "Channel"}
        className={cn("h-12 w-12 rounded-full object-cover", className)}
        onError={() => setHasError(true)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 via-secondary/50 to-secondary text-lg text-foreground",
        className,
        fallbackClassName,
      )}
    >
      {getFallbackLetter(title, fallback)}
    </div>
  );
}
