import { useQuery } from '@tanstack/react-query';
import { fetchLandBoundaries } from '../services/api';
import { snapToGrid } from '../utils/geo';

interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export function useLandOverlays(bbox: BoundingBox | null) {
  // Snap to 0.5-degree grid so nearby pans hit the cache
  const snapped = bbox
    ? {
        west: snapToGrid(bbox.west, 0.5),
        south: snapToGrid(bbox.south, 0.5),
        east: snapToGrid(bbox.east, 0.5),
        north: snapToGrid(bbox.north, 0.5),
      }
    : null;

  return useQuery({
    queryKey: ['land', snapped?.west, snapped?.south, snapped?.east, snapped?.north],
    queryFn: () => fetchLandBoundaries(snapped!.west, snapped!.south, snapped!.east, snapped!.north),
    enabled: !!snapped,
    staleTime: 24 * 60 * 60 * 1000,   // 24 hours
    gcTime: 7 * 24 * 60 * 60 * 1000,  // 7 days
    retry: 1,
  });
}
