import { useState, useCallback } from 'react';
import { CampingMap } from '../components/map/CampingMap';
import { MapControls } from '../components/map/MapControls';
import { SpotDetail } from '../components/spots/SpotDetail';
import { SpotCard } from '../components/spots/SpotCard';
import { BottomSheet } from '../components/shared/BottomSheet';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNearbySpots } from '../hooks/useNearbySpots';
import { useSpotsStore, useLocationStore } from '../store';
import type { CampSpot } from '../types';

export function MapPage() {
  useGeolocation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const { selectedSpot, selectSpot } = useSpotsStore();
  const { error: locationError } = useLocationStore();
  const { data: spots = [], isLoading } = useNearbySpots();

  const handleSpotSelect = useCallback((spot: CampSpot) => {
    selectSpot(spot);
    setSheetOpen(true);
    setListOpen(false);
  }, [selectSpot]);

  const handleClose = useCallback(() => {
    setSheetOpen(false);
    selectSpot(null);
  }, [selectSpot]);

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <CampingMap onSpotSelect={handleSpotSelect} />

      {/* Layer/radius controls */}
      <MapControls />

      {/* Location error */}
      {locationError && (
        <div className="absolute top-4 left-4 right-20 z-[500] bg-red-900/90 text-red-200 text-sm rounded-xl px-4 py-2 shadow-lg">
          📍 {locationError}
        </div>
      )}

      {/* Spots list button */}
      {spots.length > 0 && (
        <button
          onClick={() => setListOpen(true)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] bg-amber-600 hover:bg-amber-700 text-amber-950 font-semibold text-sm px-5 py-3 rounded-full shadow-xl flex items-center gap-2"
        >
          {isLoading ? <LoadingSpinner size="sm" /> : '⛺'}
          {spots.length} spots nearby
        </button>
      )}

      {/* Spot detail sheet */}
      <BottomSheet open={sheetOpen} onClose={handleClose} title={selectedSpot?.name}>
        {selectedSpot && <SpotDetail spot={selectedSpot} />}
      </BottomSheet>

      {/* Spot list sheet */}
      <BottomSheet open={listOpen} onClose={() => setListOpen(false)} title="Nearby Camping Spots">
        <div className="space-y-2">
          {spots.map((spot) => (
            <SpotCard key={spot.id} spot={spot} onClick={() => handleSpotSelect(spot)} />
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}
