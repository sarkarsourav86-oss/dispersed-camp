import { useQuery } from '@tanstack/react-query';
import { fetchLandBoundaries } from '../services/api';

interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

const GRID = 0.5;

export function useLandOverlays(bbox: BoundingBox | null) {
  // Snap bbox outward to 0.5-degree grid so nearby pans hit the cache
  const snapped = bbox
    ? {
        west: Math.floor(bbox.west / GRID) * GRID,
        south: Math.floor(bbox.south / GRID) * GRID,
        east: Math.ceil(bbox.east / GRID) * GRID,
        north: Math.ceil(bbox.north / GRID) * GRID,
      }
    : null;

  return useQuery({
    queryKey: ['land', snapped?.west, snapped?.south, snapped?.east, snapped?.north],
    queryFn: ({ signal }) => fetchLandBoundaries(snapped!.west, snapped!.south, snapped!.east, snapped!.north, signal),
    enabled: !!snapped,
    staleTime: 24 * 60 * 60 * 1000,   // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000,  // 7 days
    retry: 1,
  });
}
