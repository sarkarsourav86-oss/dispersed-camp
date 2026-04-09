import { XLg, ChevronRight } from 'react-bootstrap-icons';
import type { CampSpot } from '../../types';
import { useLocationStore } from '../../store';
import { useLocationDetails } from '../../hooks/useLocationDetails';
import { haversineKm } from '../../utils/geo';
import { getCategoryConfig } from '../../data/iOverlanderCategories';

interface SavedSpotItemProps {
  spot: CampSpot;
  onSelect: () => void;
  onRemove: () => void;
}

function SavedSpotItem({ spot, onSelect, onRemove }: SavedSpotItemProps) {
  const { lat, lng } = useLocationStore();
  const { data: locationDetails } = useLocationDetails(spot.lat, spot.lng);
  const distKm = lat && lng ? haversineKm(lat, lng, spot.lat, spot.lng) : null;
  const distMi = distKm ? (distKm * 0.621371).toFixed(1) : null;

  const categoryConfig = spot.source === 'ioverlander' && spot.iOverlanderCategory
    ? getCategoryConfig(spot.iOverlanderCategory)
    : null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onSelect}
        className="flex-1 text-left bg-stone-900 hover:bg-stone-800 rounded-xl p-4 transition-colors border border-stone-800"
      >
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
            style={{ backgroundColor: categoryConfig ? `${categoryConfig.color}20` : '#d9770620' }}
          >
            {categoryConfig?.emoji ?? '\u26FA'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-stone-100 text-sm truncate">{spot.name}</h3>
              {distMi && (
                <span className="text-amber-400 text-xs font-semibold whitespace-nowrap">{distMi} mi</span>
              )}
            </div>

            {locationDetails && (locationDetails.city || locationDetails.state) && (
              <p className="text-xs text-stone-400 mt-0.5 truncate">
                {[locationDetails.city, locationDetails.state].filter(Boolean).join(', ')}
              </p>
            )}

            {categoryConfig && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium"
                  style={{ backgroundColor: `${categoryConfig.color}20`, color: categoryConfig.color }}
                >
                  {categoryConfig.label}
                </span>
              </div>
            )}
          </div>

          <ChevronRight className="text-stone-600 flex-shrink-0 mt-1" size={16} />
        </div>
      </button>

      <button
        onClick={onRemove}
        className="p-2 text-stone-500 hover:text-red-400 transition-colors flex-shrink-0"
        aria-label={`Remove ${spot.name}`}
      >
        <XLg size={14} />
      </button>
    </div>
  );
}

interface SavedSpotListProps {
  spots: CampSpot[];
  onSelectSpot: (spot: CampSpot) => void;
  onRemoveSpot: (id: string) => void;
}

export default function SavedSpotList({ spots, onSelectSpot, onRemoveSpot }: SavedSpotListProps) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold">
        Saved Locations ({spots.length})
      </p>
      {spots.map((spot) => (
        <SavedSpotItem
          key={spot.id}
          spot={spot}
          onSelect={() => onSelectSpot(spot)}
          onRemove={() => onRemoveSpot(spot.id)}
        />
      ))}
    </div>
  );
}
