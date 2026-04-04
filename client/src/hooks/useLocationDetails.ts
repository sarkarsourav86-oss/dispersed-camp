import { useQuery } from '@tanstack/react-query';
import { reverseGeocode } from '../services/nominatim';

export function useLocationDetails(lat: number, lng: number) {
  return useQuery({
    queryKey: ['locationDetails', lat.toFixed(2), lng.toFixed(2)],
    queryFn: ({ signal }) => reverseGeocode(lat, lng, signal),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
  });
}
