import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CampSpot, GearConfig, FireRestrictionResult } from '../types';

interface LocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  error: string | null;
  setLocation: (lat: number, lng: number, accuracy: number) => void;
  setError: (error: string) => void;
}

interface SpotsState {
  spots: CampSpot[];
  selectedSpot: CampSpot | null;
  fireRestriction: FireRestrictionResult | null;
  setSpots: (spots: CampSpot[]) => void;
  selectSpot: (spot: CampSpot | null) => void;
  setFireRestriction: (r: FireRestrictionResult) => void;
}

interface SettingsState {
  radiusKm: number;
  showBLM: boolean;
  showUSFS: boolean;
  showTopoMap: boolean;
  setRadius: (r: number) => void;
  toggleBLM: () => void;
  toggleUSFS: () => void;
  toggleTopo: () => void;
}

interface GearState {
  config: GearConfig;
  checkedItems: string[];
  setConfig: (c: Partial<GearConfig>) => void;
  toggleItem: (id: string) => void;
  resetChecked: () => void;
}

interface TripState {
  savedSpots: CampSpot[];
  saveSpot: (spot: CampSpot) => void;
  removeSpot: (id: string) => void;
}

const defaultGearConfig: GearConfig = {
  season: getSeason(),
  duration: 'weekend',
  terrain: 'forest',
  groupSize: 2,
  hasWaterNearby: false,
  fireRestrictionsActive: false,
};

function getSeason(): GearConfig['season'] {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

export const useLocationStore = create<LocationState>((set) => ({
  lat: null,
  lng: null,
  accuracy: null,
  error: null,
  setLocation: (lat, lng, accuracy) => set({ lat, lng, accuracy, error: null }),
  setError: (error) => set({ error }),
}));

export const useSpotsStore = create<SpotsState>((set) => ({
  spots: [],
  selectedSpot: null,
  fireRestriction: null,
  setSpots: (spots) => set({ spots }),
  selectSpot: (spot) => set({ selectedSpot: spot }),
  setFireRestriction: (fireRestriction) => set({ fireRestriction }),
}));

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      radiusKm: 50,
      showBLM: true,
      showUSFS: true,
      showTopoMap: false,
      setRadius: (radiusKm) => set({ radiusKm }),
      toggleBLM: () => set((s) => ({ showBLM: !s.showBLM })),
      toggleUSFS: () => set((s) => ({ showUSFS: !s.showUSFS })),
      toggleTopo: () => set((s) => ({ showTopoMap: !s.showTopoMap })),
    }),
    { name: 'dc-settings' }
  )
);

export const useGearStore = create<GearState>()(
  persist(
    (set) => ({
      config: defaultGearConfig,
      checkedItems: [],
      setConfig: (c) => set((s) => ({ config: { ...s.config, ...c } })),
      toggleItem: (id) =>
        set((s) => ({
          checkedItems: s.checkedItems.includes(id)
            ? s.checkedItems.filter((i) => i !== id)
            : [...s.checkedItems, id],
        })),
      resetChecked: () => set({ checkedItems: [] }),
    }),
    { name: 'dc-gear' }
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
