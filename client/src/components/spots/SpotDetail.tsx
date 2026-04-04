import { TruckFront, GeoAlt, StarFill, Magic } from 'react-bootstrap-icons';
import { useTripPlan } from '../../hooks/useTripPlan';
import { TripPlanCard } from './TripPlanCard';
import { LoadingSpinner as Spinner } from '../shared/LoadingSpinner';
import type { CampSpot } from '../../types';
import { useRouting } from '../../hooks/useRouting';
import { useWeather } from '../../hooks/useWeather';
import { useFireRestrictions } from '../../hooks/useFireRestrictions';
import { useState, useRef, useEffect } from 'react';
import { useLocationStore, useTripStore, useVanStore } from '../../store';
import { VanProfileSetup } from '../van/VanProfileSetup';
import { WeatherWidget } from '../weather/WeatherWidget';
import { FireRestrictionBanner } from '../rules/FireRestrictionBanner';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { AmenitiesList } from './AmenitiesList';
import { useLocationDetails } from '../../hooks/useLocationDetails';
import { getCategoryConfig } from '../../data/iOverlanderCategories';

interface Props {
  spot: CampSpot;
}

export function SpotDetail({ spot }: Props) {
  const { lat, lng } = useLocationStore();
  const { savedSpots, saveSpot, removeSpot } = useTripStore();
  const vanProfile = useVanStore((s) => s.profile);
  const [showVanSetup, setShowVanSetup] = useState(false);
  const isSaved = savedSpots.some((s) => s.id === spot.id);

  const { data: locationDetails } = useLocationDetails(spot.lat, spot.lng);
  const { data: route, isLoading: routeLoading } = useRouting(spot.lat, spot.lng);
  const { data: weather } = useWeather(spot.lat, spot.lng);
  const { data: fire } = useFireRestrictions(spot.lat, spot.lng);

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=driving`;
  const appleMapsUrl = `maps://maps.apple.com/?daddr=${spot.lat},${spot.lng}&dirflg=d`;
  const earthUrl = `https://earth.google.com/web/search/${spot.lat},${spot.lng}`;

  const tripPlan = useTripPlan();
  const planRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to plan section when loading starts or result arrives
  useEffect(() => {
    if (tripPlan.isPending || tripPlan.data) {
      planRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [tripPlan.isPending, tripPlan.data]);

  const categoryConfig = spot.source === 'ioverlander' && spot.iOverlanderCategory
    ? getCategoryConfig(spot.iOverlanderCategory)
    : null;

  const handlePlanTrip = () => {
    if (!vanProfile) {
      setShowVanSetup(true);
      return;
    }

    const weatherSummary = weather
      ? `${weather[0].description}, ${weather[0].tempMax}°/${weather[0].tempMin}°F, ${weather[0].windSpeed} mph wind`
      : undefined;
    const fireInfo = fire?.restrictionsActive
      ? `${fire.level} restrictions: ${fire.message ?? 'Active'}`
      : undefined;

    tripPlan.mutate({
      name: spot.name,
      lat: spot.lat,
      lng: spot.lng,
      category: spot.iOverlanderCategory,
      description: spot.description,
      weatherSummary,
      fireRestrictions: fireInfo,
      driveTime: route?.durationFormatted,
      distanceMiles: route?.distanceMiles,
      vanType: vanProfile.vanType,
      lengthFt: vanProfile.length,
      clearance: vanProfile.clearance,
      drivetrain: vanProfile.drivetrain,
      waterTankGal: vanProfile.waterTankGallons,
      fuelTankGal: vanProfile.fuelTankGallons,
      mpg: vanProfile.mpg,
      peopleCount: vanProfile.peopleCount,
      hasPet: vanProfile.hasPet,
      hasSolar: vanProfile.hasSolar,
      hasGenerator: vanProfile.hasGenerator,
      needsInternet: vanProfile.needsInternet,
    });
  };

  return (
    <div className="space-y-4">
      {/* Hero section */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Category icon */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ backgroundColor: categoryConfig ? `${categoryConfig.color}20` : '#d9770620' }}
          >
            {categoryConfig?.emoji ?? '\u26FA'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(spot.name + ' camping' + (locationDetails?.city || locationDetails?.state ? ' near ' + [locationDetails.city, locationDetails.state].filter(Boolean).join(', ') : ''))}`}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/30"
            >
              {spot.name}
            </a>
            {locationDetails && (locationDetails.city || locationDetails.state) && (
              <p className="text-sm text-stone-400">
                {[locationDetails.city, locationDetails.state].filter(Boolean).join(', ')}
              </p>
            )}
            <p className="text-xs text-stone-500">
              {spot.lat.toFixed(4)}{'\u00B0'} N, {Math.abs(spot.lng).toFixed(4)}{'\u00B0'} W
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={handlePlanTrip}
              disabled={tripPlan.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-500 text-stone-950 hover:bg-amber-600 transition-colors disabled:opacity-50"
            >
              {tripPlan.isPending ? <Spinner size="sm" /> : <Magic size={12} />}
              Plan
            </button>
            <button
              onClick={() => isSaved ? removeSpot(spot.id) : saveSpot(spot)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                isSaved
                  ? 'bg-amber-500 text-stone-950'
                  : 'bg-stone-800 text-stone-200 hover:bg-stone-700'
              }`}
            >
              <StarFill size={12} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Category + verified */}
        {categoryConfig && (
          <div className="flex items-center gap-2 mt-2 ml-15">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium"
              style={{ backgroundColor: `${categoryConfig.color}20`, color: categoryConfig.color }}
            >
              {categoryConfig.emoji} {categoryConfig.label}
            </span>
            {spot.dateVerified && (
              <span className="text-[11px] text-stone-500">Verified {spot.dateVerified}</span>
            )}
          </div>
        )}
      </div>

      {/* Fire restriction alert */}
      {fire?.restrictionsActive && (
        <div className="px-4">
          <FireRestrictionBanner restriction={fire} />
        </div>
      )}

      {/* Drive time + map links */}
      <div className="px-4">
        <div className="bg-stone-900 rounded-xl p-4 border border-stone-800 space-y-3">
          {/* Drive time */}
          {!lat || !lng ? (
            <p className="text-stone-500 text-sm flex items-center gap-2">
              <GeoAlt size={16} /> Enable location to see drive time
            </p>
          ) : routeLoading ? (
            <div className="flex items-center gap-2 text-stone-400 text-sm">
              <LoadingSpinner size="sm" /> Calculating route...
            </div>
          ) : route ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-stone-800 rounded-lg flex items-center justify-center">
                <TruckFront size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-lg font-bold text-stone-100">{route.durationFormatted}</p>
                <p className="text-xs text-stone-400">from you</p>
              </div>
            </div>
          ) : null}

          {/* Map links — always visible */}
          <div className="flex gap-2 flex-wrap">
            <a href={mapsUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-lg border border-stone-700">
              <GeoAlt size={12} className="text-green-400" />
              Google Maps
            </a>
            <a href={appleMapsUrl}
              className="flex items-center gap-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-lg border border-stone-700">
              Apple Maps
            </a>
            <a href={earthUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs bg-stone-800 hover:bg-stone-700 text-stone-200 px-3 py-2 rounded-lg border border-stone-700">
              <GeoAlt size={12} className="text-blue-400" />
              Google Earth
            </a>
          </div>
        </div>
      </div>

      {/* Amenities */}
      {spot.tags && (
        <div className="px-4">
          <AmenitiesList tags={spot.tags} />
        </div>
      )}

      {/* Weather */}
      {weather && (
        <div className="px-4">
          <WeatherWidget days={weather} />
        </div>
      )}

      {/* About */}
      {spot.description && (
        <div className="px-4">
          <div className="bg-stone-900 rounded-xl p-4 border border-stone-800">
            <p className="text-xs text-stone-400 uppercase tracking-wide mb-2 font-semibold">About</p>
            <p className="text-stone-300 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: spot.description.replace(/<[^>]*>/g, '') }}
            />
          </div>
        </div>
      )}

      {/* Tips */}
      {spot.description && (
        <div className="px-4">
          <SpotTips description={spot.description} />
        </div>
      )}

      {/* Van Profile Setup */}
      {showVanSetup && (
        <div className="px-4">
          <VanProfileSetup onComplete={() => { setShowVanSetup(false); handlePlanTrip(); }} />
        </div>
      )}

      {/* AI Trip Plan */}
      <div ref={planRef}>
        {tripPlan.isPending && (
          <div className="px-4">
            <div className="bg-stone-900 rounded-xl border border-amber-500/30 p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Magic size={18} className="text-amber-400 animate-pulse" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-100">Generating your trip plan...</p>
                  <p className="text-xs text-stone-500">Analyzing spot, weather, and your van profile</p>
                </div>
              </div>
              <div className="flex gap-2">
                {['Route + Stops', 'Water + Fuel', 'Rig Access', 'Conditions'].map((step) => (
                  <span key={step} className="text-[10px] bg-stone-800 text-stone-500 px-2 py-1 rounded-full animate-pulse">
                    {step}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
        {tripPlan.data && (
          <div className="px-4">
            <TripPlanCard plan={tripPlan.data} />
          </div>
        )}
        {tripPlan.isError && (
          <div className="px-4">
            <div className="bg-red-900/30 rounded-xl border border-red-800/50 p-4 text-sm text-red-300">
              Failed to generate trip plan. Check that OPENAI_API_KEY is configured.
            </div>
          </div>
        )}
      </div>

      {/* Links */}
      <div className="flex gap-3 px-4 pb-6">
        {spot.website && (
          <a href={spot.website} target="_blank" rel="noreferrer"
            className="text-sm text-amber-400 hover:text-amber-300 underline">
            Official page
          </a>
        )}
      </div>
    </div>
  );
}

interface TipMatch {
  icon: string;
  label: string;
  pattern: RegExp;
}

const TIP_PATTERNS: TipMatch[] = [
  { icon: '\uD83D\uDCB0', label: 'Price', pattern: /price[:\s]*([^\n.]+)/i },
  { icon: '\uD83D\uDCB0', label: 'Price', pattern: /\b(free|no fee|\$\d+)/i },
  { icon: '\uD83D\uDE97', label: 'Road', pattern: /(2wd|4wd|4x4|dirt road|gravel|paved|rutted|rough road)[^.\n]*/i },
  { icon: '\uD83D\uDCF6', label: 'Cell signal', pattern: /(cell signal|verizon|t-mobile|at&t|no signal|weak signal|no service|good signal|5g|lte)[^.\n]*/i },
  { icon: '\uD83D\uDD07', label: 'Noise', pattern: /(quiet|noisy|loud|highway noise|traffic noise|peaceful|silent)[^.\n]*/i },
  { icon: '\uD83D\uDCA7', label: 'Water', pattern: /(potable water|drinking water|water spigot|no water|water available|fresh water)[^.\n]*/i },
  { icon: '\uD83D\uDD25', label: 'Fire', pattern: /(fire pit|fire ring|campfire|no fires|fire ban|firewood)[^.\n]*/i },
  { icon: '\uD83D\uDE8C', label: 'Big rigs', pattern: /(big rig|large rv|no big rig|small vehicles only|room for)[^.\n]*/i },
  { icon: '\u26FA', label: 'Camping', pattern: /(tent friendly|tent camping|no tents|tent sites)[^.\n]*/i },
  { icon: '\uD83D\uDEBF', label: 'Showers', pattern: /(hot shower|cold shower|showers?( available| cost| free))[^.\n]*/i },
];

function SpotTips({ description }: { description: string }) {
  const tips: { icon: string; label: string; text: string }[] = [];
  const seenLabels = new Set<string>();

  for (const { icon, label, pattern } of TIP_PATTERNS) {
    if (seenLabels.has(label)) continue;
    const match = description.match(pattern);
    if (match) {
      seenLabels.add(label);
      tips.push({ icon, label, text: match[0].trim() });
    }
  }

  if (tips.length === 0) return null;

  return (
    <div className="bg-stone-900 rounded-xl p-4 border border-stone-800">
      <p className="text-xs text-stone-400 uppercase tracking-wide mb-3 font-semibold">Tips from visitors</p>
      <div className="space-y-2.5">
        {tips.map((tip) => (
          <div key={tip.label} className="flex items-start gap-2.5 text-sm">
            <span className="flex-shrink-0 mt-0.5">{tip.icon}</span>
            <div>
              <span className="text-stone-400 font-medium">{tip.label}: </span>
              <span className="text-stone-300">{tip.text}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
