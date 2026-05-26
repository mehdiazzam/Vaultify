import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';
import { getFinanceData } from '@/services/firestore';
import type { FinanceData } from '@/types';

export function useDashboard() {
  const userId = useAuthStore((s) => s.user?.uid ?? '');

  return useQuery<FinanceData>({
    queryKey: ['financeData', userId],
    queryFn: () => getFinanceData(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

export default useDashboard;
