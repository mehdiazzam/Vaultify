import { useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { BudgetInput, SavingsGoalInput, TransactionInput, AccountInput } from '../services/firestore';
import {
  addBudget as addFirestoreBudget,
  addSavingsGoal as addFirestoreSavingsGoal,
  addTransaction as addFirestoreTransaction,
  addAccount as addFirestoreAccount,
  deleteTransaction as deleteFirestoreTransaction,
  deleteBudget as deleteFirestoreBudget,
  deleteSavingsGoal as deleteFirestoreSavingsGoal,
  disableAccount as disableFirestoreAccount,
  enableAccount as enableFirestoreAccount,
  getFinanceData,
  updateTransaction as updateFirestoreTransaction,
  updateBudget as updateFirestoreBudget,
  updateSavingsGoal as updateFirestoreSavingsGoal,
  updateAccount as updateFirestoreAccount,
} from '../services/firestore';
import { useAuthStore } from '../stores/authStore';
import { useFinanceStore } from '../stores/financeStore';

const financeQueryKey = (userId: string) => ['finance', userId] as const;
const dashboardQueryKey = (userId: string) => ['financeData', userId] as const;

interface UpdateTransactionVariables {
  id: string;
  data: Partial<TransactionInput>;
}

interface UpdateBudgetVariables {
  id: string;
  data: Partial<BudgetInput>;
}

interface UpdateSavingsGoalVariables {
  id: string;
  data: Partial<SavingsGoalInput>;
}

interface UpdateAccountVariables {
  id: string;
  data: Partial<AccountInput>;
}

export function useFinanceData() {
  const user = useAuthStore((state) => state.user);
  const setFinanceData = useFinanceStore((state) => state.setFinanceData);
  const clearFinanceData = useFinanceStore((state) => state.clearFinanceData);
  const queryClient = useQueryClient();
  const userId = user?.uid ?? '';

  const financeQuery = useQuery({
    queryKey: financeQueryKey(userId),
    queryFn: () => getFinanceData(userId),
    enabled: userId.length > 0,
  });

  useEffect(() => {
    if (!userId) {
      clearFinanceData();
      return;
    }

    if (financeQuery.data) {
      setFinanceData(financeQuery.data);
      // Perform a background refresh to ensure we have the latest finance data
      (async () => {
        try {
          const fresh = await getFinanceData(userId);
          setFinanceData(fresh);
        } catch (e) {
          // Non-fatal: leave existing data in place
           
          console.warn('Failed to refresh finance data', e);
        }
      })();
    }
  }, [clearFinanceData, financeQuery.data, setFinanceData, userId]);

  const invalidateFinanceData = async () => {
    await queryClient.invalidateQueries({ queryKey: financeQueryKey(userId) });
    await queryClient.invalidateQueries({ queryKey: dashboardQueryKey(userId) });
  };

  const createTransaction = useMutation({
    mutationFn: (data: Omit<TransactionInput, 'userId'>) => {
      if (!userId) {
        throw new Error('Sign in to save transactions.');
      }

      // If caller provided linkage (loan or goal), route through createLinkedTransaction to enforce contract
      // `createLinkedTransaction` is exported from services/firestore via the transactions module
      const payload = { ...data, userId } as any;
      if (payload.relatedLoanId || payload.relatedGoalId) {
        // lazy import to keep top-level imports minimal
        return import('../services/firestore').then((svc) => svc.createLinkedTransaction(payload));
      }

      return addFirestoreTransaction(payload);
    },
    onSuccess: invalidateFinanceData,
  });

  const createBudget = useMutation({
    mutationFn: (data: Omit<BudgetInput, 'userId'>) => {
      if (!userId) {
        throw new Error('Sign in to save budgets.');
      }

      return addFirestoreBudget({ ...data, userId });
    },
    onSuccess: invalidateFinanceData,
  });

  const createSavingsGoal = useMutation({
    mutationFn: (data: Omit<SavingsGoalInput, 'userId'>) => {
      if (!userId) {
        throw new Error('Sign in to save savings goals.');
      }

      return addFirestoreSavingsGoal({ ...data, userId });
    },
    onSuccess: invalidateFinanceData,
  });

  const createAccount = useMutation({
    mutationFn: (data: Omit<AccountInput, 'userId'>) => {
      if (!userId) {
        throw new Error('Sign in to save accounts.');
      }

      return addFirestoreAccount({ ...data, userId });
    },
    onSuccess: invalidateFinanceData,
  });

  const editTransaction = useMutation({
    mutationFn: ({ id, data }: UpdateTransactionVariables) => updateFirestoreTransaction(id, data),
    onSuccess: invalidateFinanceData,
  });

  const editBudget = useMutation({
    mutationFn: ({ id, data }: UpdateBudgetVariables) => updateFirestoreBudget(id, data),
    onSuccess: invalidateFinanceData,
  });

  const editSavingsGoal = useMutation({
    mutationFn: ({ id, data }: UpdateSavingsGoalVariables) => updateFirestoreSavingsGoal(id, data),
    onSuccess: invalidateFinanceData,
  });

  const editAccount = useMutation({
    mutationFn: ({ id, data }: UpdateAccountVariables) => updateFirestoreAccount(id, data),
    onSuccess: invalidateFinanceData,
  });

  const removeTransaction = useMutation({
    mutationFn: (id: string) => deleteFirestoreTransaction(id),
    onSuccess: invalidateFinanceData,
  });

  const removeBudget = useMutation({
    mutationFn: (id: string) => deleteFirestoreBudget(id),
    onSuccess: invalidateFinanceData,
  });

  const removeSavingsGoal = useMutation({
    mutationFn: (id: string) => deleteFirestoreSavingsGoal(id),
    onSuccess: invalidateFinanceData,
  });

  const disableAccount = useMutation({
    mutationFn: (id: string) => disableFirestoreAccount(id),
    onSuccess: invalidateFinanceData,
  });

  const enableAccount = useMutation({
    mutationFn: (id: string) => enableFirestoreAccount(id),
    onSuccess: invalidateFinanceData,
  });

  return {
    ...financeQuery,
    createTransaction,
    createBudget,
    createSavingsGoal,
    createAccount,
    editTransaction,
    editBudget,
    editSavingsGoal,
    editAccount,
    removeTransaction,
    removeBudget,
    removeSavingsGoal,
    disableAccount,
    enableAccount,
  };
}
