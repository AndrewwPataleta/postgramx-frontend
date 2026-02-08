import { ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useMemo, useRef, useState } from "react";
import { TonConnectButton } from "@tonconnect/ui-react";
import { toast } from "sonner";
import ProfileSkeleton from "@/components/skeletons/ProfileSkeleton";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/PageContainer";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setWallet } from "@/api/features/walletApi";
import type { TransactionsListFilters } from "@/api/types/payments";
import { formatDateTime, formatTon } from "@/i18n/formatters";
import { TRANSACTION_DIRECTION, TRANSACTION_STATUS, TRANSACTION_TYPE } from "@/constants/payments";
import { useAuth } from "@/components/auth/AuthProvider";
import { useWalletContext } from "@/contexts/WalletContext";
import { useTheme } from "@/theme/ThemeProvider";
import BottomSheet from "@/components/BottomSheet";
import { formatTonFromNano, parseTonToNano } from "@/lib/ton";
import { useBalanceOverview } from "@/hooks/useBalanceOverview";
import { buildTransactionsFiltersHash, useTransactions } from "@/hooks/useTransactions";
import { requestPayout } from "@/api/paymentsBalanceApi";
import { AnimatedList, AnimatedListItem } from "@/motion/AnimatedList";

type ProfileUser = {
  firstName?: string | null;
  lastName?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  avatar?: string | null;
  photo_url?: string | null;
};

