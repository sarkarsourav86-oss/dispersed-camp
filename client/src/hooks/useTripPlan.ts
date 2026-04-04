import { useMutation } from '@tanstack/react-query';
import { fetchTripPlan } from '../services/api';
import type { TripPlanRequest } from '../services/api';

export function useTripPlan() {
  return useMutation({
    mutationFn: (request: TripPlanRequest) => fetchTripPlan(request),
  });
}
