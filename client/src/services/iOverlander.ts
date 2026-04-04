import type { CampSpot, IOverlanderCategory } from '../types';

interface RawPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category: string;
  description?: string;
  dateVerified?: string;
  tags?: Record<string, string>;
}

interface BBox {
  south: number;
  west: number;
  north: number;
  east: number;
}

// Module-level caches (static data, never invalidated)
let manifestPromise: Promise<Set<string>> | null = null;
const cellCache = new Map<string, RawPlace[]>();

function gridCellsForBbox(bbox: BBox): string[] {
  const keys: string[] = [];
  const latSpan = bbox.north - bbox.south;
  const lngSpan = bbox.east - bbox.west;

  // Skip if viewport is too large (zoomed out too far)
  if (latSpan > 10 || lngSpan > 10) return [];

  const minLat = Math.floor(bbox.south);
  const maxLat = Math.floor(bbox.north);
  const minLng = Math.floor(bbox.west);
  const maxLng = Math.floor(bbox.east);

  for (let lat = minLat; lat <= maxLat; lat++) {
    for (let lng = minLng; lng <= maxLng; lng++) {
      keys.push(`${lat}_${lng}`);
    }
  }
  return keys;
}

async function ensureManifest(): Promise<Set<string>> {
  if (!manifestPromise) {
    manifestPromise = fetch('/data/ioverlander/manifest.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
        return res.json() as Promise<string[]>;
      })
      .then((keys) => new Set(keys))
      .catch(() => new Set<string>());
  }
  return manifestPromise;
}

async function fetchCell(key: string, signal?: AbortSignal): Promise<RawPlace[]> {
  const cached = cellCache.get(key);
  if (cached) return cached;

  const res = await fetch(`/data/ioverlander/${key}.json`, { signal });
  if (!res.ok) return [];

  const places = (await res.json()) as RawPlace[];
  cellCache.set(key, places);
  return places;
}

export async function fetchIOverlanderSpots(
  bbox: BBox,
  signal?: AbortSignal
): Promise<CampSpot[]> {
  const manifest = await ensureManifest();
  const neededCells = gridCellsForBbox(bbox).filter((k) => manifest.has(k));

  if (neededCells.length === 0) return [];

  const cellResults = await Promise.all(
    neededCells.map((k) => fetchCell(k, signal))
  );

  const spots: CampSpot[] = [];

  for (const places of cellResults) {
    for (const p of places) {
      // Filter to actual bbox bounds
      if (p.lat < bbox.south || p.lat > bbox.north) continue;
      if (p.lng < bbox.west || p.lng > bbox.east) continue;

      spots.push({
        id: p.id,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        landType: 'unknown',
        source: 'ioverlander',
        description: p.description,
        iOverlanderCategory: p.category as IOverlanderCategory,
        dateVerified: p.dateVerified,
        tags: p.tags,
      });
    }
  }

  return spots;
}
