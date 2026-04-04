export type LandType = 'BLM' | 'USFS' | 'unknown';
export type IOverlanderCategory =
  | 'Campground'
  | 'Informal Campsite'
  | 'Wild Camping'
  | 'Water'
  | 'Sanitation Dump Station'
  | 'Propane'
  | 'Mechanic'
  | 'WiFi'
  | 'Shower'
  | 'Restaurant'
  | 'Parking'
  | 'Other';

export interface CampSpot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  landType: LandType;
  source: 'osm' | 'ridb' | 'ioverlander';
  description?: string;
  website?: string;
  imageUrl?: string;
  iOverlanderCategory?: IOverlanderCategory;
  dateVerified?: string;
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

export type VanType = 'sprinter' | 'transit' | 'promaster' | 'minivan' | 'suv' | 'truck-camper' | 'class-b' | 'class-c' | 'other';
export type Clearance = 'low' | 'standard' | 'high';
export type Drivetrain = '2wd' | 'awd' | '4wd';

export interface VanProfile {
  vanType: VanType;
  length: number;
  clearance: Clearance;
  drivetrain: Drivetrain;
  waterTankGallons: number;
  fuelTankGallons: number;
  mpg: number;
  peopleCount: number;
  hasPet: boolean;
  hasSolar: boolean;
  hasGenerator: boolean;
  needsInternet: boolean;
}
