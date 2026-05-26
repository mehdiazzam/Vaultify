import type { FinanceData, Subscription } from '../../types';
import { getTransactions } from './transactions';
import { getBudgets } from './budgets';
import { getSavingsGoals } from './savings';
import { getCategories, getCurrencies } from './categories';
import { getAccounts } from './accounts';
import { getUserCollection } from './helpers';
import { SUBSCRIPTIONS } from './constants';

export const getFinanceData = async (userId: string): Promise<FinanceData> => {
  const [transactions, budgets, savingsGoals, subscriptions, accounts, categories, currencies] = await Promise.all([
    getTransactions(userId),
    getBudgets(userId),
    getSavingsGoals(userId),
    getUserCollection<Subscription>(SUBSCRIPTIONS, userId),
    getAccounts(userId, true),
    getCategories(),
    getCurrencies(),
  ]);

  return {
    transactions,
    budgets,
    savingsGoals,
    subscriptions,
    accounts,
    categories,
    currencies,
  };
};
