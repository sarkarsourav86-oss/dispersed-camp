import axios from 'axios';
import type { RouteResult, FireRestrictionResult } from '../types';

const api = axios.create({ baseURL: '/api' });

export async function fetchLandBoundaries(west: number, south: number, east: number, north: number) {
  const { data } = await api.get('/land', { params: { west, south, east, north } });
  return data as { blm: object | null; usfs: object | null };
}

export async function fetchRoute(fromLat: number, fromLng: number, toLat: number, toLng: number) {
  const { data } = await api.get('/routing', { params: { fromLat, fromLng, toLat, toLng } });
  return data as RouteResult;
}

export async function fetchFireRestrictions(lat: number, lng: number) {
  const { data } = await api.get('/fire-restrictions', { params: { lat, lng } });
  return data as FireRestrictionResult;
}
