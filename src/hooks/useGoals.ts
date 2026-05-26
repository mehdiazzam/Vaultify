import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import type { SavingsGoal } from '@/types';
import { getSavingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from '@/services/firestore';
import * as firestore from '@/services/firestore';

export function useGoals() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');

  return useQuery<SavingsGoal[]>({
    queryKey: ['savingsGoals', userId],
    queryFn: () => getSavingsGoals(userId),
    enabled: !!userId,
  });
}

export function useAddGoal() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<SavingsGoal, 'id'>) => addSavingsGoal({ ...input, userId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savingsGoals', userId] }),
  });
}

export function useUpdateGoal() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SavingsGoal> }) => updateSavingsGoal(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savingsGoals', userId] }),
  });
}

export function useDeleteGoal() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteSavingsGoal(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savingsGoals', userId] }),
  });
}

export function useDeleteGoalWithTransactions() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!userId) throw new Error('Not authenticated');
      return firestore.deleteGoalAndTransactions(userId, id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savingsGoals', userId] }),
  });
}

export default useGoals;
