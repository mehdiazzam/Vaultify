import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import type { Loan, LoanFormValues, RepaymentFormValues } from '@/types';
import { createLoan, fetchLoans, recordRepayment } from '@/services/firestore';

/**
 * Fetch all loans for the current user.
 */
export function useLoans() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');

  return useQuery({
    queryKey: ['loans', userId],
    queryFn: () => fetchLoans(userId),
    enabled: !!userId,
  });
}

/**
 * Create a new loan.
 */
export function useCreateLoan() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (values: LoanFormValues) => createLoan(userId, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans', userId] });
      qc.invalidateQueries({ predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'transactions' && q.queryKey[1] === userId });
    },
  });
}

/**
 * Record a repayment for a loan.
 */
export function useRecordRepayment() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ loan, values }: { loan: Loan; values: RepaymentFormValues }) =>
      recordRepayment(userId, loan, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans', userId] });
      qc.invalidateQueries({ queryKey: ['transactions', userId] });
    },
  });
}
