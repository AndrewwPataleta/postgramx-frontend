export function openTelegramLink(url: string) {
  const tg = (window as typeof window & { Telegram?: { WebApp?: { openTelegramLink?: (link: string) => void } } })
    .Telegram?.WebApp;
  if (tg?.openTelegramLink) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

export function openTonDeepLink(url: string) {
  const tg = (window as any).Telegram?.WebApp;

  if (tg?.openLink) {
    tg.openLink(url);
    return;
  }

  // fallback
  window.location.href = url;
}
