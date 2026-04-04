import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CampSpot, FireRestrictionResult, IOverlanderCategory, VanProfile } from '../types';

interface LocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  searchLocation: { lat: number; lng: number; name: string } | null;
  setLocation: (lat: number, lng: number, accuracy: number) => void;
  setError: (error: string) => void;
  setSearchLocation: (lat: number, lng: number, name: string) => void;
  clearSearchLocation: () => void;
}

interface SpotsState {
  spots: CampSpot[];
  selectedSpot: CampSpot | null;
  fireRestriction: FireRestrictionResult | null;
  setSpots: (spots: CampSpot[]) => void;
  selectSpot: (spot: CampSpot | null) => void;
  setFireRestriction: (r: FireRestrictionResult) => void;
}

interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

interface MapState {
  mapBbox: BoundingBox | null;
  setMapBbox: (bbox: BoundingBox) => void;
}

interface SettingsState {
  showBLM: boolean;
  showUSFS: boolean;
  showTopoMap: boolean;
  showIOverlander: boolean;
  iOverlanderCategories: Record<IOverlanderCategory, boolean>;
  toggleBLM: () => void;
  toggleUSFS: () => void;
  toggleTopo: () => void;
  toggleIOverlander: () => void;
  toggleIOverlanderCategory: (cat: IOverlanderCategory) => void;
}

interface TripState {
  savedSpots: CampSpot[];
  saveSpot: (spot: CampSpot) => void;
  removeSpot: (id: string) => void;
}


export const useLocationStore = create<LocationState>((set) => ({
  lat: null,
  lng: null,
  accuracy: null,
  error: null,
  searchLocation: null,
  setLocation: (lat, lng, accuracy) => set({ lat, lng, accuracy, error: null }),
  setError: (error) => set({ error }),
  setSearchLocation: (lat, lng, name) => set({ searchLocation: { lat, lng, name } }),
  clearSearchLocation: () => set({ searchLocation: null }),
}));

export const useSpotsStore = create<SpotsState>((set) => ({
  spots: [],
  selectedSpot: null,
  fireRestriction: null,
  setSpots: (spots) => set({ spots }),
  selectSpot: (spot) => set({ selectedSpot: spot }),
  setFireRestriction: (fireRestriction) => set({ fireRestriction }),
}));

export const useMapStore = create<MapState>((set) => ({
  mapBbox: null,
  setMapBbox: (mapBbox) => set({ mapBbox }),
}));

const defaultIOverlanderCategories: Record<IOverlanderCategory, boolean> = {
  'Campground': true,
  'Informal Campsite': true,
  'Wild Camping': true,
  'Water': true,
  'Sanitation Dump Station': true,
  'Propane': true,
  'Mechanic': true,
  'WiFi': true,
  'Shower': true,
  'Restaurant': true,
  'Parking': true,
  'Other': true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      showBLM: true,
      showUSFS: true,
      showTopoMap: false,
      showIOverlander: true,
      iOverlanderCategories: { ...defaultIOverlanderCategories },
      toggleBLM: () => set((s) => ({ showBLM: !s.showBLM })),
      toggleUSFS: () => set((s) => ({ showUSFS: !s.showUSFS })),
      toggleTopo: () => set((s) => ({ showTopoMap: !s.showTopoMap })),
      toggleIOverlander: () => set((s) => ({ showIOverlander: !s.showIOverlander })),
      toggleIOverlanderCategory: (cat) =>
        set((s) => ({
          iOverlanderCategories: {
            ...s.iOverlanderCategories,
            [cat]: !s.iOverlanderCategories[cat],
          },
        })),
    }),
    {
      name: 'dc-settings',
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as Partial<SettingsState>),
        iOverlanderCategories: {
          ...defaultIOverlanderCategories,
          ...((persisted as Partial<SettingsState>)?.iOverlanderCategories ?? {}),
        },
      }),
    }
  )
);


export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      savedSpots: [],
      saveSpot: (spot) =>
        set((s) => ({
          savedSpots: s.savedSpots.find((x) => x.id === spot.id)
            ? s.savedSpots
            : [...s.savedSpots, spot],
        })),
      removeSpot: (id) => set((s) => ({ savedSpots: s.savedSpots.filter((x) => x.id !== id) })),
    }),
    { name: 'dc-trip' }
  )
);

interface VanState {
  profile: VanProfile | null;
  setProfile: (profile: VanProfile) => void;
}

export const useVanStore = create<VanState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
    }),
    { name: 'dc-van-profile' }
  )
);
