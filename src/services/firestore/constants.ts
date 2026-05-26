import { CATEGORIES as DEFAULT_CATEGORY_GROUPS } from '../../constants';
import type { Category, Currency } from '../../types';
import { ACCOUNT_TRANSFER_CATEGORY_ID } from '../../utils/transactions';

export const TRANSACTIONS = 'transactions';
export const BUDGETS = 'budgets';
export const SAVINGS_GOALS = 'savingsGoals';
export const SUBSCRIPTIONS = 'subscriptions';
export const ACCOUNTS = 'accounts';
export const CATEGORIES = 'categories';
export const CURRENCIES = 'currencies';
export const USERS = 'users';

export const DEFAULT_CATEGORIES: Category[] = [
  ...DEFAULT_CATEGORY_GROUPS.income.map((category) => ({ ...category, type: 'income' as const })),
  ...DEFAULT_CATEGORY_GROUPS.expense.map((category) => ({ ...category, type: 'expense' as const })),
].map((category) => ({
  id: category.name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, ''),
  name: category.name,
  type: category.type,
  color: category.color,
  icon: category.icon,
}));

export const SYSTEM_CATEGORIES: Category[] = [
  {
    id: ACCOUNT_TRANSFER_CATEGORY_ID,
    name: 'Account transfer',
    type: 'expense',
    color: '#38bdf8',
    icon: 'ArrowLeftRight',
  },
];

export const ALL_DEFAULT_CATEGORIES: Category[] = [...DEFAULT_CATEGORIES, ...SYSTEM_CATEGORIES];

export const DEFAULT_CURRENCIES: Currency[] = [
  { id: 'USD', iso: 'USD', name: 'US Dollar', rateToUsd: 1, icon: '$' },
  { id: 'EUR', iso: 'EUR', name: 'Euro', rateToUsd: 1.08, icon: '€' },
  { id: 'GBP', iso: 'GBP', name: 'British Pound', rateToUsd: 1.27, icon: '£' },
  { id: 'SAR', iso: 'SAR', name: 'Saudi Riyal', rateToUsd: 0.27, icon: '﷼' },
  { id: 'AED', iso: 'AED', name: 'UAE Dirham', rateToUsd: 0.27, icon: 'د.إ' },
  { id: 'TRY', iso: 'TRY', name: 'Turkish Lira', rateToUsd: 0.031, icon: '₺' },
  { id: 'JPY', iso: 'JPY', name: 'Japanese Yen', rateToUsd: 0.0067, icon: '¥' },
  { id: 'CAD', iso: 'CAD', name: 'Canadian Dollar', rateToUsd: 0.74, icon: 'CA$' },
  // Syrian Pound (SYP) — default rate is approximate; update from live rates as needed
  { id: 'SYP', iso: 'SYP', name: 'Syrian Pound', rateToUsd: 0.0004, icon: 'ل.س' },
];
