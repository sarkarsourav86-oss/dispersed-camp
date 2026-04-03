import { useQuery } from '@tanstack/react-query';
import { geocodeSearch } from '../services/nominatim';

export function useGeocode(query: string) {
  return useQuery({
    queryKey: ['geocode', query],
    queryFn: () => geocodeSearch(query),
    enabled: query.trim().length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    placeholderData: [],
  });
}
