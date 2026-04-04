#!/usr/bin/env node

/**
 * Convert iOverlander JSON export to grid-indexed JSON files.
 *
 * Usage: node scripts/convert-ioverlander.mjs data/places*.json
 *
 * Output:
 *   client/public/data/ioverlander/{lat}_{lng}.json  (1-degree grid cells)
 *   client/public/data/ioverlander/manifest.json     (list of grid cell keys)
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const OUTPUT_DIR = resolve(PROJECT_ROOT, 'client/public/data/ioverlander');

// Normalize iOverlander category names to our IOverlanderCategory type
const CATEGORY_MAP = {
  'Wild Camping': 'Wild Camping',
  'Established Campground': 'Campground',
  'Informal Campsite': 'Informal Campsite',
  'Farm & Vineyard Camping': 'Campground',
  'Water': 'Water',
  'Sanitation Dump Station': 'Sanitation Dump Station',
  'Propane': 'Propane',
  'Mechanic and Parts': 'Mechanic',
  'Wifi': 'WiFi',
  'Showers': 'Shower',
  'Restaurant': 'Restaurant',
  'Short-term Parking': 'Parking',
  'Laundromat': 'Other',
  'Tourist Attraction': 'Other',
  'Fuel Station': 'Propane',
  'Pet Services': 'Other',
  'Shopping': 'Other',
  'Eco-Friendly': 'Other',
  'Hotel': 'Other',
  'Hostel': 'Other',
  'Road Report': 'Other',
  'Other': 'Other',
};

// Categories to skip entirely (not useful for vanlifers on the map)
const SKIP_CATEGORIES = new Set([
  'Overnight Prohibited',
  'Customs and Immigration',
  'Checkpoint',
  'Vehicle Storage',
  'Vehicle Shipping',
  'Vehicle Insurance',
  'Financial',
  'Medical',
  'Warning',
]);

function normalizeCategory(raw) {
  if (!raw) return 'Other';
  return CATEGORY_MAP[raw] ?? 'Other';
}

// Main — accepts one or more JSON files
const jsonPaths = process.argv.slice(2);
if (jsonPaths.length === 0) {
  console.error('Usage: node scripts/convert-ioverlander.mjs <file1.json> [file2.json] ...');
  process.exit(1);
}

const raw = [];
for (const jsonPath of jsonPaths) {
  const fullPath = resolve(process.cwd(), jsonPath);
  console.log(`Reading JSON from: ${fullPath}`);
  const data = JSON.parse(readFileSync(fullPath, 'utf-8'));
  console.log(`  ${data.length} records`);
  raw.push(...data);
}
console.log(`Total parsed: ${raw.length} records`);

// Group by 1-degree grid cell
const grid = new Map();
let skipped = 0;
let skippedCategory = 0;

for (const record of raw) {
  const rawCategory = record.place_category?.name ?? '';

  if (SKIP_CATEGORIES.has(rawCategory)) {
    skippedCategory++;
    continue;
  }

  const lat = record.location?.latitude;
  const lng = record.location?.longitude;

  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    skipped++;
    continue;
  }

  const category = normalizeCategory(rawCategory);
  const description = (record.description || '').slice(0, 500);
  const dateVerified = record.date_verified
    ? record.date_verified.slice(0, 10)
    : undefined;

  const place = {
    id: `iov-${Math.floor(lat * 1e5)}-${Math.floor(Math.abs(lng) * 1e5)}`,
    name: record.name || 'Unknown',
    lat: Math.round(lat * 1e5) / 1e5,
    lng: Math.round(lng * 1e5) / 1e5,
    category,
    description: description || undefined,
    dateVerified,
  };

  const cellKey = `${Math.floor(lat)}_${Math.floor(lng)}`;
  if (!grid.has(cellKey)) grid.set(cellKey, []);
  grid.get(cellKey).push(place);
}

console.log(`Skipped ${skipped} records with invalid coordinates`);
console.log(`Skipped ${skippedCategory} records with excluded categories`);
console.log(`Generated ${grid.size} grid cells`);

// Write grid files
mkdirSync(OUTPUT_DIR, { recursive: true });

for (const [key, places] of grid) {
  const filePath = resolve(OUTPUT_DIR, `${key}.json`);
  writeFileSync(filePath, JSON.stringify(places));
}

// Write manifest
const manifest = [...grid.keys()].sort();
writeFileSync(resolve(OUTPUT_DIR, 'manifest.json'), JSON.stringify(manifest));

// Stats
let totalPlaces = 0;
const categoryCounts = {};
for (const places of grid.values()) {
  totalPlaces += places.length;
  for (const p of places) {
    categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
  }
}

console.log(`\nTotal places written: ${totalPlaces}`);
console.log('Categories:');
for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
  console.log(`  ${cat}: ${count}`);
}
console.log(`\nOutput: ${OUTPUT_DIR}`);
