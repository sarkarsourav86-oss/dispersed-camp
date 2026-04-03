export type Season = 'spring' | 'summer' | 'fall' | 'winter';
export type TerrainType = 'desert' | 'mountain' | 'forest' | 'coastal';
export type TripDuration = 'overnight' | 'weekend' | 'week' | 'extended';
export type LandType = 'BLM' | 'USFS' | 'unknown';
export type GearCategory =
  | 'shelter'
  | 'sleep'
  | 'cooking'
  | 'water'
  | 'navigation'
  | 'safety'
  | 'clothing'
  | 'fire'
  | 'hygiene'
  | 'vehicle'
  | 'leave-no-trace';

export interface CampSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  landType: LandType;
  source: 'osm' | 'ridb';
  description?: string;
  website?: string;
  tags?: Record<string, string>;
}

export interface RouteResult {
  distanceMeters: number;
  durationSeconds: number;
  distanceMiles: number;
  durationFormatted: string;
}

export interface FireRestrictionResult {
  restrictionsActive: boolean;
  level: 'none' | 'stage1' | 'stage2' | 'closed';
  message?: string;
  sourceUrl?: string;
}

export interface WeatherDay {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  windSpeed: number;
  weatherCode: number;
  description: string;
}

export interface GearItem {
  id: string;
  name: string;
  category: GearCategory;
  essential: boolean;
  conditions: {
    seasons?: Season[];
    terrain?: TerrainType[];
    minDays?: number;
    hasWaterNearby?: boolean;
    fireRestrictionsActive?: boolean;
  };
  notes?: string;
}

export interface GearConfig {
  season: Season;
  duration: TripDuration;
  terrain: TerrainType;
  groupSize: number;
  hasWaterNearby: boolean;
  fireRestrictionsActive: boolean;
}

export interface LandRule {
  id: string;
  category: 'stay-limit' | 'fire' | 'water' | 'vehicle' | 'waste' | 'fees';
  title: string;
  description: string;
  citation?: string;
}

export interface LandRuleSet {
  agencyType: LandType;
  generalRules: LandRule[];
}

export interface GeocodingResult {
  placeId: string;
  displayName: string;
  lat: number;
  lng: number;
}

export interface LocationDetails {
  city: string | null;
  state: string | null;
  county: string | null;
}
