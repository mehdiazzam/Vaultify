import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Trash2 } from "lucide-react";
import { RecentTransactions } from "../components/dashboard/RecentTransactions";
import { CategoryDonut } from "../components/charts/CategoryDonut";
import { useFinanceStore } from "../stores/financeStore";
import { useAuthStore } from "../stores/authStore";
import { useFinanceData } from "../hooks/useFinanceData";
import { useDashboard } from "../hooks/useDashboard";
import { staggerItem } from "../animations/variants";
import PageContainer from "@/components/layout/PageContainer";

import {
  getCategoryData,
  getGreeting,
  getMonthLabel,
  getAccountSummary,
  getTopLevelAssetAccounts,
  getTransactionsForAccount,
  formatCurrency,
} from "../utils";
import { ChartSkeleton } from "../components/ui/Skeleton";
import { GlassCard } from "../components/ui/GlassCard";
import { EmptyState } from "../components/ui/EmptyState";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import NewAccountAction from "../components/dashboard/NewAccountAction";

export default function Dashboard() {
  const {
    transactions: storeTransactions,
    accounts: storeAccounts,
    categories: storeCategories,
    currencies: storeCurrencies,
  } = useFinanceStore();
  const { user } = useAuthStore();
  const { disableAccount } = useFinanceData();
  const { data: financeData, isLoading, error } = useDashboard();

  const transactions = financeData?.transactions ?? storeTransactions;
  const accounts = financeData?.accounts ?? storeAccounts;
  const categories = financeData?.categories ?? storeCategories;
  const currencies = financeData?.currencies ?? storeCurrencies;
  const topLevelAccounts = useMemo(
    () => getTopLevelAssetAccounts(accounts),
    [accounts],
  );
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [expandedAccountId, setExpandedAccountId] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const selectedAccount =
    topLevelAccounts.find((account) => account.id === selectedAccountId) ??
    topLevelAccounts[0];
  const selectedAccountIdResolved = selectedAccount?.id ?? "";
  const expandedAccountIdResolved = topLevelAccounts.some(
    (account) => account.id === expandedAccountId,
  )
    ? expandedAccountId
    : selectedAccountIdResolved;

  const accountTransactions = useMemo(() => {
    if (!selectedAccount) return transactions;

    return getTransactionsForAccount(
      transactions,
      accounts,
      selectedAccount.id,
    );
  }, [transactions, accounts, selectedAccount]);

  const categoryData = useMemo(
    () =>
      getCategoryData(accountTransactions, categories, accounts, currencies, {
        currency: selectedAccount?.currency ?? "USD",
      }),
    [
      accountTransactions,
      categories,
      accounts,
      currencies,
      selectedAccount?.currency,
    ],
  );
  const accountCards = useMemo(() => {
    return topLevelAccounts.map((account) => ({
      account,
      summary: getAccountSummary(transactions, accounts, account.id),
    }));
  }, [topLevelAccounts, transactions, accounts]);
  const displayName = user?.displayName || "there";

  const handleDeleteAccount = (accountId: string, accountName: string) => {
    setDeleteError("");
    setDeleteTarget({ id: accountId, name: accountName });
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteError("");
  };

  const confirmDeleteAccount = async () => {
    if (!deleteTarget) return;

    try {
      await disableAccount.mutateAsync(deleteTarget.id);
      setSelectedAccountId((current) =>
        current === deleteTarget.id ? "" : current,
      );
      setExpandedAccountId((current) =>
        current === deleteTarget.id ? "" : current,
      );
      closeDeleteModal();
    } catch (e) {
      setDeleteError(
        e instanceof Error ? e.message : "Could not disable account.",
      );
    }
  };

  return (
    <PageContainer>
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight dark:text-white text-slate-900">
          {getGreeting()}, <span className="gradient-text">{displayName}</span>
        </h1>
        <p className="text-sm dark:text-slate-500 text-slate-500 mt-1">
          Here's your financial overview for {getMonthLabel()}
        </p>
      </motion.div>

      {error && (
        <motion.div variants={staggerItem}>
          <GlassCard>
            <p className="text-sm text-rose-400">{error.message}</p>
          </GlassCard>
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wider dark:text-slate-400 text-slate-600">
              Accounts
            </h2>
            <p className="text-xs dark:text-slate-500 text-slate-500 mt-1">
              Select an account to update the charts and recent transactions.
            </p>
            {deleteError && (
              <p className="mt-2 text-xs text-rose-400">{deleteError}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3 overflow-x-auto py-2 sm:flex-row sm:gap-4 sm:py-2">
          {accountCards.length === 0 ? (
            <GlassCard className="w-full sm:grow-0 sm:shrink-0 sm:basis-[31%]">
              <EmptyState
                title="No accounts yet"
                description="Create an account to see balances, chart activity, and recent transactions here."
              />
            </GlassCard>
          ) : (
            accountCards.map(({ account, summary }) => {
              const isSelected = selectedAccountIdResolved === account.id;
              const isExpanded = expandedAccountIdResolved === account.id;

              return (
                <GlassCard
                  key={account.id}
                  className={`w-full overflow-hidden border transition-all duration-200 sm:shrink-0 sm:basis-[31%] ${isSelected ? "border-violet-500/40 shadow-lg shadow-violet-500/10" : "border-black/10 dark:border-white/10"}`}
                  onClick={() => {
                    setSelectedAccountId(account.id);
                    setExpandedAccountId((current) =>
                      current === account.id ? "" : account.id,
                    );
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold dark:text-white text-slate-900 truncate">
                          {account.name}
                        </h3>
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full dark:bg-white/10 bg-black/10 dark:text-slate-300 text-slate-600">
                          {account.type}
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-violet-500" />
                        )}
                        {account.isSaving && (
                          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                            saving
                          </span>
                        )}
                      </div>
                      <p className="text-xs dark:text-slate-500 text-slate-500 mt-1">
                        {account.currency}
                        {account.number ? ` • ${account.number}` : ""}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs uppercase tracking-wider dark:text-slate-500 text-slate-500">
                        Balance
                      </p>
                      <p className="mt-1 text-lg font-bold dark:text-white text-slate-900">
                        {formatCurrency(summary.balance, account.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs dark:text-slate-500 text-slate-500">
                    <span>
                      {isSelected
                        ? "Selected account"
                        : "Tap to follow this account"}
                    </span>
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </div>

                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 space-y-2 border-t dark:border-white/10 border-black/10 pt-4"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="dark:text-slate-400 text-slate-500">
                          Income
                        </span>
                        <span className="font-medium text-emerald-400">
                          {formatCurrency(summary.income, account.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="dark:text-slate-400 text-slate-500">
                          Expense
                        </span>
                        <span className="font-medium text-rose-400">
                          {formatCurrency(summary.expense, account.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="dark:text-slate-400 text-slate-500">
                          Saving
                        </span>
                        <span className="font-medium text-amber-400">
                          {formatCurrency(summary.savings, account.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="dark:text-slate-400 text-slate-500">
                          Lent
                        </span>
                        <span className="font-medium text-blue-400">
                          {formatCurrency(summary.lent, account.currency)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="dark:text-slate-400 text-slate-500">
                          Borrowed
                        </span>
                        <span className="font-medium text-orange-400">
                          {formatCurrency(summary.borrowed, account.currency)}
                        </span>
                      </div>
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleDeleteAccount(account.id, account.name);
                          }}
                          className="inline-flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-400 transition-colors hover:bg-rose-500/20 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          Disable account
                        </button>
                      </div>
                    </motion.div>
                  )}
                </GlassCard>
              );
            })
          )}

          <NewAccountAction />
        </div>
      </motion.div>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        title="Disable account"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm dark:text-slate-300 text-slate-700">
            Disable{" "}
            <span className="font-semibold dark:text-white text-slate-900">
              {deleteTarget?.name}
            </span>{" "}
            and its child accounts? Transactions will stay intact.
          </p>
          {deleteError && (
            <p className="text-sm text-rose-400">{deleteError}</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={closeDeleteModal}
              disabled={disableAccount.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              onClick={() => void confirmDeleteAccount()}
              loading={disableAccount.isPending}
            >
              Disable
            </Button>
          </div>
        </div>
      </Modal>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <motion.div variants={staggerItem}>
          <RecentTransactions
            transactions={accountTransactions}
            currency={selectedAccount?.currency ?? "USD"}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <CategoryDonut
              data={categoryData}
              currency={selectedAccount?.currency ?? "USD"}
              title={`Spending by Category${selectedAccount ? ` · ${selectedAccount.name}` : ""}`}
            />
          )}
        </motion.div>
      </div>
    </PageContainer>
  );
}
