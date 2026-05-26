import { create } from 'zustand';
import type { Transaction, Budget, SavingsGoal, Subscription, Account, Category, Currency } from '../types';

interface FinanceState {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  subscriptions: Subscription[];
  accounts: Account[];
  categories: Category[];
  currencies: Currency[];
  searchQuery: string;
  selectedCategoryId: string;
  setTransactions: (t: Transaction[]) => void;
  setFinanceData: (
    data: Pick<FinanceState, 'transactions' | 'budgets' | 'savingsGoals' | 'subscriptions' | 'accounts' | 'categories' | 'currencies'>
  ) => void;
  clearFinanceData: () => void;
  addTransaction: (t: Transaction) => void;
  updateTransaction: (id: string, data: Partial<Transaction>) => void;
  removeTransaction: (id: string) => void;
  setSearchQuery: (q: string) => void;
  setSelectedCategoryId: (c: string) => void;
  filteredTransactions: () => Transaction[];
  getTotalExpenses: () => number;
  getTotalIncome: () => number;
  getTotalBalance: () => number;
  getCategoryName: (categoryId: string) => string;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  transactions: [],
  budgets: [],
  savingsGoals: [],
  subscriptions: [],
  accounts: [],
  categories: [],
  currencies: [],
  searchQuery: '',
  selectedCategoryId: 'all',
  setTransactions: (transactions) => set({ transactions }),
  setFinanceData: ({ transactions, budgets, savingsGoals, subscriptions, accounts, categories, currencies }) =>
    set({ transactions, budgets, savingsGoals, subscriptions, accounts, categories, currencies }),
  clearFinanceData: () =>
    set({
      transactions: [],
      budgets: [],
      savingsGoals: [],
      subscriptions: [],
      accounts: [],
      categories: [],
      currencies: [],
      searchQuery: '',
      selectedCategoryId: 'all',
    }),
  addTransaction: (t) => set((s) => ({ transactions: [t, ...s.transactions] })),
  updateTransaction: (id, data) =>
    set((s) => ({
      transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  removeTransaction: (id) =>
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategoryId: (selectedCategoryId) => set({ selectedCategoryId }),
  filteredTransactions: () => {
    const { transactions, searchQuery, selectedCategoryId } = get();
    return transactions.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategoryId === 'all' || t.categoryId === selectedCategoryId;
      return matchesSearch && matchesCategory;
    });
  },
  getTotalExpenses: () => {
    const { accounts, transactions, currencies } = get();
    const expenseAccounts = accounts
      .filter((a) => a.accounting === 'expense' && !a.isHidden)
      .map((a) => a.id);
    return transactions.reduce((sum, t) => {
      const expenseItems = t.items.filter((item) => expenseAccounts.includes(item.accountId));
      return (
        sum +
        expenseItems.reduce((itemSum, item) => {
          const acc = accounts.find((a) => a.id === item.accountId);
          const currency = currencies.find((c) => c.iso === acc?.currency);
          const rate = currency?.rateToUsd ?? 1;
          return itemSum + item.debit * rate;
        }, 0)
      );
    }, 0);
  },
  getTotalIncome: () => {
    const { accounts, transactions, currencies } = get();
    const incomeAccounts = accounts
      .filter((a) => a.accounting === 'income' && !a.isHidden)
      .map((a) => a.id);
    return transactions.reduce((sum, t) => {
      const incomeItems = t.items.filter((item) => incomeAccounts.includes(item.accountId));
      return (
        sum +
        incomeItems.reduce((itemSum, item) => {
          const acc = accounts.find((a) => a.id === item.accountId);
          const currency = currencies.find((c) => c.iso === acc?.currency);
          const rate = currency?.rateToUsd ?? 1;
          return itemSum + item.credit * rate;
        }, 0)
      );
    }, 0);
  },
  getTotalBalance: () => {
    const { accounts, transactions, currencies } = get();
    const assetAccounts = accounts
      .filter((a) => a.accounting === 'asset' && a.type !== 'ledger' && !a.isHidden)
      .map((a) => a.id);
    return transactions.reduce((sum, t) => {
      const assetItems = t.items.filter((item) => assetAccounts.includes(item.accountId));
      return (
        sum +
        assetItems.reduce((itemSum, item) => {
          const acc = accounts.find((a) => a.id === item.accountId);
          const currency = currencies.find((c) => c.iso === acc?.currency);
          const rate = currency?.rateToUsd ?? 1;
          return itemSum + (item.debit - item.credit) * rate;
        }, 0)
      );
    }, 0);
  },
  getCategoryName: (categoryId: string) => {
    const { categories } = get();
    return categories.find((c) => c.id === categoryId)?.name ?? 'Unknown';
  },
}));