export default function Profile() {
  const { user } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const { walletAddress, isConnected } = useWalletContext();
  const { mode, setMode } = useTheme();
  const [activeSection, setActiveSection] = useState<"balance" | "transactions" | "settings">(
    "balance"
  );
  const [transactionFilters, setTransactionFilters] = useState<TransactionsListFilters>({
    page: 1,
    limit: 10,
  });
  const [withdrawSheetOpen, setWithdrawSheetOpen] = useState(false);
  const [withdrawAll, setWithdrawAll] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const lastSyncedWalletRef = useRef<string | null>(null);
  const profileUser = user as ProfileUser | null;
  const firstName = profileUser?.firstName ?? profileUser?.first_name ?? "";
  const lastName = profileUser?.lastName ?? profileUser?.last_name ?? "";
  const fullName =
    firstName || lastName ? `${firstName} ${lastName}`.trim() : t("profile.displayNameFallback");
  const username = profileUser?.username
    ? `@${profileUser.username}`
    : t("profile.usernameFallback");
  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  const themeOptions: Array<{ value: "telegram" | "light" | "dark" | "system"; label: string }> = [
    { value: "telegram", label: t("profile.themeTelegram") },
    { value: "system", label: t("profile.themeSystem") },
    { value: "light", label: t("profile.themeLight") },
    { value: "dark", label: t("profile.themeDark") },
  ];

  const balanceOverviewQuery = useBalanceOverview();
  const transactionsQuery = useTransactions(transactionFilters);
  const transactionsFiltersKey = buildTransactionsFiltersHash(transactionFilters);
  const isProfileLoading =
    balanceOverviewQuery.isLoading &&
    transactionsQuery.isLoading &&
    !balanceOverviewQuery.data &&
    !transactionsQuery.data;

  const transactions = useMemo(
    () => transactionsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [transactionsQuery.data?.pages]
  );
  const lastTransactionsPage = transactionsQuery.data?.pages.at(-1);
  const transactionHasNext = lastTransactionsPage?.hasNext ?? false;
  const connectedWalletAddress = walletAddress ?? null;
  const balanceOverview = balanceOverviewQuery.data;
  const availableNano = balanceOverview?.availableNano ?? "0";
  const pendingNano = balanceOverview?.pendingNano ?? "0";
  const lifetimeEarnedNano = balanceOverview?.lifetimeEarnedNano ?? "0";
  const lifetimePaidOutNano = balanceOverview?.lifetimePaidOutNano ?? "0";
  const availableNanoValue = useMemo(() => {
    if (/^\d+$/.test(availableNano)) {
      return BigInt(availableNano);
    }
    return parseTonToNano(availableNano) ?? 0n;
  }, [availableNano]);
  const hasAvailableBalance = availableNanoValue > 0n;

  const formatLabel = (value?: string | null) => {
    if (!value) return null;
    const normalized = value.replace(/_/g, " ").trim();
    if (!normalized) return null;
    return normalized[0].toUpperCase() + normalized.slice(1).toLowerCase();
  };

  useEffect(() => {
    if (transactionsQuery.error instanceof Error) {
      toast.error(transactionsQuery.error.message);
    }
  }, [transactionsQuery.error]);

  useEffect(() => {
    if (balanceOverviewQuery.error instanceof Error) {
      toast.error(balanceOverviewQuery.error.message);
    }
  }, [balanceOverviewQuery.error]);

  useEffect(() => {
    console.debug("[Profile] wallet status", {
      isConnected,
      walletAddress,
      connectedWalletAddress,
    });
  }, [
    isConnected,
    walletAddress,
    connectedWalletAddress,
  ]);

  useEffect(() => {
    console.debug("[Profile] balance overview", {
      availableNano,
      pendingNano,
      lifetimeEarnedNano,
      lifetimePaidOutNano,
      availableNanoValue: availableNanoValue.toString(),
      hasAvailableBalance,
      balanceOverviewLoading: balanceOverviewQuery.isLoading,
      balanceOverviewError: balanceOverviewQuery.error,
    });
  }, [
    availableNano,
    pendingNano,
    lifetimeEarnedNano,
    lifetimePaidOutNano,
    availableNanoValue,
    hasAvailableBalance,
    balanceOverviewQuery.isLoading,
    balanceOverviewQuery.error,
  ]);

  const requestPayoutMutation = useMutation({
    mutationFn: requestPayout,
    onSuccess: () => {
      toast.success(t("profile.withdrawSubmitted"));
      queryClient.invalidateQueries({ queryKey: ["balanceOverview"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : t("profile.toastWithdrawFailed"));
    },
  });

  const updateTransactionFilters = (patch: Partial<TransactionsListFilters>) => {
    setTransactionFilters((prev) => ({
      ...prev,
      ...patch,
      page: patch.page ?? 1,
    }));
  };

  const { mutate: syncWallet } = useMutation({
    mutationFn: setWallet,
    onError: (error) => {
      console.error("[Profile] wallet sync failed", error);
      toast.error(t("profile.walletSyncFailed"));
    },
  });

  useEffect(() => {
    if (!isConnected || !connectedWalletAddress) {
      lastSyncedWalletRef.current = null;
      return;
    }

    if (lastSyncedWalletRef.current === connectedWalletAddress) {
      return;
    }

    lastSyncedWalletRef.current = connectedWalletAddress;
    syncWallet(connectedWalletAddress);
  }, [connectedWalletAddress, isConnected, syncWallet]);

  const handleWithdrawOpen = () => {
    console.debug("[Profile] withdraw open", {
      connectedWalletAddress,
      availableNano,
      availableNanoValue: availableNanoValue.toString(),
      hasAvailableBalance,
    });
    if (!connectedWalletAddress) {
      toast.error(t("profile.toastConnectWallet"));
      return;
    }
    setWithdrawAll(true);
    setWithdrawAmount(formatTonFromNano(availableNanoValue.toString()));
    setWithdrawSheetOpen(true);
  };

  const handleWithdrawSubmit = () => {
    console.log("[Profile] withdraw submit start", {
      connectedWalletAddress,
      withdrawAll,
      withdrawAmount,
      availableNanoValue: availableNanoValue.toString(),
      hasAvailableBalance,
    });
    if (!connectedWalletAddress) {
      toast.error(t("profile.toastConnectWallet"));
      return;
    }
    if (!hasAvailableBalance) {
      toast.error(t("profile.toastInsufficientBalance"));
      return;
    }
    if (withdrawAll) {
      console.log("[Profile] withdraw submit: requesting full payout");
      requestPayoutMutation.mutate({
        amountNano: availableNanoValue.toString(),
        currency: "TON",
      });
      setWithdrawSheetOpen(false);
      return;
    }
    const parsed = parseTonToNano(withdrawAmount);
    console.log("[Profile] withdraw submit: parsed amount", {
      withdrawAmount,
      parsed: parsed ? parsed.toString() : null,
    });
    if (!parsed || parsed <= 0n) {
      toast.error(t("profile.toastSelectValidWithdraw"));
      return;
    }
    if (parsed > availableNanoValue) {
      toast.error(t("profile.toastInsufficientBalance"));
      return;
    }
    requestPayoutMutation.mutate({ amountNano: parsed.toString(), currency: "TON" });
    setWithdrawSheetOpen(false);
  };

  const shortAddress = (value: string | null | undefined) => {
    if (!value) return t("profile.walletNotConnected");
    if (value.length <= 10) return value;
    return `${value.slice(0, 4)}…${value.slice(-4)}`;
  };

  const directionBadgeStyle = (direction?: string) => {
    switch (direction) {
      case "IN":
        return "bg-emerald-500/10 text-emerald-500";
      case "OUT":
        return "bg-rose-500/10 text-rose-500";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <PageContainer className="py-6 space-y-6">
        {isProfileLoading ? (
          <ProfileSkeleton />
        ) : (
        <div>
          <div className="glass p-5">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={profileUser?.avatar ?? profileUser?.photo_url ?? undefined}
                  alt={fullName}
                />
                <AvatarFallback className="bg-primary/15 text-primary text-lg font-semibold">
                  {initials || t("common.avatarFallback")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold text-foreground">{fullName}</h2>
                <p className="text-sm text-muted-foreground">{username}</p>
                <div
                  className="mt-2 inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1 text-[11px] font-medium text-muted-foreground"
                >
                  <ShieldCheck size={14} className="text-primary/80" />
                  {t("profile.connectedViaTelegram")}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-6 border-b border-border/60">
            {(["balance", "transactions", "settings"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveSection(tab)}
                className={`pb-3 text-sm font-semibold transition-colors ${
                  activeSection === tab
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {t(`profile.tabs.${tab}`)}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-6">
            {activeSection === "balance" ? (
              <>
                <div className="rounded-[28px] border border-border/40 bg-background/70 shadow-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-border/40 space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("profile.balanceOverviewTitle")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.balanceOverviewSubtitle")}
                    </p>
                  </div>
                  <div className="px-5 py-5 space-y-4 pb-8">
                    <div className="space-y-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="glass p-4">
                          <p className="text-xs text-muted-foreground">
                            {t("profile.availableBalance")}
                          </p>
                          <p className="text-lg font-semibold price-text">
                            {formatTon(availableNanoValue.toString(), language)}{" "}
                            {t("common.ton")}
                          </p>
                        </div>
                        <div className="glass p-4">
                          <p className="text-xs text-muted-foreground">
                            {t("profile.pendingBalance")}
                          </p>
                          <p className="text-lg font-semibold price-text">
                            {formatTon(pendingNano, language)} {t("common.ton")}
                          </p>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-border/40 bg-background/60 p-4 text-xs text-muted-foreground">
                          <p>{t("profile.lifetimeEarned")}</p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatTon(lifetimeEarnedNano, language)} {t("common.ton")}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/40 bg-background/60 p-4 text-xs text-muted-foreground">
                          <p>{t("profile.lifetimePaidOut")}</p>
                          <p className="text-sm font-semibold text-foreground">
                            {formatTon(lifetimePaidOutNano, language)} {t("common.ton")}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        {connectedWalletAddress ? (
                          <button
                            type="button"
                            onClick={handleWithdrawOpen}
                            disabled={!hasAvailableBalance}
                            className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-card/80 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {t("profile.withdrawAction")}
                          </button>
                        ) : (
                          <span className="text-xs text-primary">
                            {t("profile.connectWalletCta")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-[28px] border border-border/40 bg-background/70 shadow-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-border/40 space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("profile.walletSectionTitle")}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t("profile.walletSectionSubtitle")}
                    </p>
                  </div>
                  <div className="px-5 py-5 space-y-4 pb-8">
                    <div className="glass p-4 space-y-2">
                      <p className="text-xs text-muted-foreground">{t("profile.payoutWallet")}</p>
                      <p className="text-sm font-semibold text-foreground">
                        {shortAddress(connectedWalletAddress)}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {connectedWalletAddress
                          ? t("profile.walletConnectedHint")
                          : t("profile.walletNotConnectedHint")}
                      </p>
                    </div>
                    <TonConnectButton className="w-full" />
                  </div>
                </div>

              </>
            ) : null}

            {activeSection === "transactions" ? (
              <div className="rounded-[28px] border border-border/40 bg-background/70 shadow-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 space-y-3">
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
                  {transactions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("profile.transactionsEmpty")}
                    </p>
                  ) : (
                    <AnimatedList
                      key={transactionsFiltersKey}
                      itemsCount={transactions.length}
                      className="space-y-3"
                    >
                      {transactions.map((item, index) => {
                        const amountLabel = formatTon(item.amountNano, language);
                        const typeLabel =
                          formatLabel(item.typeLabel) ?? t(`transactions.type.${item.type}`);
                        const statusLabel =
                          formatLabel(item.statusLabel) ??
                          t(`transactions.status.${item.status}`);
                        const directionLabel =
                          formatLabel(item.directionLabel) ??
                          t(`transactions.direction.${item.direction}`);
                        const descriptionLabel =
                          formatLabel(item.descriptionLabel) ??
                          item.description ??
                          t("profile.transactionNoDescription");
                        return (
                          <AnimatedListItem
                            key={item.id}
                            index={index}
                            pulseKey={item.status}
                          >
                            <div className="glass p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold text-foreground">{typeLabel}</p>
                                <p className="text-xs text-muted-foreground">{descriptionLabel}</p>
                                <p className="text-[11px] text-muted-foreground">{statusLabel}</p>
                              </div>
                              <div className="text-right flex flex-col items-end gap-1">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-semibold price-text">
                                    {amountLabel} {item.currency ?? t("common.ton")}
                                  </p>
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${directionBadgeStyle(
                                      item.direction
                                    )}`}
                                  >
                                    {directionLabel}
                                  </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">
                                  {formatDateTime(item.createdAt, language)}
                                </p>
                              </div>
                            </div>
                          </AnimatedListItem>
                        );
                      })}
                    </AnimatedList>
                  )}
                  {transactionHasNext ? (
                    <button
                      type="button"
                      onClick={() => transactionsQuery.fetchNextPage()}
                      disabled={transactionsQuery.isFetchingNextPage}
                      className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-card/80 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-card"
                    >
                      {transactionsQuery.isFetchingNextPage
                        ? t("common.loading")
                        : t("common.loadMore")}
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {activeSection === "settings" ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="glass p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t("profile.language")}</p>
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

                <div className="glass p-4 space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {t("profile.themeTitle")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {t("profile.themeDescription")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {themeOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setMode(option.value)}
                        className={`rounded-md border px-3 py-1 text-xs transition ${
                          mode === option.value
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
            ) : null}
          </div>
        </div>
        )}
      </PageContainer>
      <BottomSheet
        open={withdrawSheetOpen}
        onOpenChange={setWithdrawSheetOpen}
        title={t("profile.withdrawSheetTitle")}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">{t("profile.availableBalance")}</p>
            <p className="text-sm font-semibold text-foreground">
              {formatTon(availableNanoValue.toString(), language)} {t("common.ton")}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              {t("profile.withdrawAmountLabel")}
            </label>
            <Input
              value={withdrawAmount}
              onChange={(event) => {
                setWithdrawAmount(event.target.value);
                setWithdrawAll(false);
              }}
              placeholder={t("profile.withdrawAmountPlaceholder")}
              className="h-10 rounded-md bg-background/70"
            />
            <button
              type="button"
              onClick={() => {
                setWithdrawAll(true);
                setWithdrawAmount(formatTonFromNano(availableNanoValue.toString()));
              }}
              className="text-xs font-semibold text-primary"
            >
              {t("profile.withdrawAll")}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">{t("profile.withdrawWarning")}</p>
          <button
            type="button"
            onClick={handleWithdrawSubmit}
            // disabled={
            //   requestPayoutMutation.isPending ||
            //   !hasAvailableBalance
            // }
            className="inline-flex w-full items-center justify-center rounded-lg border border-border/60 bg-card/80 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
          >
            {requestPayoutMutation.isPending
              ? t("common.loading")
              : t("profile.withdrawAction")}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
