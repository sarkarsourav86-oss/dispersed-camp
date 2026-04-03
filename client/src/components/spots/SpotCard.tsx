import type { CampSpot } from '../../types';
import { useLocationStore } from '../../store';
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
  const distKm = lat && lng ? haversineKm(lat, lng, spot.lat, spot.lng) : null;
  const distMi = distKm ? (distKm * 0.621371).toFixed(1) : null;

  return (
    <button
      onClick={onClick}
      className={`w-full text-left bg-stone-800 hover:bg-stone-750 border-l-4 ${LAND_COLORS[spot.landType]} rounded-xl p-4 transition-colors`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-medium text-stone-100 truncate">{spot.name}</p>
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
