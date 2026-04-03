import type { CampSpot } from '../types';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

export async function fetchNearbyCampSpots(lat: number, lng: number, radiusM = 50000): Promise<CampSpot[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["tourism"="camp_site"](around:${radiusM},${lat},${lng});
      way["tourism"="camp_site"](around:${radiusM},${lat},${lng});
      node["camping"~"."](around:${radiusM},${lat},${lng});
    );
    out center;
  `;

  const response = await fetch(OVERPASS_URL, {
    method: 'POST',
    body: query,
    headers: { 'Content-Type': 'text/plain' },
  });

  if (!response.ok) throw new Error(`Overpass error: ${response.status}`);

  const data = await response.json();
  const spots: CampSpot[] = [];

  for (const element of data.elements) {
    const lat = element.lat ?? element.center?.lat;
    const lng = element.lon ?? element.center?.lon;
    if (!lat || !lng) continue;

    const tags = element.tags ?? {};
    const name = tags.name ?? tags['camping:name'] ?? 'Dispersed Camp Site';

    spots.push({
      id: `osm-${element.type}-${element.id}`,
      name,
      lat,
      lng,
      landType: 'unknown', // classified client-side via turf
      source: 'osm',
      description: tags.description,
      website: tags.website,
      tags,
    });
  }

  return spots;
}
