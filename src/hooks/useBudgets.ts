import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import type { Budget } from '@/types';
import { getBudgets, addBudget, updateBudget, deleteBudget } from '@/services/firestore';

export function useBudgets() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');

  return useQuery<Budget[]>({
    queryKey: ['budgets', userId],
    queryFn: () => getBudgets(userId),
    enabled: !!userId,
  });
}

export function useAddBudget() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: Omit<Budget, 'id'>) => addBudget({ ...input, userId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets', userId] }),
  });
}

export function useUpdateBudget() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Budget> }) => updateBudget(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets', userId] }),
  });
}

export function useDeleteBudget() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['budgets', userId] }),
  });
}

export default useBudgets;
