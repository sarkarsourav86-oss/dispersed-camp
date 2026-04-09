import { useQuery } from '@tanstack/react-query';
import type { MultiStopRouteResult, CampSpot } from '../types';
import { fetchMultiStopRoute } from '../services/api';
import { useLocationStore } from '../store';

export function useMultiStopRoute(spots: CampSpot[]) {
  const lat = useLocationStore((s) => s.lat);
  const lng = useLocationStore((s) => s.lng);

  const waypoints = lat != null && lng != null
    ? [{ lat, lng }, ...spots.map((s) => ({ lat: s.lat, lng: s.lng }))]
    : spots.map((s) => ({ lat: s.lat, lng: s.lng }));

  const spotIds = spots.map((s) => s.id);

  return useQuery<MultiStopRouteResult>({
    queryKey: ['multi-route', lat?.toFixed(3), lng?.toFixed(3), ...spotIds],
    queryFn: ({ signal }) => fetchMultiStopRoute(waypoints, signal),
    enabled: waypoints.length >= 2,
    staleTime: 6 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
  });
}
