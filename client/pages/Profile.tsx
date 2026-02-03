import { ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { TonConnectButton } from "@tonconnect/ui-react";
import { toast } from "sonner";
import LoadingSkeleton from "@/components/feedback/LoadingSkeleton";
import { useLanguage } from "@/i18n/LanguageProvider";
import { Input } from "@/components/ui/input";
import { PageContainer } from "@/components/layout/PageContainer";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listTransactionsForUser } from "@/api/features/paymentsApi";
import {
  listChannelPayouts,
  withdrawFromChannel,
} from "@/api/features/paymentsPayoutsApi";
import type { PaymentsListFilters } from "@/models/payments";
import { formatDateTime, formatTon } from "@/i18n/formatters";
import { TRANSACTION_DIRECTION, TRANSACTION_STATUS, TRANSACTION_TYPE } from "@/constants/payments";
import { useAuth } from "@/components/auth/AuthProvider";
import { useWalletContext } from "@/contexts/WalletContext";

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
  const [transactionFilters, setTransactionFilters] = useState<PaymentsListFilters>({
    page: 1,
    limit: 10,
  });
  const [withdrawingChannelIds, setWithdrawingChannelIds] = useState<string[]>([]);
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

  const transactionsQuery = useQuery({
    queryKey: ["transactions", transactionFilters],
    queryFn: () => listTransactionsForUser(transactionFilters),
    refetchOnWindowFocus: false,
  });

  const channelPayoutsQuery = useQuery({
    queryKey: ["channel-payouts"],
    queryFn: () => listChannelPayouts(),
    refetchOnWindowFocus: false,
  });

  const transactions = transactionsQuery.data?.items ?? [];
  const transactionHasNext = transactionsQuery.data?.hasNext ?? false;
  const channelPayouts = channelPayoutsQuery.data?.items ?? [];
  const channelPayoutsTotal = channelPayoutsQuery.data?.totals?.availableNano;

  useEffect(() => {
    if (transactionsQuery.error instanceof Error) {
      toast.error(transactionsQuery.error.message);
    }
  }, [transactionsQuery.error]);

  useEffect(() => {
    if (channelPayoutsQuery.error instanceof Error) {
      toast.error(channelPayoutsQuery.error.message);
    }
  }, [channelPayoutsQuery.error]);

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

  const handleWithdraw = async (channelId: string, amountNano: string) => {
    if (!isConnected || !walletAddress) {
      toast.error(t("profile.toastConnectWallet"));
      return;
    }

    if (BigInt(amountNano) <= 0n) {
      toast.error(t("profile.toastInsufficientBalance"));
      return;
    }

    setWithdrawingChannelIds((prev) => [...new Set([...prev, channelId])]);
    try {
      await withdrawFromChannel({
        channelId,
        amountNano,
        destinationAddress: walletAddress,
      });
      toast.success(t("profile.withdrawSubmitted"));
      await queryClient.invalidateQueries({ queryKey: ["channel-payouts"] });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("profile.toastWithdrawFailed")
      );
    } finally {
      setWithdrawingChannelIds((prev) => prev.filter((id) => id !== channelId));
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <PageContainer className="py-6 space-y-6">
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
                <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-secondary/60 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                  <ShieldCheck size={14} className="text-primary/80" />
                  {t("profile.connectedViaTelegram")}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[340px_1fr] space-y-2">
            <div className="space-y-6 lg:sticky lg:top-20 lg:self-start ">
              <div className="relative rounded-[28px] border border-border/40 bg-background/70 shadow-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between gap-1 ">

                  <TonConnectButton className="shrink-0" />
                </div>
              </div>

              <div className="glass p-4 space-y-4">
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

            <div className="space-y-6">
              <div className="rounded-[28px] border border-border/40 bg-background/70 shadow-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-border/40 space-y-1">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {t("profile.payoutsTitle")}
                    </h3>
                  </div>
                  {channelPayoutsTotal ? (
                    <p className="text-sm text-muted-foreground">
                      {t("profile.payoutsTotalAvailable")}:{" "}
                      <span className="font-semibold price-text">
                        {formatTon(channelPayoutsTotal, language)} {t("common.ton")}
                      </span>
                    </p>
                  ) : null}
                </div>
                <div className="px-5 py-5 space-y-4 pb-8">
                  {channelPayoutsQuery.isLoading ? (
                    <LoadingSkeleton items={2} />
                  ) : channelPayouts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {t("profile.payoutsEmpty")}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {channelPayouts.map((item) => {
                        const channelName = item.channel.username
                          ? `@${item.channel.username}`
                          : item.channel.name;
                        const hasBalance = BigInt(item.availableNano) > 0n;
                        const isWithdrawing = withdrawingChannelIds.includes(item.channel.id);
                        return (
                          <div
                            key={item.channel.id}
                            className="glass p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-foreground">
                                {item.channel.name}
                              </p>
                              <p className="text-xs text-muted-foreground">{channelName}</p>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-sm font-semibold price-text">
                                {formatTon(item.availableNano, language)} {t("common.ton")}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {t("profile.availableBalance")}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleWithdraw(item.channel.id, item.availableNano)}
                              disabled={isWithdrawing}
                              className="inline-flex items-center gap-1.5 bg-primary/20 hover:bg-primary/30 text-primary px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                            >
                              {isWithdrawing
                                ? t("common.loading")
                                : t("profile.withdrawAction")}
                            </button>
                            {hasBalance ? (
                              <button
                                type="button"
                                onClick={() => handleWithdraw(item.channel.id, item.availableNano)}
                                disabled={isWithdrawing}
                                className="inline-flex items-center justify-center rounded-lg border border-border/60 bg-card/80 px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isWithdrawing
                                  ? t("common.loading")
                                  : t("profile.withdrawAction")}
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

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
                              <p className="text-sm font-semibold price-text">
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
                  {transactionHasNext ? (
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
        </div>
      </PageContainer>
    </div>
  );
}
