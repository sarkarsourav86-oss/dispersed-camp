import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { RoutePoiResult } from '../types';
import { fetchRoutePois } from '../services/api';

export function useRoutePois(routeGeometry: number[][] | null | undefined) {
  // Create a stable cache key from start/end/length of the geometry
  const cacheKey = useMemo(() => {
    if (!routeGeometry || routeGeometry.length < 2) return null;
    const first = routeGeometry[0];
    const last = routeGeometry[routeGeometry.length - 1];
    return `${first[0].toFixed(2)},${first[1].toFixed(2)}-${last[0].toFixed(2)},${last[1].toFixed(2)}-${routeGeometry.length}`;
  }, [routeGeometry]);

  return useQuery<RoutePoiResult>({
    queryKey: ['route-pois', cacheKey],
    queryFn: ({ signal }) => fetchRoutePois(routeGeometry!, signal),
    enabled: !!routeGeometry && routeGeometry.length >= 2,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
}
