import { useState } from 'react';
import { PencilFill, TruckFront, SignpostFill, Map } from 'react-bootstrap-icons';
import { useTripStore, useVanStore } from '../store';
import { VanProfileSetup } from '../components/van/VanProfileSetup';
import SavedSpotList from '../components/trip/SavedSpotList';
import RouteDetailView from '../components/trip/RouteDetailView';
import type { CampSpot } from '../types';

interface TripPlannerPageProps {
  onNavigateToMap?: () => void;
}

export function TripPlannerPage({ onNavigateToMap }: TripPlannerPageProps) {
  const { savedSpots, removeSpot } = useTripStore();
  const vanProfile = useVanStore((s) => s.profile);

  const [selectedSpot, setSelectedSpot] = useState<CampSpot | null>(null);
  const [editingVan, setEditingVan] = useState(false);

  // Route detail view for a selected saved spot
  if (selectedSpot) {
    return (
      <RouteDetailView
        spot={selectedSpot}
        onBack={() => setSelectedSpot(null)}
      />
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-stone-100">My Trip</h1>
          {vanProfile && (
            <div className="flex items-center gap-2">
              <TruckFront size={16} className="text-amber-400" />
              <span className="text-xs text-stone-400 capitalize">
                {vanProfile.vanType.replace('-', ' ')}
              </span>
            </div>
          )}
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

        {/* Saved Spots List or Empty State */}
        {savedSpots.length === 0 ? (
          <div className="text-center py-12">
            <SignpostFill size={32} className="text-stone-700 mx-auto mb-3" />
            <p className="text-lg font-medium text-stone-500">No saved locations yet!</p>
            <p className="text-sm text-stone-600 mt-1">
              Save campsites from the map to plan your trips.
            </p>
            {onNavigateToMap && (
              <button
                onClick={onNavigateToMap}
                className="mt-4 inline-flex items-center gap-2 bg-amber-500 text-stone-950 font-semibold text-sm py-2.5 px-5 rounded-xl hover:bg-amber-400 transition-colors"
              >
                <Map size={16} />
                Find Spots
              </button>
            )}
          </div>
        ) : (
          <SavedSpotList
            spots={savedSpots}
            onSelectSpot={setSelectedSpot}
            onRemoveSpot={removeSpot}
          />
        )}
      </div>
    </div>
  );
}
