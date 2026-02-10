import { useEffect, useRef } from "react";
import { TonConnectButton, useTonWallet } from "@tonconnect/ui-react";
import { useLanguage } from "@/i18n/LanguageProvider";

const WalletConnectBanner = () => {
  const wallet = useTonWallet();
  const { t } = useLanguage();
  const bannerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    if (wallet) {
      root.style.setProperty("--wallet-banner-height", "0px");
      return;
    }

    const banner = bannerRef.current;
    if (!banner) {
      root.style.setProperty("--wallet-banner-height", "0px");
      return;
    }

    const updateHeight = () => {
      root.style.setProperty("--wallet-banner-height", `${banner.offsetHeight}px`);
    };

    updateHeight();

    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(banner);

    return () => {
      observer.disconnect();
      root.style.setProperty("--wallet-banner-height", "0px");
    };
  }, [wallet]);

  if (wallet) {
    return null;
  }

  return (
    <div
      ref={bannerRef}
      className="sticky top-0 z-40 bg-background/80 px-4 pt-4 backdrop-blur-glass"
    >
      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card/80 px-4 py-3 shadow-sm backdrop-blur-glass">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {t("profile.wallet.connectTitle")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("profile.wallet.connectDescription")}
          </p>
        </div>
        <TonConnectButton className="shrink-0" />
      </div>
    </div>
  );
};

export default WalletConnectBanner;
