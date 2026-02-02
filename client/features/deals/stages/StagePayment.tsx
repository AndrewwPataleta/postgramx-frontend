import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { TonConnectButton, useTonConnectUI } from "@tonconnect/ui-react";

import InfoCard from "@/components/deals/InfoCard";
import type { DealEntity } from "@/models/entities";
import { EscrowStatus } from "@/models/enums";
import { cn } from "@/lib/utils";
import { formatTon } from "@/i18n/formatters";
import { useLanguage } from "@/i18n/LanguageProvider";
import { useWalletContext } from "@/contexts/WalletContext";

interface StagePaymentProps {
  deal: DealEntity;
  readonly: boolean;
  onAction?: {
    onRefresh?: () => void;
  };
  isRefreshing?: boolean;
}

const formatCountdown = (valueMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(valueMs / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const formatShortAddress = (address: string) => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 3)}...${address.slice(-3)}`;
};

const toNanoString = (value: string | bigint) =>
  typeof value === "bigint" ? value.toString() : value;

function uint8ToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

async function buildCommentPayloadBase64(comment: string): Promise<string> {
  // Buffer polyfill (browser)
  const w = window as any;
  if (!w.Buffer) {
    const mod = await import("buffer");
    w.Buffer = mod.Buffer;
  }

  // lazy import so app doesn't crash on load
  const ton = await import("@ton/core");

  const cell = ton
    .beginCell()
    .storeUint(0, 32) // text comment opcode
    .storeStringTail(comment)
    .endCell();

  const boc: Uint8Array = cell.toBoc({ idx: false });
  return uint8ToBase64(boc);
}

export default function StagePayment({
                                       deal,
                                       readonly,
                                       onAction,
                                       isRefreshing,
                                     }: StagePaymentProps) {
  const { t, language } = useLanguage();
  const [tonConnectUI] = useTonConnectUI();
  const { isConnected, walletAppName, network } = useWalletContext();

  const [isWaiting, setIsWaiting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  const paymentDeadlineAt = deal.escrow.paymentDeadlineAt;

  const escrowAmountNano = deal.escrow.amountNano ?? deal.listingSnapshot.priceNano;
  const paymentAddress = deal.escrow.paymentAddress ?? "";

  const displayAmount = escrowAmountNano
    ? `${formatTon(escrowAmountNano, language)} ${t("common.ton")}`
    : t("common.emptyValue");

  const walletStatusLabel = useMemo(() => {
    if (!isConnected) return t("deals.stage.payment.walletDisconnected");
    const networkLabel = network ? ` • ${network}` : "";
    return `${t("deals.stage.payment.walletConnected")}${
      walletAppName ? ` • ${walletAppName}` : ""
    }${networkLabel}`;
  }, [isConnected, network, t, walletAppName]);

  useEffect(() => {
    if (!paymentDeadlineAt) {
      setTimeRemaining(null);
      return;
    }

    const expiresAt = new Date(paymentDeadlineAt).getTime();
    if (Number.isNaN(expiresAt)) {
      setTimeRemaining(null);
      return;
    }

    const updateRemaining = () => {
      const diff = Math.max(0, expiresAt - Date.now());
      setTimeRemaining(formatCountdown(diff));
    };

    updateRemaining();
    const interval = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(interval);
  }, [paymentDeadlineAt]);

  useEffect(() => {
    setIsWaiting(false);
  }, [deal.id, deal.escrow.status]);

  const handlePay = async () => {
    if (readonly || !paymentAddress || !escrowAmountNano) return;

    try {
      // if not connected — open official modal (same as TonConnectButton)
      if (!tonConnectUI.connected) {
        tonConnectUI.openModal();
        return;
      }

      setIsWaiting(true);

      const validUntil = Math.floor(Date.now() / 1000) + 5 * 60;
      const memo = `Deal:${deal.id}`;

      const payload = await buildCommentPayloadBase64(memo);

      await tonConnectUI.sendTransaction({
        validUntil,
        messages: [
          {
            address: paymentAddress,
            amount: toNanoString(escrowAmountNano),
            payload,
          },
        ],
      });

      toast.success(t("deals.stage.payment.paymentSent"));
    } catch (error: any) {
      const message =
        typeof error?.message === "string"
          ? error.message
          : t("deals.stage.payment.paymentCanceled");
      toast.error(message);
      setIsWaiting(false);
    }
  };

  const handleCopyAddress = async () => {
    if (!paymentAddress) return;
    try {
      await navigator.clipboard.writeText(paymentAddress);
      toast.success(t("deals.stage.payment.addressCopied"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("deals.stage.payment.copyFailed")
      );
    }
  };

  return (
    <InfoCard title={t("deals.stage.payment.title")}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            isConnected ? "bg-emerald-400" : "bg-muted-foreground/50"
          )}
        />
        <span className="text-xs text-muted-foreground">{walletStatusLabel}</span>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-border/60 bg-background/40 p-3">
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">
                {t("deals.stage.payment.amountToPay")}
              </span>
              : {displayAmount}
            </p>

            <p>
              <span className="font-semibold text-foreground">
                {t("deals.stage.payment.receiver")}
              </span>
              :{" "}
              {paymentAddress
                ? formatShortAddress(paymentAddress)
                : t("common.emptyValue")}
            </p>

            {timeRemaining ? (
              <p>
                <span className="font-semibold text-foreground">
                  {t("deals.stage.payment.expiresIn", { time: timeRemaining })}
                </span>
              </p>
            ) : null}
          </div>
        </div>

        {isWaiting ? (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-secondary/30 px-3 py-2">
            <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border/60">
              <span className="h-2 w-2 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            </span>
            <span className="text-xs text-muted-foreground">
              {t("deals.stage.payment.waiting")}
            </span>
          </div>
        ) : null}

        {/* ✅ Official SDK button + Pay logic */}
        <div className="flex flex-wrap items-center gap-2">
          <TonConnectButton className="!w-auto" />

          <button
            type="button"
            onClick={handlePay}
            disabled={readonly || isWaiting || !paymentAddress || !escrowAmountNano}
            className={cn(
              "rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition",
              readonly || isWaiting
                ? "cursor-not-allowed opacity-60"
                : "hover:bg-primary/90"
            )}
          >
            {t("deals.stage.payment.payWithWallet")}
          </button>

          <button
            type="button"
            onClick={handleCopyAddress}
            disabled={readonly}
            className={cn(
              "rounded-lg border border-border/60 px-4 py-2 text-xs font-semibold text-foreground transition",
              readonly ? "cursor-not-allowed opacity-60" : "hover:border-primary/40"
            )}
          >
            {t("deals.stage.payment.copyAddress")}
          </button>
        </div>

        {isWaiting ? (
          <button
            type="button"
            onClick={onAction?.onRefresh}
            disabled={isRefreshing || !onAction?.onRefresh}
            className={cn(
              "rounded-lg border border-border/60 px-4 py-2 text-xs font-semibold text-foreground",
              isRefreshing || !onAction?.onRefresh
                ? "cursor-not-allowed opacity-60"
                : "hover:border-primary/40"
            )}
          >
            {isRefreshing ? t("common.refreshing") : t("deals.stage.payment.checkStatus")}
          </button>
        ) : null}
      </div>
    </InfoCard>
  );
}
