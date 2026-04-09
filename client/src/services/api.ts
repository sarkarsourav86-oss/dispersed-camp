import axios from 'axios';
import type { RouteResult, FireRestrictionResult, MultiStopRouteResult, ChatMessage, TripChatResponse, RoutePoiResult } from '../types';

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

export async function fetchMultiStopRoute(
  waypoints: { lat: number; lng: number }[],
  signal?: AbortSignal
) {
  const { data } = await api.post<MultiStopRouteResult>(
    '/routing/multi',
    { waypoints },
    { signal }
  );
  return data;
}

export interface TripChatRequest {
  messages: ChatMessage[];
  spot: {
    name: string;
    lat: number;
    lng: number;
    category?: string;
    description?: string;
  };
  startLocation?: {
    lat: number;
    lng: number;
    city: string | null;
    state: string | null;
  } | null;
  routePoiContext?: string | null;
  vanProfile?: {
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
  } | null;
  routeInfo?: {
    distanceMiles: number;
    durationSeconds: number;
    durationFormatted: string;
  } | null;
}

export async function fetchTripChat(request: TripChatRequest, signal?: AbortSignal) {
  const { data } = await api.post<TripChatResponse>('/trip-chat', request, { signal });
  return data;
}

export async function fetchRoutePois(routeGeometry: number[][], signal?: AbortSignal) {
  // Downsample geometry to ~500 points max to reduce payload size
  // The backend will further sample for POI search
  let sampled = routeGeometry;
  if (routeGeometry.length > 500) {
    const step = Math.ceil(routeGeometry.length / 500);
    sampled = routeGeometry.filter((_, i) => i % step === 0 || i === routeGeometry.length - 1);
  }

  const { data } = await api.post<RoutePoiResult>(
    '/routing/pois',
    { routeGeometry: sampled },
    { signal }
  );
  return data;
}

export async function fetchRouteOptimization(
  startLat: number,
  startLng: number,
  stops: { lat: number; lng: number; id: string }[],
  signal?: AbortSignal
) {
  const { data } = await api.post<{ orderedStopIds: string[] }>(
    '/routing/optimize',
    { startLat, startLng, stops },
    { signal }
  );
  return data.orderedStopIds;
}
