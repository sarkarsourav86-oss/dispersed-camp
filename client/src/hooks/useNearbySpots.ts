import { useQuery } from '@tanstack/react-query';
import { useMapStore, useSettingsStore } from '../store';
import { fetchIOverlanderSpots } from '../services/iOverlander';
import { haversineKm } from '../utils/geo';
import type { CampSpot } from '../types';

export function useNearbySpots() {
  const mapBbox = useMapStore((s) => s.mapBbox);
  const showIOverlander = useSettingsStore((s) => s.showIOverlander);
  const iOverlanderCategories = useSettingsStore((s) => s.iOverlanderCategories);

  // Snap bbox outward to 0.5-degree grid so small pans hit the cache
  // Floor south/west, ceil north/east to ensure snapped bbox contains the real viewport
  const grid = 0.5;
  const snapped = mapBbox
    ? {
        west: Math.floor(mapBbox.west / grid) * grid,
        south: Math.floor(mapBbox.south / grid) * grid,
        east: Math.ceil(mapBbox.east / grid) * grid,
        north: Math.ceil(mapBbox.north / grid) * grid,
      }
    : null;

  // Serialize enabled categories for query key stability
  const enabledCatsKey = showIOverlander
    ? Object.entries(iOverlanderCategories)
        .filter(([, v]) => v)
        .map(([k]) => k)
        .join(',')
    : '';

  return useQuery<CampSpot[]>({
    queryKey: ['spots', snapped?.west, snapped?.south, snapped?.east, snapped?.north, enabledCatsKey],
    queryFn: async ({ signal }) => {
      if (!snapped || !showIOverlander) return [];

      const centerLat = (snapped.south + snapped.north) / 2;
      const centerLng = (snapped.west + snapped.east) / 2;

      const spots = await fetchIOverlanderSpots(snapped, signal);

      return spots
        .filter((s) => s.iOverlanderCategory && iOverlanderCategories[s.iOverlanderCategory])
        .sort((a, b) =>
          haversineKm(centerLat, centerLng, a.lat, a.lng) -
          haversineKm(centerLat, centerLng, b.lat, b.lng)
        );
    },
    enabled: !!snapped,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
    placeholderData: [],
  });
}
