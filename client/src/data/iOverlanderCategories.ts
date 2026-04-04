import type { IOverlanderCategory } from '../types';

interface CategoryConfig {
  color: string;
  label: string;
  emoji: string;
}

export const IOVERLANDER_CATEGORIES: Record<IOverlanderCategory, CategoryConfig> = {
  'Campground': { color: '#d97706', label: 'Campground', emoji: '\u26FA' },
  'Informal Campsite': { color: '#ea580c', label: 'Informal Camp', emoji: '\uD83C\uDFD5\uFE0F' },
  'Wild Camping': { color: '#059669', label: 'Wild Camping', emoji: '\uD83C\uDF32' },
  'Water': { color: '#2563eb', label: 'Water', emoji: '\uD83D\uDCA7' },
  'Sanitation Dump Station': { color: '#64748b', label: 'Dump Station', emoji: '\uD83D\uDEBD' },
  'Propane': { color: '#dc2626', label: 'Propane/Fuel', emoji: '\uD83D\uDD25' },
  'Mechanic': { color: '#7c3aed', label: 'Mechanic', emoji: '\uD83D\uDD27' },
  'WiFi': { color: '#0891b2', label: 'WiFi', emoji: '\uD83D\uDCF6' },
  'Shower': { color: '#0284c7', label: 'Shower', emoji: '\uD83D\uDEBF' },
  'Restaurant': { color: '#db2777', label: 'Restaurant', emoji: '\uD83C\uDF7D\uFE0F' },
  'Parking': { color: '#78716c', label: 'Parking', emoji: '\uD83C\uDD7F\uFE0F' },
  'Other': { color: '#9ca3af', label: 'Other', emoji: '\uD83D\uDCCD' },
};

export const CAMPING_CATEGORIES: ReadonlySet<IOverlanderCategory> = new Set([
  'Campground',
  'Informal Campsite',
  'Wild Camping',
]);

export function getCategoryConfig(category: IOverlanderCategory): CategoryConfig {
  return IOVERLANDER_CATEGORIES[category] ?? IOVERLANDER_CATEGORIES['Other'];
}
