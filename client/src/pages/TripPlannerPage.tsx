import { useTripStore } from '../store';
import { SpotCard } from '../components/spots/SpotCard';
import { SpotDetail } from '../components/spots/SpotDetail';
import { BottomSheet } from '../components/shared/BottomSheet';
import { useState } from 'react';
import type { CampSpot } from '../types';

export function TripPlannerPage() {
  const { savedSpots, removeSpot } = useTripStore();
  const [selected, setSelected] = useState<CampSpot | null>(null);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-100">Trip Planner</h1>
          <p className="text-stone-400 text-sm mt-1">
            {savedSpots.length === 0
              ? 'Save spots from the map to start planning your trip.'
              : `${savedSpots.length} spot${savedSpots.length !== 1 ? 's' : ''} saved`}
          </p>
        </div>

        {savedSpots.length === 0 ? (
          <div className="text-center py-16 text-stone-600">
            <p className="text-5xl mb-4">🗺️</p>
            <p className="text-lg font-medium text-stone-500">No spots saved yet</p>
            <p className="text-sm text-stone-600 mt-1">Tap a camping spot on the map and press "Save"</p>
          </div>
        ) : (
          <div className="space-y-2">
            {savedSpots.map((spot) => (
              <div key={spot.id} className="flex gap-2">
                <div className="flex-1">
                  <SpotCard spot={spot} onClick={() => setSelected(spot)} />
                </div>
                <button
                  onClick={() => removeSpot(spot.id)}
                  aria-label="Remove spot"
                  className="bg-stone-800 hover:bg-red-900 text-stone-500 hover:text-red-300 rounded-xl px-3 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomSheet open={!!selected} onClose={() => setSelected(null)} title={selected?.name}>
        {selected && <SpotDetail spot={selected} />}
      </BottomSheet>
    </div>
  );
}
