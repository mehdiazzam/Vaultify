import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { CategoryData, ChartDataPoint, FinancialInsight, HealthScore, Transaction, Account, Category } from '../types';
import type { Currency } from '../types';
import { formatCurrency, convertTransactionToUsd, isTransactionIncome as currencyIsTransactionIncome } from './currency';
import { isAccountTransferTransaction } from './transactions';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export currency formatter from a single file
export { formatCurrency };

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeDate(date: string): string {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDate(date);
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function getPercentageChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function getMonthLabel(date = new Date()): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

const getMonthKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const getTransactionMonthKey = (transaction: Transaction): string => {
  return transaction.date.slice(0, 7);
};

const CATEGORY_FALLBACK_COLORS = [
  '#34d399', // emerald
  '#60a5fa', // blue
  '#f472b6', // pink
  '#fbbf24', // amber
  '#a78bfa', // violet
  '#fb923c', // orange
  '#38bdf8', // sky
  '#f87171', // red
  '#22d3ee', // cyan
  '#4ade80', // green
];

const getCategoryFallbackColor = (categoryId: string): string => {
  if (!categoryId) return '#94a3b8';

  const hash = categoryId
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return CATEGORY_FALLBACK_COLORS[hash % CATEGORY_FALLBACK_COLORS.length];
};

// Helper to calculate if transaction is a saving-related transaction
const isSavingTransaction = (transaction: Transaction, accounts: Account[]): boolean => {
  return transaction.items.some(item => {
    const account = accounts.find(a => a.id === item.accountId);
    return !!account?.isSaving;
  });
};

// Wrapper: preserve previous saving-account neutral behavior then defer to currency helper
const isTransactionIncome = (transaction: Transaction, accounts: Account[]): boolean => {
  if (isAccountTransferTransaction(transaction)) return false;
  if (isSavingTransaction(transaction, accounts)) return false;
  return currencyIsTransactionIncome(transaction, accounts);
};

// Helper to get transaction amount converted to USD using account rates
const getTransactionAmount = (transaction: Transaction, accounts: Account[], currencies: Currency[]): number => {
  return convertTransactionToUsd(transaction, accounts, currencies);
};

// Get amount moved into saving accounts for a transaction (debits to saving accounts)
const getSavingAmountForTransaction = (transaction: Transaction, accounts: Account[]): number => {
  return transaction.items.reduce((sum, item) => {
    const account = accounts.find(a => a.id === item.accountId);
    if (account?.isSaving) return sum + (item.debit - item.credit);
    return sum;
  }, 0);
};

const getRootAccount = (accountId: string, accounts: Account[]): Account | undefined => {
  const account = accounts.find((entry) => entry.id === accountId);
  if (!account) return undefined;
  if (!account.parentId) return account;

  return accounts.find((entry) => entry.id === account.parentId) ?? account;
};

export function getTopLevelAssetAccounts(accounts: Account[]): Account[] {
  return accounts.filter(
    (account) => !account.isHidden && !account.parentId && account.accounting === 'asset' && account.type !== 'ledger' && !account.disabled
  );
}

export function getDisabledTopLevelAssetAccounts(accounts: Account[]): Account[] {
  return accounts.filter(
    (account) => !account.isHidden && !account.parentId && account.accounting === 'asset' && account.type !== 'ledger' && !!account.disabled
  );
}

export function getTransactionsForAccount(transactions: Transaction[], accounts: Account[], accountId: string): Transaction[] {
  const rootAccount = getRootAccount(accountId, accounts);
  if (!rootAccount) return transactions;

  const childIds = accounts.filter((account) => account.parentId === rootAccount.id).map((account) => account.id);
  const accountIds = new Set([rootAccount.id, ...childIds]);

  return transactions.filter((transaction) => transaction.items.some((item) => accountIds.has(item.accountId)));
}

export function getAccountSummary(transactions: Transaction[], accounts: Account[], accountId: string) {
  const rootAccount = getRootAccount(accountId, accounts);
  if (!rootAccount) {
    return {
      account: undefined,
      balance: 0,
      income: 0,
      expense: 0,
      savings: 0,
      lent: 0,
      borrowed: 0,
    };
  }

  const children = accounts.filter((account) => account.parentId === rootAccount.id);
  const incomeAccount = children.find((account) => account.accounting === 'income');
  const expenseAccount = children.find((account) => account.accounting === 'expense');
  const savingAccount = children.find((account) => account.isSaving);

  const balance = transactions.reduce((total, transaction) => {
    return total + transaction.items.reduce((sum, item) => {
      if (item.accountId === rootAccount.id) {
        return sum + (item.debit - item.credit);
      }
      return sum;
    }, 0);
  }, 0);

  const income = incomeAccount ? transactions.reduce((total, transaction) => {
    return total + transaction.items.reduce((sum, item) => {
      if (item.accountId === incomeAccount.id) {
        return sum + (item.credit - item.debit);
      }
      return sum;
    }, 0);
  }, 0) : 0;

  const expense = expenseAccount ? transactions.reduce((total, transaction) => {
    return total + transaction.items.reduce((sum, item) => {
      if (item.accountId === expenseAccount.id) {
        return sum + (item.debit - item.credit);
      }
      return sum;
    }, 0);
  }, 0) : 0;

  const savings = savingAccount ? transactions.reduce((total, transaction) => {
    return total + transaction.items.reduce((sum, item) => {
      if (item.accountId === savingAccount.id) {
        return sum + (item.debit - item.credit);
      }
      return sum;
    }, 0);
  }, 0) : 0;

  // Calculate lent and borrowed as net movements related to loan accounts.
  // This nets opening loan transactions and subsequent repayments (which use `relatedLoanId`).
  const lent = transactions.reduce((total, transaction) => {
    const hasLentAccount = transaction.items.some((i) => accounts.find((a) => a.id === i.accountId)?.type === 'lent');
    if (!hasLentAccount) return total;

    return total + transaction.items.reduce((sum, item) => {
      if (item.accountId === rootAccount.id) {
        // For this root account, lending out shows as a credit; repayments show as a debit.
        return sum + (item.credit - item.debit);
      }
      return sum;
    }, 0);
  }, 0);

  const borrowed = transactions.reduce((total, transaction) => {
    const hasBorrowedAccount = transaction.items.some((i) => accounts.find((a) => a.id === i.accountId)?.type === 'borrowed');
    if (!hasBorrowedAccount) return total;

    return total + transaction.items.reduce((sum, item) => {
      if (item.accountId === rootAccount.id) {
        // For this root account, borrowing shows as a debit; repayments show as a credit.
        return sum + (item.debit - item.credit);
      }
      return sum;
    }, 0);
  }, 0);

  return {
    account: rootAccount,
    balance,
    income,
    expense,
    savings,
    lent,
    borrowed,
  };
}

export function getCurrentMonthTransactions(transactions: Transaction[], date = new Date()): Transaction[] {
  const monthKey = getMonthKey(date);
  return transactions.filter((transaction) => getTransactionMonthKey(transaction) === monthKey);
}

export function getMonthlyChartData(transactions: Transaction[], accounts: Account[], currencies: Currency[], monthCount = 6): ChartDataPoint[] {
  const now = new Date();

  return Array.from({ length: monthCount }, (_, index) => {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - (monthCount - index - 1), 1);
    const monthKey = getMonthKey(monthDate);
    const monthlyTransactions = transactions.filter((transaction) => getTransactionMonthKey(transaction) === monthKey);
    
    const income = monthlyTransactions
      .filter((transaction) => isTransactionIncome(transaction, accounts))
      .reduce((total, transaction) => total + getTransactionAmount(transaction, accounts, currencies), 0);

    const expense = monthlyTransactions
      .filter(
        (transaction) =>
          !isTransactionIncome(transaction, accounts) &&
          !isSavingTransaction(transaction, accounts) &&
          !isAccountTransferTransaction(transaction)
      )
      .reduce((total, transaction) => total + getTransactionAmount(transaction, accounts, currencies), 0);

    const savings = monthlyTransactions
      .reduce((total, transaction) => total + Math.max(0, getSavingAmountForTransaction(transaction, accounts)), 0);

    return {
      name: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      income,
      expense,
      savings,
    };
  });
}

