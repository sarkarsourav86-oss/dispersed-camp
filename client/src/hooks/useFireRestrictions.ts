import { useQuery } from '@tanstack/react-query';
import { fetchFireRestrictions } from '../services/api';
import type { FireRestrictionResult } from '../types';

export function useFireRestrictions(lat: number | null, lng: number | null) {
  return useQuery<FireRestrictionResult>({
    queryKey: ['fire', lat?.toFixed(1), lng?.toFixed(1)],
    queryFn: () => fetchFireRestrictions(lat!, lng!),
    enabled: !!lat && !!lng,
    staleTime: 4 * 60 * 60 * 1000,   // 4 hours
    gcTime: 8 * 60 * 60 * 1000,
    retry: 1,
  });
}
