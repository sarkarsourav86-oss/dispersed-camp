import { useQuery } from '@tanstack/react-query';
import type { RouteResult } from '../types';
import { fetchRoute } from '../services/api';
import { useLocationStore } from '../store';

export function useRouting(toLat: number | null, toLng: number | null) {
  const fromLat = useLocationStore((s) => s.lat);
  const fromLng = useLocationStore((s) => s.lng);

  return useQuery<RouteResult>({
    queryKey: ['route', fromLat?.toFixed(3), fromLng?.toFixed(3), toLat?.toFixed(3), toLng?.toFixed(3)],
    queryFn: ({ signal }) => fetchRoute(fromLat!, fromLng!, toLat!, toLng!, signal),
    enabled: !!fromLat && !!fromLng && !!toLat && !!toLng,
    staleTime: 6 * 60 * 60 * 1000,   // 6 hours
    gcTime: 24 * 60 * 60 * 1000,     // 24 hours
    retry: 1,
  });
}
