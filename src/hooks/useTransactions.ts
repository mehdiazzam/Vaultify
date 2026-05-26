import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import type { Transaction } from '@/types';
import type { TransactionInput } from '@/services/firestore';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from '@/services/firestore';
import { isAccountTransferTransaction } from '@/utils/transactions';

export function useTransactions(opts?: {
  includeLoanRepayments?: boolean;
  includeGoalTransactions?: boolean;
  excludeTransfers?: boolean;
  loanOnly?: boolean;
  goalOnly?: boolean;
}) {
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const includeLoanRepayments = opts?.includeLoanRepayments ?? true;
  const includeGoalTransactions = opts?.includeGoalTransactions ?? true;
  const excludeTransfers = opts?.excludeTransfers ?? true;
  const loanOnly = opts?.loanOnly ?? false;
  const goalOnly = opts?.goalOnly ?? false;

  return useQuery<Transaction[]>({
    queryKey: [
      'transactions',
      userId,
      includeLoanRepayments ? 'withLoanRepayments' : 'noLoanRepayments',
      includeGoalTransactions ? 'withGoalTransactions' : 'noGoalTransactions',
      excludeTransfers ? 'excludeTransfers' : 'includeTransfers',
      loanOnly ? 'loanOnly' : 'all',
      goalOnly ? 'goalOnly' : 'all',
    ],
    queryFn: async () => {
      const results = await getTransactions(userId, {
        includeLoanRepayments,
        includeGoalTransactions,
      });

      let filtered = results;

      if (excludeTransfers) {
        filtered = filtered.filter((t) => !isAccountTransferTransaction(t));
      }

      if (loanOnly) {
        filtered = filtered.filter((t) => !!t.relatedLoanId);
      }

      if (goalOnly) {
        filtered = filtered.filter((t) => !!t.relatedGoalId);
      }

      // Ensure consistent sort: newest first by date string
      return filtered.sort((a, b) => b.date.localeCompare(a.date));
    },
    enabled: !!userId,
  });
}

export function useAddTransaction() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: TransactionInput) => addTransaction({ ...input, userId }),
    onSuccess: () => qc.invalidateQueries({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'transactions' && query.queryKey[1] === userId }),
  });
}

export function useUpdateTransaction() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) => updateTransaction(id, data),
    onSuccess: () => qc.invalidateQueries({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'transactions' && query.queryKey[1] === userId }),
  });
}

export function useDeleteTransaction() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => qc.invalidateQueries({ predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'transactions' && query.queryKey[1] === userId }),
  });
}

export default useTransactions;
