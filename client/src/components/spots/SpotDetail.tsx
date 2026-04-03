import type { CampSpot } from '../../types';
import { useRouting } from '../../hooks/useRouting';
import { useWeather } from '../../hooks/useWeather';
import { useFireRestrictions } from '../../hooks/useFireRestrictions';
import { useLocationStore, useTripStore } from '../../store';
import { WeatherWidget } from '../weather/WeatherWidget';
import { LandRulesPanel } from '../rules/LandRulesPanel';
import { FireRestrictionBanner } from '../rules/FireRestrictionBanner';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { AmenitiesList } from './AmenitiesList';
import { useLocationDetails } from '../../hooks/useLocationDetails';
import { formatDistance } from '../../utils/geo';

interface Props {
  spot: CampSpot;
}

export function SpotDetail({ spot }: Props) {
  const { lat, lng } = useLocationStore();
  const { savedSpots, saveSpot, removeSpot } = useTripStore();
  const isSaved = savedSpots.some((s) => s.id === spot.id);

  const { data: locationDetails } = useLocationDetails(spot.lat, spot.lng);
  const { data: route, isLoading: routeLoading } = useRouting(spot.lat, spot.lng);
  const { data: weather } = useWeather(spot.lat, spot.lng);
  const { data: fire } = useFireRestrictions(spot.lat, spot.lng);

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=driving`;
  const appleMapsUrl = `maps://maps.apple.com/?daddr=${spot.lat},${spot.lng}&dirflg=d`;

  return (
    <div className="space-y-4">
      {/* Fire restriction alert */}
      {fire?.restrictionsActive && <FireRestrictionBanner restriction={fire} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <a
            href={`https://www.google.com/search?q=${encodeURIComponent(spot.name + ' camping' + (locationDetails?.city || locationDetails?.state ? ' near ' + [locationDetails.city, locationDetails.state].filter(Boolean).join(', ') : ''))}`}
            target="_blank"
            rel="noreferrer"
            className="text-xl font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/30 hover:decoration-amber-300"
          >
            {spot.name}
          </a>
          {locationDetails && (locationDetails.city || locationDetails.state) && (
            <p className="text-sm text-stone-300 mt-0.5">
              {[locationDetails.city, locationDetails.county, locationDetails.state].filter(Boolean).join(', ')}
            </p>
          )}
          <p className="text-xs text-stone-500 mt-0.5">
            {spot.lat.toFixed(5)}°N, {Math.abs(spot.lng).toFixed(5)}°W
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => isSaved ? removeSpot(spot.id) : saveSpot(spot)}
            aria-label={isSaved ? 'Remove from saved' : 'Save spot'}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isSaved
                ? 'bg-amber-600 text-amber-950 hover:bg-amber-700'
                : 'bg-stone-700 text-stone-200 hover:bg-stone-600'
            }`}
          >
            {isSaved ? '★ Saved' : '☆ Save'}
          </button>
        </div>
      </div>

      {/* Land type badge */}
      <LandTypeBadge landType={spot.landType} />

      {/* Drive time */}
      <div className="bg-stone-800 rounded-xl p-4">
        <p className="text-xs text-stone-400 uppercase tracking-wide mb-2 font-semibold">Drive from your location</p>
        {!lat || !lng ? (
          <p className="text-stone-500 text-sm">Enable location to see drive time</p>
        ) : routeLoading ? (
          <div className="flex items-center gap-2 text-stone-400 text-sm"><LoadingSpinner size="sm" /> Calculating…</div>
        ) : route ? (
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-amber-400">{route.durationFormatted}</span>
              <span className="text-stone-400 text-sm ml-2">{formatDistance(route.distanceMiles)}</span>
            </div>
            <div className="flex gap-2 flex-wrap justify-end">
              <a href={mapsUrl} target="_blank" rel="noreferrer"
                className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg">
                Google Maps
              </a>
              <a href={appleMapsUrl}
                className="text-xs bg-stone-600 hover:bg-stone-500 text-white px-3 py-1.5 rounded-lg">
                Apple Maps
              </a>
            </div>
          </div>
        ) : (
          <p className="text-stone-500 text-sm">Route unavailable (add ORS API key)</p>
        )}
      </div>

      {/* Amenities */}
      {spot.tags && <AmenitiesList tags={spot.tags} />}

      {/* Weather */}
      {weather && <WeatherWidget days={weather} />}

      {/* Description */}
      {spot.description && (
        <div className="bg-stone-800 rounded-xl p-4">
          <p className="text-xs text-stone-400 uppercase tracking-wide mb-2 font-semibold">About</p>
          <p className="text-stone-300 text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: spot.description.replace(/<[^>]*>/g, '') }}
          />
        </div>
      )}

      {/* Land rules */}
      <LandRulesPanel landType={spot.landType} />

      {/* Links */}
      <div className="flex gap-3 pt-1">
        {spot.website && (
          <a href={spot.website} target="_blank" rel="noreferrer"
            className="text-sm text-amber-400 hover:text-amber-300 underline">
            Official page ↗
          </a>
        )}
        <a
          href={`https://www.blm.gov/office-finder?address=${spot.lat},${spot.lng}`}
          target="_blank" rel="noreferrer"
          className="text-sm text-amber-400 hover:text-amber-300 underline"
        >
          Find local BLM office ↗
        </a>
      </div>
    </div>
  );
}

function LandTypeBadge({ landType }: { landType: CampSpot['landType'] }) {
  const styles: Record<string, string> = {
    BLM: 'bg-amber-900/50 text-amber-300 border border-amber-700',
    USFS: 'bg-green-900/50 text-green-300 border border-green-700',
    unknown: 'bg-stone-700 text-stone-300 border border-stone-600',
  };
  const labels: Record<string, string> = {
    BLM: '🟠 BLM Public Land',
    USFS: '🟢 National Forest',
    unknown: '❓ Land type unknown',
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${styles[landType]}`}>
      {labels[landType]}
    </span>
  );
}
