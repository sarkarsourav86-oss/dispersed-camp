import { useState, useCallback } from 'react';
import { ArrowLeft, ArrowClockwise, GeoAltFill } from 'react-bootstrap-icons';
import { CampingMap } from '../components/map/CampingMap';
import { MapControls } from '../components/map/MapControls';
import { SpotDetail } from '../components/spots/SpotDetail';
import { SpotCard } from '../components/spots/SpotCard';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { useGeolocation } from '../hooks/useGeolocation';
import { useNearbySpots } from '../hooks/useNearbySpots';
import { SearchBar } from '../components/search/SearchBar';
import { useSpotsStore, useLocationStore } from '../store';
import type { CampSpot } from '../types';

type View = 'map' | 'list' | 'detail';

interface Props {
  onResetView?: (reset: () => void) => void;
}

export function MapPage({ onResetView }: Props) {
  useGeolocation();

  const [view, setView] = useState<View>('map');
  const [detailOrigin, setDetailOrigin] = useState<'map' | 'list'>('map');
  const { selectedSpot, selectSpot } = useSpotsStore();
  const { error: locationError } = useLocationStore();
  const { data: spots = [], isLoading, refetch } = useNearbySpots();

  // Expose reset function to parent
  const resetToMap = useCallback(() => {
    selectSpot(null);
    setView('map');
  }, [selectSpot]);

  onResetView?.(resetToMap);

  const handleSpotSelect = useCallback((spot: CampSpot, from: 'map' | 'list') => {
    selectSpot(spot);
    setDetailOrigin(from);
    setView('detail');
  }, [selectSpot]);

  const handleBack = useCallback(() => {
    if (view === 'detail') {
      if (detailOrigin === 'list') {
        setView('list');
      } else {
        selectSpot(null);
        setView('map');
      }
    } else {
      selectSpot(null);
      setView('map');
    }
  }, [view, detailOrigin, selectSpot]);

  return (
    <div className="relative w-full h-full">
      {/* Map — always mounted to preserve state, hidden when fullscreen panels are active */}
      <div className={view === 'map' ? 'block w-full h-full' : 'hidden'}>
        <CampingMap onSpotSelect={(spot) => handleSpotSelect(spot, 'map')} />
        <SearchBar />
        <MapControls />

        {locationError && (
          <div className="absolute top-16 left-4 right-4 z-[500] bg-red-900/90 text-red-200 text-sm rounded-xl px-4 py-2 shadow-lg">
            {locationError}
          </div>
        )}

        {spots.length > 0 && (
          <button
            onClick={() => setView('list')}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[500] bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm px-6 py-3 rounded-full shadow-xl inline-flex items-center gap-2 leading-none"
          >
            {isLoading ? <LoadingSpinner size="sm" /> : (
              <GeoAltFill size={16} />
            )}
            {spots.length} spots nearby
          </button>
        )}
      </div>

      {/* Spot list — fullscreen */}
      {view === 'list' && (
        <div className="absolute inset-0 z-[600] bg-stone-950 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
            <button onClick={handleBack} aria-label="Back to map" className="text-stone-300 hover:text-stone-100 p-1">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-base font-semibold text-stone-100">
              {spots.length} spots nearby
            </h2>
            <button
              onClick={() => refetch()}
              aria-label="Refresh"
              className="text-stone-400 hover:text-stone-100 p-1"
            >
              <ArrowClockwise size={18} />
            </button>
          </div>

          {/* Spot list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {spots.map((spot) => (
              <SpotCard key={spot.id} spot={spot} onClick={() => handleSpotSelect(spot, 'list')} />
            ))}
          </div>
        </div>
      )}

      {/* Spot detail — fullscreen */}
      {view === 'detail' && selectedSpot && (
        <div className="absolute inset-0 z-[600] bg-stone-950 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
            <button onClick={handleBack} aria-label="Back" className="text-stone-300 hover:text-stone-100 p-1">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-base font-semibold text-stone-100 truncate flex-1 text-center px-2">{selectedSpot.name}</h2>
            <div className="w-7" />
          </div>
          <div className="flex-1 overflow-y-auto">
            <SpotDetail spot={selectedSpot} />
          </div>
        </div>
      )}
    </div>
  );
}
