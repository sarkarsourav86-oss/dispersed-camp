import type { CampSpot } from '../../types';
import { useLocationStore } from '../../store';
import { useLocationDetails } from '../../hooks/useLocationDetails';
import { haversineKm } from '../../utils/geo';

interface Props {
  spot: CampSpot;
  onClick: () => void;
}

const LAND_COLORS: Record<string, string> = {
  BLM: 'border-l-amber-500',
  USFS: 'border-l-green-500',
  unknown: 'border-l-stone-600',
};

export function SpotCard({ spot, onClick }: Props) {
  const { lat, lng } = useLocationStore();
  const { data: locationDetails } = useLocationDetails(spot.lat, spot.lng);
  const distKm = lat && lng ? haversineKm(lat, lng, spot.lat, spot.lng) : null;
  const distMi = distKm ? (distKm * 0.621371).toFixed(1) : null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-stone-800 hover:bg-stone-750 border-l-4 ${LAND_COLORS[spot.landType]} rounded-xl p-4 transition-colors`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(spot.name + ' camping' + (locationDetails?.city || locationDetails?.state ? ' near ' + [locationDetails.city, locationDetails.state].filter(Boolean).join(', ') : ''))}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-amber-400 hover:text-amber-300 underline decoration-amber-400/30 truncate block"
          >
            {spot.name}
          </a>
          {locationDetails && (locationDetails.city || locationDetails.state) && (
            <p className="text-xs text-stone-300 mt-0.5 truncate">
              {[locationDetails.city, locationDetails.state].filter(Boolean).join(', ')}
            </p>
          )}
          <p className="text-xs text-stone-400 mt-0.5">
            {spot.landType !== 'unknown' ? spot.landType : 'Unknown land'}
            {' · '}
            <span className="font-mono text-stone-500">{spot.source.toUpperCase()}</span>
          </p>
        </div>
        {distMi && (
          <span className="text-amber-400 text-sm font-semibold whitespace-nowrap">{distMi} mi</span>
        )}
      </div>
    </button>
  );
}
