import type { GeocodingResult, LocationDetails } from '../types';

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const NOMINATIM_URL = `${NOMINATIM_BASE}/search`;

// Nominatim enforces 1 req/sec. Serial queue ensures requests never overlap.
const REQUEST_INTERVAL_MS = 1100;
let queue: Promise<void> = Promise.resolve();

function throttledFetch(url: string, init?: RequestInit): Promise<Response> {
  let resolve: (res: Response) => void;
  let reject: (err: unknown) => void;
  const result = new Promise<Response>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  queue = queue.then(async () => {
    // Skip if already aborted before our turn in the queue
    if (init?.signal?.aborted) {
      reject(init.signal.reason ?? new DOMException('Aborted', 'AbortError'));
      return;
    }
    try {
      const res = await fetch(url, init);
      resolve(res);
    } catch (err) {
      reject(err);
    }
    await new Promise((r) => setTimeout(r, REQUEST_INTERVAL_MS));
  });

  return result;
}

function parseLatLng(query: string): { lat: number; lng: number } | null {
  const match = query.match(/^\s*(-?\d+\.?\d*)\s*[,\s]\s*(-?\d+\.?\d*)\s*$/);
  if (!match) return null;
  const lat = parseFloat(match[1]);
  const lng = parseFloat(match[2]);
  if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) return { lat, lng };
  return null;
}

function isZipCode(query: string): boolean {
  return /^\s*\d{5}\s*$/.test(query);
}

export async function geocodeSearch(query: string, signal?: AbortSignal): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const coords = parseLatLng(trimmed);
  if (coords) {
    return [{
      placeId: `coords-${coords.lat}-${coords.lng}`,
      displayName: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
      lat: coords.lat,
      lng: coords.lng,
    }];
  }

  const params = new URLSearchParams({
    q: trimmed,
    format: 'json',
    limit: '5',
    addressdetails: '0',
  });

  if (isZipCode(trimmed)) {
    params.set('countrycodes', 'us');
    params.set('q', `${trimmed}, USA`);
  }

  const response = await throttledFetch(`${NOMINATIM_URL}?${params}`, {
    headers: { 'User-Agent': 'DispersedCamp/1.0' },
    signal,
  });

  if (!response.ok) throw new Error(`Nominatim error: ${response.status}`);

  const data: Array<{ place_id: number; display_name: string; lat: string; lon: string }> =
    await response.json();

  return data.map((item) => ({
    placeId: String(item.place_id),
    displayName: item.display_name,
    lat: parseFloat(item.lat),
    lng: parseFloat(item.lon),
  }));
}

interface NominatimReverseResponse {
  address?: {
    city?: string;
    town?: string;
    village?: string;
    hamlet?: string;
    state?: string;
    county?: string;
  };
}

export async function reverseGeocode(lat: number, lng: number, signal?: AbortSignal): Promise<LocationDetails> {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lng),
    format: 'json',
    addressdetails: '1',
    zoom: '10',
  });

  const response = await throttledFetch(`${NOMINATIM_BASE}/reverse?${params}`, {
    headers: { 'User-Agent': 'DispersedCamp/1.0' },
    signal,
  });

  if (!response.ok) throw new Error(`Nominatim reverse error: ${response.status}`);

  const data: NominatimReverseResponse = await response.json();
  const addr = data.address;

  return {
    city: addr?.city ?? addr?.town ?? addr?.village ?? addr?.hamlet ?? null,
    state: addr?.state ?? null,
    county: addr?.county ?? null,
  };
}
