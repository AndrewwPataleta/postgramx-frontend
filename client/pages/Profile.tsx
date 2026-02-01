import { CheckCircle2, Clock, RefreshCcw, ShieldCheck, Wallet } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";
import { listChannelPayouts, withdrawFromChannel } from "@/api/features/paymentsPayoutsApi";
import type { ChannelPayoutItem } from "@/api/types/payouts";
import { formatTonString, nanoToTonString } from "@/lib/ton";
import { listTransactionsForUser } from "@/api/features/paymentsApi";
import type { PaymentsListFilters, TransactionItem } from "@/models/payments";
import { formatDateTime, formatTon } from "@/i18n/formatters";
import { TRANSACTION_DIRECTION, TRANSACTION_STATUS, TRANSACTION_TYPE } from "@/constants/payments";

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
  // Payments endpoints are temporarily disabled until backend stabilizes.
  const paymentsEndpointsEnabled = false;
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
  const [transactionFilters, setTransactionFilters] = useState<PaymentsListFilters>({
    page: 1,
    limit: 10,
  });
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

  const payoutsQuery = useQuery({
    queryKey: ["payouts", payoutSearch],
    queryFn: () =>
      listChannelPayouts(payoutSearch.trim() ? { q: payoutSearch.trim() } : {}),
    refetchOnWindowFocus: false,
    enabled: paymentsEndpointsEnabled,
    retry: false,
  });

  const transactionsQuery = useQuery({
    queryKey: ["transactions", transactionFilters],
    queryFn: () => listTransactionsForUser(transactionFilters),
    refetchOnWindowFocus: false,
    enabled: paymentsEndpointsEnabled,
    retry: false,
  });

  const payouts = payoutsQuery.data?.items ?? [];
  const payoutsError = payoutsQuery.error instanceof Error ? payoutsQuery.error : null;
  const transactions = transactionsQuery.data?.items ?? [];
  const transactionHasNext = transactionsQuery.data?.hasNext ?? false;

  useEffect(() => {
    if (payoutsError) {
      toast.error(payoutsError.message);
    }
  }, [payoutsError]);

  useEffect(() => {
    if (transactionsQuery.error instanceof Error) {
      toast.error(transactionsQuery.error.message);
    }
  }, [transactionsQuery.error]);

  const updateTopUpAmount = (value: string) => {
    setTopUpAmountInput(value);
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      setTopUpAmount(parsed);
    }
  };

  const updateTransactionFilters = (patch: Partial<PaymentsListFilters>) => {
    setTransactionFilters((prev) => ({
      ...prev,
      ...patch,
      page: patch.page ?? 1,
    }));
  };

  const handleLoadMoreTransactions = () => {
    setTransactionFilters((prev) => ({
      ...prev,
      page: (prev.page ?? 1) + 1,
    }));
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
      toast.error(t("profile.withdrawInvalidAmount"));
      return;
    }

    const availableNano = resolveAvailableNano(selectedPayout);
    if (amountNano > availableNano) {
      toast.error(t("profile.withdrawExceedsBalance"));
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
          : t("profile.withdrawSubmitted");
      toast.success(message);
      setIsWithdrawSheetOpen(false);
      setWithdrawAmountInput("");
      setSelectedPayout(null);
      await payoutsQuery.refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t("profile.withdrawFailed"));
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
            message={getErrorMessage(error, t("profile.loadError"))}
            description={t("profile.loadErrorHint")}
            onRetry={() => refetch()}
          />
        ) : (
          <div>
            <div className="glass p-5">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={user?.photo_url} alt={fullName} />
                  <AvatarFallback className="bg-primary/15 text-primary text-lg font-semibold">
                    {initials || t("common.avatarFallback")}
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
                    <p className="text-sm font-semibold text-foreground">{t("profile.walletTitle")}</p>
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
                      <h3 className="text-lg font-semibold text-foreground">{t("profile.payoutsTitle")}</h3>
                      <p className="text-sm text-muted-foreground">
                        {t("profile.payoutsSubtitle")}
                      </p>
                    </div>
                  <button
                    type="button"
                    onClick={() => payoutsQuery.refetch()}
                    disabled={!paymentsEndpointsEnabled || payoutsQuery.isFetching}
                    className="inline-flex items-center gap-2 rounded-md border border-border/40 px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground disabled:opacity-60"
                  >
                    <RefreshCcw size={14} />
                    {t("common.refresh")}
                  </button>
                  </div>
                  <Input
                    value={payoutSearch}
                    onChange={(event) => setPayoutSearch(event.target.value)}
                    placeholder={t("profile.payoutSearchPlaceholder")}
                    className="h-10 rounded-md bg-background/70"
                  />
                </div>

                <div className="px-5 py-5 space-y-4 pb-8">
                  {payoutsQuery.isLoading ? (
                    <LoadingSkeleton items={3} />
                  ) : payouts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("profile.payoutsEmpty")}
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
                                {t("profile.withdrawAction")}
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-foreground">
                                {isDisabled ? "0" : availableLabel} TON
                              </p>
                              <p className="text-[11px] text-muted-foreground">{t("profile.availableLabel")}</p>
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

              <div className="rounded-[28px] border border-border/40 bg-background/70 shadow-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{t("profile.transactionsTitle")}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.transactionsSubtitle")}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      value={transactionFilters.q ?? ""}
                      onChange={(event) => updateTransactionFilters({ q: event.target.value })}
                      placeholder={t("profile.transactionsSearch")}
                      className="h-10 rounded-md bg-background/70"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={transactionFilters.status ?? ""}
                        onChange={(event) =>
                          updateTransactionFilters({
                            status: event.target.value || undefined,
                          })
                        }
                        className="h-10 rounded-md border border-border/40 bg-background/70 px-2 text-xs text-muted-foreground"
                      >
                        <option value="">{t("common.all")}</option>
                        {Object.values(TRANSACTION_STATUS).map((status) => (
                          <option key={status} value={status}>
                            {t(`transactions.status.${status}`)}
                          </option>
                        ))}
                      </select>
                      <select
                        value={transactionFilters.direction ?? ""}
                        onChange={(event) =>
                          updateTransactionFilters({
                            direction: event.target.value || undefined,
                          })
                        }
                        className="h-10 rounded-md border border-border/40 bg-background/70 px-2 text-xs text-muted-foreground"
                      >
                        <option value="">{t("common.all")}</option>
                        {Object.values(TRANSACTION_DIRECTION).map((direction) => (
                          <option key={direction} value={direction}>
                            {t(`transactions.direction.${direction}`)}
                          </option>
                        ))}
                      </select>
                      <select
                        value={transactionFilters.type ?? ""}
                        onChange={(event) =>
                          updateTransactionFilters({
                            type: event.target.value || undefined,
                          })
                        }
                        className="h-10 rounded-md border border-border/40 bg-background/70 px-2 text-xs text-muted-foreground"
                      >
                        <option value="">{t("common.all")}</option>
                        {Object.values(TRANSACTION_TYPE).map((type) => (
                          <option key={type} value={type}>
                            {t(`transactions.type.${type}`)}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="px-5 py-5 space-y-4 pb-8">
                  {transactionsQuery.isLoading ? (
                    <LoadingSkeleton items={3} />
                  ) : transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("profile.transactionsEmpty")}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {transactions.map((item) => {
                        const amountLabel = formatTon(item.amountNano, language);
                        return (
                          <div
                            key={item.id}
                            className="glass p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {t(`transactions.type.${item.type}`)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {item.description ?? t("profile.transactionNoDescription")}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-foreground">
                                {amountLabel} {item.currency ?? t("common.ton")}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {t(`transactions.status.${item.status}`)} •{" "}
                                {formatDateTime(item.createdAt, language)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {paymentsEndpointsEnabled && transactionHasNext ? (
                    <button
                      type="button"
                      onClick={handleLoadMoreTransactions}
                      disabled={transactionsQuery.isFetching}
                      className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-card"
                    >
                      {transactionsQuery.isFetching ? t("common.loading") : t("common.loadMore")}
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
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
            <SheetTitle>{t("profile.withdrawSheetTitle")}</SheetTitle>
            <SheetDescription>{t("profile.withdrawSheetSubtitle")}</SheetDescription>
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
                {t("profile.availableLabel")}: {formatTonString(withdrawAvailableTon)} TON
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">
                {t("profile.withdrawAmountLabel")}
              </label>
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  inputMode="decimal"
                  value={withdrawAmountInput}
                  onChange={(event) => setWithdrawAmountInput(event.target.value)}
                  className="h-12 rounded-2xl text-lg"
                  placeholder={t("profile.withdrawAmountPlaceholder")}
                />
                <span className="text-sm font-medium text-muted-foreground">{t("common.ton")}</span>
              </div>
              <button
                type="button"
                onClick={() => setWithdrawAmountInput(withdrawAvailableTon)}
                className="rounded-md border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary/80 transition hover:border-primary/60 hover:bg-primary/20"
              >
                {t("common.max")}
              </button>
            </div>
            <button
              type="button"
              className="button-primary rounded-md py-4 disabled:pointer-events-none disabled:opacity-70"
              onClick={handleWithdraw}
              disabled={isWithdrawLoading}
            >
              {isWithdrawLoading ? t("common.processing") : t("profile.confirmWithdraw")}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
