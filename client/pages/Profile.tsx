import { RefreshCcw, ShieldCheck } from "lucide-react";
import { useTelegram } from "@/hooks/use-telegram";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buildTonConnectTransaction, buildTonTransferLink } from "@/features/deals/payment";
import { useEffect, useMemo, useState } from "react";
import {
  TonConnectButton,
  useTonConnectModal,
  useTonConnectUI,
  useTonWallet,
} from "@tonconnect/ui-react";
import { toast } from "sonner";
import { useProfile } from "@/features/profile/hooks";
import ErrorState from "@/components/feedback/ErrorState";
import LoadingSkeleton from "@/components/feedback/LoadingSkeleton";
import { getErrorMessage } from "@/lib/api/errors";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/PageContainer";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { withdrawFromChannel } from "@/api/features/payments/payments.api";
import type { ChannelPayoutItem } from "@/api/features/payments/payments.types";
import { useTransactions } from "@/features/payments/hooks/useTransactions";
import { useWithdrawableByChannel } from "@/features/payments/hooks/useWithdrawableByChannel";
import { formatDateTime, formatTon } from "@/i18n/formatters";
import { formatTonString, nanoToTonString } from "@/lib/ton";
import { TRANSACTION_DIRECTION } from "@/constants/payments";

const topUpChips = [10, 25, 50];
const NANO_FACTOR = 1_000_000_000n;

const formatTonFromNano = (amountNano: string) => {
  try {
    return formatTonString(nanoToTonString(BigInt(amountNano)));
  } catch {
    return amountNano;
  }
};

const parseTonInputToNano = (value: string): bigint | null => {
  const trimmed = value.trim();
  if (!trimmed || trimmed === ".") {
    return null;
  }
  if (!/^\d*\.?\d*$/.test(trimmed)) {
    return null;
  }

  const [integerPartRaw, fractionRaw = ""] = trimmed.split(".");
  const integerPart = integerPartRaw === "" ? "0" : integerPartRaw;
  const fractionPadded = (fractionRaw + "000000000").slice(0, 9);

  return BigInt(integerPart) * NANO_FACTOR + BigInt(fractionPadded);
};

const resolveAvailableNano = (item?: ChannelPayoutItem | null) => {
  if (!item) {
    return 0n;
  }
  try {
    return BigInt(item.availableNano);
  } catch {
    return 0n;
  }
};

