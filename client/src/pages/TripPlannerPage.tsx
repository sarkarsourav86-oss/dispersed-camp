import { useState } from 'react';
import { PencilFill, TruckFront } from 'react-bootstrap-icons';
import { useTripStore, useVanStore } from '../store';
import { SpotCard } from '../components/spots/SpotCard';
import { SpotDetail } from '../components/spots/SpotDetail';
import { BottomSheet } from '../components/shared/BottomSheet';
import { VanProfileSetup } from '../components/van/VanProfileSetup';
import type { CampSpot } from '../types';

export function TripPlannerPage() {
  const { savedSpots, removeSpot } = useTripStore();
  const vanProfile = useVanStore((s) => s.profile);
  const [selected, setSelected] = useState<CampSpot | null>(null);
  const [editingVan, setEditingVan] = useState(false);

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-100">My Trip</h1>
        </div>

        {/* Van Profile */}
        {editingVan ? (
          <div className="mb-6">
            <VanProfileSetup onComplete={() => setEditingVan(false)} />
          </div>
        ) : vanProfile ? (
          <div className="bg-stone-900 rounded-xl border border-stone-800 p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold">Your Van</p>
              <button
                onClick={() => setEditingVan(true)}
                className="text-amber-400 hover:text-amber-300 p-1"
                aria-label="Edit van profile"
              >
                <PencilFill size={14} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center">
                <TruckFront size={20} className="text-amber-400" />
              </div>
              <div className="text-sm">
                <p className="text-stone-200 font-medium capitalize">
                  {vanProfile.vanType.replace('-', ' ')} · {vanProfile.length}ft · {vanProfile.drivetrain.toUpperCase()}
                </p>
                <p className="text-stone-500 text-xs">
                  {vanProfile.waterTankGallons}gal water · {vanProfile.fuelTankGallons}gal fuel · {vanProfile.mpg} MPG
                  · {vanProfile.peopleCount} {vanProfile.peopleCount === 1 ? 'person' : 'people'}
                  {vanProfile.hasPet ? ' + pet' : ''}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <button
              onClick={() => setEditingVan(true)}
              className="w-full bg-stone-900 border border-dashed border-stone-700 rounded-xl p-4 text-center hover:border-amber-500/50 transition-colors"
            >
              <TruckFront size={24} className="text-stone-500 mx-auto mb-2" />
              <p className="text-sm text-stone-300 font-medium">Set Up Your Van</p>
              <p className="text-xs text-stone-500 mt-0.5">Add your van details for personalized trip plans</p>
            </button>
          </div>
        )}

        {/* Saved Spots */}
        <div className="mb-3">
          <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold">
            Saved Spots {savedSpots.length > 0 && `(${savedSpots.length})`}
          </p>
        </div>

        {savedSpots.length === 0 ? (
          <div className="text-center py-12 text-stone-600">
            <p className="text-lg font-medium text-stone-500">No spots saved yet</p>
            <p className="text-sm text-stone-600 mt-1">Tap a spot on the map and press Save</p>
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
                  className="bg-stone-900 hover:bg-red-900 text-stone-500 hover:text-red-300 rounded-xl px-3 border border-stone-800 transition-colors"
                >
                  &times;
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