interface CategoryDataOptions {
  currency?: string;
}

function getCategoryExpenseAmount(
  transaction: Transaction,
  accounts: Account[],
  currencies: Currency[],
  targetCurrency?: string
): number {
  if (!targetCurrency) {
    return getTransactionAmount(transaction, accounts, currencies);
  }

  const normalizedCurrency = targetCurrency.toUpperCase();
  return transaction.items.reduce((total, item) => {
    const account = accounts.find((a) => a.id === item.accountId);
    if (account?.accounting !== 'expense' || account.currency.toUpperCase() !== normalizedCurrency) {
      return total;
    }

    return total + Math.max(0, item.debit - item.credit);
  }, 0);
}

export function getCategoryData(
  transactions: Transaction[],
  categories: Category[],
  accounts: Account[],
  currencies: Currency[],
  options: CategoryDataOptions = {}
): CategoryData[] {
  const expenseTransactions = transactions.filter(tx => {
    if (tx.relatedLoanId || isAccountTransferTransaction(tx)) return false;
    // exclude income and saving transactions
    const isIncome = tx.items.some(item => item.credit > 0 && accounts.find(a => a.id === item.accountId)?.accounting === 'income');
    if (isIncome) return false;
    if (isSavingTransaction(tx, accounts)) return false;
    return true;
  });

  const transactionsWithAmounts = expenseTransactions
    .map((transaction) => ({
      transaction,
      amount: getCategoryExpenseAmount(transaction, accounts, currencies, options.currency),
    }))
    .filter(({ amount }) => amount > 0);

  const totalExpenses = transactionsWithAmounts.reduce((total, { amount }) => total + amount, 0);

  const categoryTotals = transactionsWithAmounts.reduce<Record<string, number>>((totals, { transaction, amount }) => {
    const categoryId = transaction.categoryId;
    return {
      ...totals,
      [categoryId]: (totals[categoryId] ?? 0) + amount,
    };
  }, {});

  return Object.entries(categoryTotals)
    .map(([categoryId, value]) => {
      const category = categories.find(c => c.id === categoryId);
      const name = category?.name ?? 'Unknown';
      return {
        name,
        value,
        color: category?.color ?? getCategoryFallbackColor(categoryId),
        icon: 'Circle',
        percentage: totalExpenses > 0 ? Math.round((value / totalExpenses) * 100) : 0,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function getLargestExpense(transactions: Transaction[], accounts: Account[], currencies: Currency[]): number {
  return transactions
    .filter(
      (transaction) =>
        !isTransactionIncome(transaction, accounts) &&
        !isSavingTransaction(transaction, accounts) &&
        !isAccountTransferTransaction(transaction)
    )
    .reduce((largest, transaction) => Math.max(largest, getTransactionAmount(transaction, accounts, currencies)), 0);
}

export function getFinancialHealthScore(transactions: Transaction[], accounts: Account[], currencies: Currency[]): HealthScore {
  const currentMonth = getCurrentMonthTransactions(transactions);
  const income = currentMonth
    .filter((transaction) => isTransactionIncome(transaction, accounts))
    .reduce((total, transaction) => total + getTransactionAmount(transaction, accounts, currencies), 0);
  const expenses = currentMonth
    .filter(
      (transaction) =>
        !isTransactionIncome(transaction, accounts) && !isAccountTransferTransaction(transaction)
    )
    .reduce((total, transaction) => total + getTransactionAmount(transaction, accounts, currencies), 0);
  const savingsRate = income > 0 ? Math.max(((income - expenses) / income) * 100, 0) : 0;
  const savings = Math.min(Math.round(savingsRate * 2), 100);
  const spending = income > 0 ? Math.max(100 - Math.round((expenses / income) * 100), 0) : 0;
  const consistency = Math.min(transactions.length * 5, 100);
  const budgeting = transactions.length > 0 ? 60 : 0;

  return {
    overall: Math.round((savings + spending + budgeting + consistency) / 4),
    savings,
    spending,
    budgeting,
    consistency,
  };
}

export function getInsights(transactions: Transaction[], accounts: Account[], categories: Category[], currencies: Currency[]): FinancialInsight[] {
  if (transactions.length === 0) {
    return [
      {
        id: 'start-tracking',
        type: 'suggestion',
        title: 'Start Tracking',
        description: 'Add your first real transaction to unlock insights.',
        icon: 'Lightbulb',
        color: '#fbbf24',
      },
    ];
  }

  const currentMonth = getCurrentMonthTransactions(transactions);
  const income = currentMonth
    .filter((transaction) => isTransactionIncome(transaction, accounts))
    .reduce((total, transaction) => total + getTransactionAmount(transaction, accounts, currencies), 0);
  const expenses = currentMonth
    .filter(
      (transaction) =>
        !isTransactionIncome(transaction, accounts) && !isAccountTransferTransaction(transaction)
    )
    .reduce((total, transaction) => total + getTransactionAmount(transaction, accounts, currencies), 0);
  const topCategory = getCategoryData(currentMonth, categories, accounts, currencies)[0];
  const savingsRate = income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  return [
    {
      id: 'savings-rate',
      type: savingsRate >= 20 ? 'achievement' : 'tip',
      title: 'Savings Rate',
      description: income > 0 ? `You saved ${Math.max(savingsRate, 0)}% of this month's income.` : 'Add income to calculate your savings rate.',
      icon: savingsRate >= 20 ? 'TrendingUp' : 'Target',
      color: savingsRate >= 20 ? '#34d399' : '#60a5fa',
    },
    {
      id: 'top-category',
      type: 'suggestion',
      title: 'Top Category',
      description: topCategory ? `${topCategory.name} is your largest expense category this month.` : 'No expense categories recorded this month.',
      icon: 'PieChart',
      color: '#fbbf24',
    },
  ];
}
