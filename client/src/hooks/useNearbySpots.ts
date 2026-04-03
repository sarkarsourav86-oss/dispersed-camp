import { useQuery } from '@tanstack/react-query';
import { useLocationStore, useSettingsStore } from '../store';
import { fetchNearbyCampSpots } from '../services/osmOverpass';
import { haversineKm } from '../utils/geo';
import type { CampSpot } from '../types';

export function useNearbySpots() {
  const lat = useLocationStore((s) => s.lat);
  const lng = useLocationStore((s) => s.lng);
  const radiusKm = useSettingsStore((s) => s.radiusKm);

  return useQuery<CampSpot[]>({
    queryKey: ['spots', lat?.toFixed(2), lng?.toFixed(2), radiusKm],
    queryFn: async () => {
      if (!lat || !lng) return [];
      const spots = await fetchNearbyCampSpots(lat, lng, radiusKm * 1000);
      return spots.sort((a, b) =>
        haversineKm(lat, lng, a.lat, a.lng) - haversineKm(lat, lng, b.lat, b.lng)
      );
    },
    enabled: !!lat && !!lng,
    staleTime: 5 * 60 * 1000,      // 5 min
    gcTime: 30 * 60 * 1000,        // 30 min
    retry: 2,
    placeholderData: [],
  });
}
