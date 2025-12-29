import { useQuery } from '@tanstack/react-query';
import type { DashboardData } from '@/types';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard');
      return res.json() as Promise<DashboardData>;
    },
    refetchInterval: 60000, // Refresh every minute
  });
}