export default function Profile() {
  const { user } = useTelegram();
  const { t, language, setLanguage } = useLanguage();
  const { data: profile, isLoading, error, refetch } = useProfile();
  const [topUpAmount, setTopUpAmount] = useState(50);
  const [topUpAmountInput, setTopUpAmountInput] = useState("50");
  const [topUpStatus, setTopUpStatus] = useState<"idle" | "pending" | "confirmed">(
    "idle"
  );
  const [isTopUpLoading, setIsTopUpLoading] = useState(false);
  const [isTopUpSheetOpen, setIsTopUpSheetOpen] = useState(false);
  const [isWithdrawSheetOpen, setIsWithdrawSheetOpen] = useState(false);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState("");
  const [selectedPayout, setSelectedPayout] = useState<ChannelPayoutItem | null>(
    null
  );
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);
  const [payoutSearch, setPayoutSearch] = useState("");
  const wallet = useTonWallet();
  const [tonConnectUI] = useTonConnectUI();
  const { open: openWalletModal } = useTonConnectModal();
  const fullName = user
    ? `${user.first_name}${user.last_name ? ` ${user.last_name}` : ""}`
    : t("profile.displayNameFallback");
  const username = user?.username ? `@${user.username}` : t("profile.usernameFallback");
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  const topUpAddress = profile?.topUpAddress ?? "—";
  const topUpMemo = profile?.topUpMemo ?? "—";

  const payoutsQuery = useWithdrawableByChannel(payoutSearch.trim());
  const transactionFilters = useMemo(
    () => ({
      page: 1,
      limit: 10,
      sort: "recent" as const,
      order: "desc" as const,
    }),
    []
  );
  const transactionsQuery = useTransactions(transactionFilters);

  const payouts = payoutsQuery.data?.items ?? [];
  const payoutsError = payoutsQuery.error instanceof Error ? payoutsQuery.error : null;
  const transactions = transactionsQuery.data?.pages.flatMap((page) => page.items) ?? [];

  useEffect(() => {
    if (payoutsError) {
      toast.error(payoutsError.message);
    }
  }, [payoutsError]);

  const updateTopUpAmount = (value: string) => {
    setTopUpAmountInput(value);
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      setTopUpAmount(parsed);
    }
  };

  const handleTopUp = async () => {
    if (!Number.isFinite(topUpAmount) || topUpAmount <= 0) {
      toast.error(t("profile.toastSelectValidTopUp"));
      return;
    }

    if (!wallet) {
      openWalletModal();
      toast.info(t("profile.toastConnectWallet"));
      return;
    }

    setIsTopUpLoading(true);
    setTopUpStatus("pending");
    try {
      await tonConnectUI.sendTransaction(
        buildTonConnectTransaction({ address: topUpAddress, amountTon: topUpAmount })
      );

      setTopUpStatus("confirmed");
      setIsTopUpSheetOpen(false);
      toast.success(t("profile.toastTopUpConfirmed"));
    } catch (err) {
      setTopUpStatus("idle");
      toast.error(err instanceof Error ? err.message : t("profile.toastTopUpFailed"));
    } finally {
      setIsTopUpLoading(false);
    }
  };

  const topUpTransferLink = buildTonTransferLink({
    address: topUpAddress,
    amountTon: topUpAmount,
    memo: topUpMemo,
  });

  const handleOpenWithdrawSheet = (item: ChannelPayoutItem) => {
    setSelectedPayout(item);
    setWithdrawAmountInput("");
    setIsWithdrawSheetOpen(true);
  };

  const handleWithdraw = async () => {
    if (!selectedPayout) {
      return;
    }

    const amountNano = parseTonInputToNano(withdrawAmountInput);
    if (!amountNano || amountNano <= 0n) {
      toast.error("Enter a valid TON amount.");
      return;
    }

    const availableNano = resolveAvailableNano(selectedPayout);
    if (amountNano > availableNano) {
      toast.error("Amount exceeds available balance.");
      return;
    }

    setIsWithdrawLoading(true);
    try {
      const response = await withdrawFromChannel({
        channelId: selectedPayout.channel.id,
        amountNano: amountNano.toString(),
      });
      const message =
        typeof (response as { message?: string }).message === "string"
          ? (response as { message: string }).message
          : "Withdrawal request submitted.";
      toast.success(message);
      setIsWithdrawSheetOpen(false);
      setWithdrawAmountInput("");
      setSelectedPayout(null);
      await payoutsQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Withdraw failed.");
    } finally {
      setIsWithdrawLoading(false);
    }
  };

  const withdrawAvailableNano = resolveAvailableNano(selectedPayout);
  const withdrawAvailableTon = useMemo(
    () => nanoToTonString(withdrawAvailableNano),
    [withdrawAvailableNano]
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      <PageContainer className="py-6 space-y-6">
        {isLoading ? (
          <LoadingSkeleton items={2} />
        ) : error ? (
          <ErrorState
            message={getErrorMessage(error, "Unable to load profile")}
            description="Please reconnect your session and try again."
            onRetry={() => refetch()}
          />
        ) : (
          <>
            <div className="glass p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user?.photo_url} alt={fullName} />
                  <AvatarFallback className="bg-primary/15 text-primary text-lg font-semibold">
                    {initials || "TG"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-semibold text-foreground">{fullName}</h2>
                  <p className="text-sm text-muted-foreground">{username}</p>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                    <ShieldCheck size={14} className="text-primary/80" />
                    {t("profile.connectedViaTelegram")}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
              <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
                <div className="relative rounded-[28px] border border-border/40 bg-background/70 shadow-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">Wallet</p>
                    <TonConnectButton className="shrink-0" />
                  </div>
                </div>

                <div className="glass p-4 space-y-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t("profile.language")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("profile.languageDescription")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      {
                        value: "en",
                        label: t("profile.languageOptionEnglish"),
                      },
                      {
                        value: "ru",
                        label: t("profile.languageOptionRussian"),
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLanguage(option.value as "en" | "ru")}
                        className={`rounded-md border px-3 py-1 text-xs transition ${
                          language === option.value
                            ? "border-primary/60 bg-primary/20 text-primary"
                            : "border-border/40 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-border/40 bg-background/70 shadow-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Payouts</h3>
                      <p className="text-sm text-muted-foreground">
                        Available to withdraw from your channels
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => payoutsQuery.refetch()}
                      disabled={payoutsQuery.isFetching}
                      className="inline-flex items-center gap-2 rounded-md border border-border/40 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:opacity-60"
                    >
                      <RefreshCcw size={14} />
                      Reload
                    </button>
                  </div>
                  <Input
                    value={payoutSearch}
                    onChange={(event) => setPayoutSearch(event.target.value)}
                    placeholder="Search channels"
                    className="h-10 rounded-md bg-background/70"
                  />
                </div>

                <div className="px-5 py-5 space-y-4 pb-8">
                  {payoutsQuery.isLoading ? (
                    <LoadingSkeleton items={3} />
                  ) : payouts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No channel payouts available.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {payouts.map((item) => {
                        const availableNano = resolveAvailableNano(item);
                        const availableLabel = formatTonFromNano(item.availableNano);
                        const isDisabled = availableNano <= 0n;
                        return (
                          <div
                            key={item.channel.id}
                            className="glass p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <Avatar className="h-11 w-11">
                                <AvatarImage
                                  src={item.channel.avatarUrl ?? undefined}
                                  alt={item.channel.name}
                                />
                                <AvatarFallback className="bg-primary/15 text-primary text-sm font-semibold">
                                  {item.channel.name.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-sm font-semibold text-foreground">
                                  {item.channel.name}
                                </p>
                                {item.channel.username ? (
                                  <p className="text-xs text-muted-foreground">
                                    @{item.channel.username}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            <div className="flex items-center justify-between gap-4 sm:justify-end">
                              <button
                                type="button"
                                onClick={() => handleOpenWithdrawSheet(item)}
                                disabled={isDisabled}
                                className="button-primary rounded-md px-4 py-2 text-xs disabled:pointer-events-none disabled:opacity-60"
                              >
                                Withdraw
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-foreground">
                                {isDisabled ? "0" : availableLabel} TON
                              </p>
                              <p className="text-[11px] text-muted-foreground">Available</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {payoutsError ? (
                    <p className="text-xs text-rose-200">{payoutsError.message}</p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-border/40 bg-background/70 shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Transactions</h3>
                  <p className="text-sm text-muted-foreground">Recent activity</p>
                </div>
                <button
                  type="button"
                  onClick={() => transactionsQuery.refetch()}
                  disabled={transactionsQuery.isFetching}
                  className="inline-flex items-center gap-2 rounded-md border border-border/40 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:opacity-60"
                >
                  <RefreshCcw size={14} />
                  Reload
                </button>
              </div>
              <div className="px-5 py-5 space-y-3">
                {transactionsQuery.isLoading ? (
                  <LoadingSkeleton items={3} />
                ) : transactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No transactions yet.</p>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((item) => {
                      const sign =
                        item.direction === TRANSACTION_DIRECTION.OUT ? "-" : "+";
                      return (
                      <div
                        key={item.id}
                        className="flex flex-col gap-2 rounded-2xl border border-border/50 bg-card/70 px-4 py-3 text-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">{item.type}</span>
                          <span className="text-xs text-muted-foreground">{item.status}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {sign}
                            {formatTon(item.amountNano, language)} {t("common.ton")}
                          </span>
                          <span>{formatDateTime(item.createdAt, language)}</span>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                )}
                {transactionsQuery.error instanceof Error ? (
                  <p className="text-xs text-rose-200">{transactionsQuery.error.message}</p>
                ) : null}
              </div>
            </div>
          </>
        )}
      </PageContainer>
      <Sheet
        open={isWithdrawSheetOpen}
        onOpenChange={(open) => {
          setIsWithdrawSheetOpen(open);
          if (!open) {
            setSelectedPayout(null);
            setWithdrawAmountInput("");
          }
        }}
      >
        <SheetContent
          side="bottom"
          className="rounded-t-3xl border-t border-border/60 bg-background/95 px-5 pb-8 pt-6"
        >
          <SheetHeader className="text-left">
            <SheetTitle>Withdraw from channel</SheetTitle>
            <SheetDescription>
              Enter the amount you want to withdraw from this channel.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-5 space-y-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {selectedPayout?.channel.name ?? ""}
              </p>
              {selectedPayout?.channel.username ? (
                <p className="text-xs text-muted-foreground">
                  @{selectedPayout.channel.username}
                </p>
              ) : null}
              <p className="text-xs text-muted-foreground">
                Available: {formatTonString(withdrawAvailableTon)} TON
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Amount (TON)</label>
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={withdrawAmountInput}
                  onChange={(event) => setWithdrawAmountInput(event.target.value)}
                  className="h-12 rounded-2xl text-lg"
                  placeholder="0.00"
                />
                <span className="text-sm font-medium text-muted-foreground">TON</span>
              </div>
              <button
                type="button"
                onClick={() => setWithdrawAmountInput(withdrawAvailableTon)}
                className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary/80 transition hover:border-primary/60 hover:bg-primary/20"
              >
                Max
              </button>
            </div>
            <button
              type="button"
              className="button-primary rounded-md py-4 disabled:pointer-events-none disabled:opacity-70"
              onClick={handleWithdraw}
              disabled={isWithdrawLoading}
            >
              {isWithdrawLoading ? "Processing..." : "Confirm withdraw"}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
