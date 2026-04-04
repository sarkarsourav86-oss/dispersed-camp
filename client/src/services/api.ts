import axios from 'axios';
import type { RouteResult, FireRestrictionResult } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

export async function fetchLandBoundaries(west: number, south: number, east: number, north: number, signal?: AbortSignal) {
  const { data } = await api.get('/land', { params: { west, south, east, north }, signal });
  return data as { blm: object | null; usfs: object | null };
}

export async function fetchRoute(fromLat: number, fromLng: number, toLat: number, toLng: number, signal?: AbortSignal) {
  const { data } = await api.get('/routing', { params: { fromLat, fromLng, toLat, toLng }, signal });
  return data as RouteResult;
}

export async function fetchFireRestrictions(lat: number, lng: number, signal?: AbortSignal) {
  const { data } = await api.get('/fire-restrictions', { params: { lat, lng }, signal });
  return data as FireRestrictionResult;
}

export interface TripPlanRequest {
  name: string;
  lat: number;
  lng: number;
  category?: string;
  description?: string;
  weatherSummary?: string;
  fireRestrictions?: string;
  driveTime?: string;
  distanceMiles?: number;
  vanType?: string;
  lengthFt?: number;
  clearance?: string;
  drivetrain?: string;
  waterTankGal?: number;
  fuelTankGal?: number;
  mpg?: number;
  peopleCount?: number;
  hasPet?: boolean;
  hasSolar?: boolean;
  hasGenerator?: boolean;
  needsInternet?: boolean;
}

export interface TripReadiness {
  goodIf: string[];
  badIf: string[];
}

export interface TripPlanResult {
  readiness: TripReadiness;
  stopPlan: string;
  waterFuelMath: string;
  rigAccess: string;
  arrivalStrategy: string;
  campConditions: string;
  resupplyWaste: string;
  connectivity: string;
  rulesRisks: string;
  backupPlan: string;
}

export async function fetchTripPlan(request: TripPlanRequest, signal?: AbortSignal) {
  const { data } = await api.post<TripPlanResult>('/trip-plan', request, { signal });
  return data;
}
