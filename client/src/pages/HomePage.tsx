import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Search, Sliders, Droplet, Signpost, GeoAltFill, ArrowRight, ChevronRight,
} from 'react-bootstrap-icons';
import { useGeocode } from '../hooks/useGeocode';
import { useQuery } from '@tanstack/react-query';
import { fetchIOverlanderSpots } from '../services/iOverlander';
import { useGeolocation } from '../hooks/useGeolocation';
import { useLocationStore, useSettingsStore } from '../store';
import { getCategoryConfig, IOVERLANDER_CATEGORIES } from '../data/iOverlanderCategories';
import { haversineKm } from '../utils/geo';
import type { GeocodingResult, CampSpot, IOverlanderCategory } from '../types';
import type { ComponentType } from 'react';

interface Props {
  onNavigateToMap: () => void;
  onSelectSpot: (spot: CampSpot) => void;
}

const QUICK_FILTERS: { label: string; Icon: ComponentType<{ size?: number; className?: string }>; categories: IOverlanderCategory[] }[] = [
  { label: 'Camping', Icon: Signpost, categories: ['Campground', 'Informal Campsite', 'Wild Camping'] },
  { label: 'Water', Icon: Droplet, categories: ['Water'] },
  { label: 'Dump Station', Icon: GeoAltFill, categories: ['Sanitation Dump Station'] },
];

export function HomePage({ onNavigateToMap, onSelectSpot }: Props) {
  useGeolocation();
  const { lat, lng } = useLocationStore();

  // Fetch spots near user's GPS location (independent of map bbox)
  const homeBbox = lat && lng ? {
    south: lat - 0.5,
    west: lng - 0.5,
    north: lat + 0.5,
    east: lng + 0.5,
  } : null;

  const { data: spots = [] } = useQuery({
    queryKey: ['home-spots', lat?.toFixed(1), lng?.toFixed(1)],
    queryFn: async ({ signal }) => {
      const raw = await fetchIOverlanderSpots(homeBbox!, signal);
      return raw.sort((a, b) =>
        haversineKm(lat!, lng!, a.lat, a.lng) - haversineKm(lat!, lng!, b.lat, b.lng)
      );
    },
    enabled: !!homeBbox,
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });
  const setSearchLocation = useLocationStore((s) => s.setSearchLocation);
  const settingsStore = useSettingsStore();

  // Search state
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isFetching } = useGeocode(debouncedQuery);

  const handleSearchSelect = useCallback((result: GeocodingResult) => {
    setSearchLocation(result.lat, result.lng, result.displayName);
    setQuery('');
    setDebouncedQuery('');
    setSearchOpen(false);
    inputRef.current?.blur();
    onNavigateToMap();
  }, [setSearchLocation, onNavigateToMap]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryFilter = (categories: IOverlanderCategory[]) => {
    // Enable only the selected categories
    const allCats = Object.keys(IOVERLANDER_CATEGORIES) as IOverlanderCategory[];
    for (const cat of allCats) {
      const shouldBeOn = categories.includes(cat);
      if (settingsStore.iOverlanderCategories[cat] !== shouldBeOn) {
        settingsStore.toggleIOverlanderCategory(cat);
      }
    }
    onNavigateToMap();
  };

  const nearbySpots = spots.slice(0, 5);

  const [scrollY, setScrollY] = useState(0);

  const logoOffset = Math.min(scrollY * 0.5, 150);
  const logoOpacity = Math.max(1 - scrollY / 300, 0);
  const overlayOpacity = Math.min(0.4 + scrollY / 400, 0.95);

  return (
    <div
      className="h-full overflow-y-auto bg-stone-950"
      onScroll={(e) => setScrollY(e.currentTarget.scrollTop)}
    >
      {/* Fixed background image */}
      <div className="fixed inset-x-0 top-0 h-screen z-0 pointer-events-none">
        <img src="/van.png" alt="" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0 bg-gradient-to-b from-stone-950/40 via-stone-950/60 to-stone-950"
          style={{ opacity: overlayOpacity }}
        />
      </div>

      {/* Hero */}
      <div className="relative px-6 pt-12 pb-8 z-[1]">
        <div
          className="relative text-center mb-8"
          style={{
            transform: `translateY(-${logoOffset}px)`,
            opacity: logoOpacity,
          }}
        >
          <img
            src="/logo.png"
            alt="VanLife Adventures"
            className="w-44 h-auto mx-auto mb-4"
          />
          <p className="text-2xl font-bold text-stone-100 leading-tight">Find Your Perfect<br />Campsite</p>
          <p className="text-sm text-stone-400 mt-2">
            Explore the best spots for vanlife across the US and Canada.
          </p>
        </div>

        {/* Search */}
        <div ref={searchRef} className="relative">
          <div className="flex items-center gap-2 bg-stone-800/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-stone-700">
            <Search className="w-4 h-4 text-stone-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Where do you want to camp?"
              className="flex-1 bg-transparent text-stone-100 placeholder-stone-500 text-sm outline-none"
            />
            {isFetching && (
              <div className="w-4 h-4 border-2 border-stone-600 border-t-amber-400 rounded-full animate-spin flex-shrink-0" />
            )}
            {query && (
              <button
                onClick={() => { setQuery(''); setDebouncedQuery(''); setSearchOpen(false); }}
                className="text-stone-500 hover:text-stone-300 text-lg leading-none flex-shrink-0"
              >
                &times;
              </button>
            )}
            <div className="w-px h-5 bg-stone-600 flex-shrink-0" />
            <Sliders className="w-4 h-4 text-amber-400 flex-shrink-0" />
          </div>

          {searchOpen && results.length > 0 && (
            <ul className="absolute left-0 right-0 mt-2 bg-stone-800/95 backdrop-blur-sm border border-stone-700 rounded-xl shadow-xl max-h-48 overflow-y-auto z-10">
              {results.map((result) => (
                <li key={result.placeId}>
                  <button
                    onClick={() => handleSearchSelect(result)}
                    className="w-full text-left px-4 py-3 text-sm text-stone-200 hover:bg-stone-700 transition-colors border-b border-stone-700/50 last:border-b-0"
                  >
                    {result.displayName}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {QUICK_FILTERS.map(({ label, Icon, categories }) => (
            <button
              key={label}
              onClick={() => handleCategoryFilter(categories)}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-800/80 hover:bg-stone-700 border border-stone-600 rounded-full text-xs font-medium text-stone-100 whitespace-nowrap transition-colors backdrop-blur-sm"
            >
              <Icon size={14} className="text-amber-400" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Gradient transition from hero to content */}
      <div className="relative z-[1] h-10 bg-gradient-to-b from-transparent to-stone-950 pointer-events-none" />

      {/* Nearby spots */}
      <div className="relative z-[1] px-4 py-6 bg-stone-950 -mt-1">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-stone-100">Nearby Spots</h2>
          {nearbySpots.length > 0 && (
            <button
              onClick={onNavigateToMap}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              View map <ArrowRight size={12} />
            </button>
          )}
        </div>

        {!lat || !lng ? (
          <div className="bg-stone-900 rounded-xl border border-stone-800 p-6 text-center">
            <GeoAltFill size={24} className="text-stone-600 mx-auto mb-2" />
            <p className="text-sm text-stone-400">Enable location to see nearby spots</p>
            <p className="text-xs text-stone-500 mt-1">Or search for a location above</p>
          </div>
        ) : nearbySpots.length === 0 ? (
          <div className="bg-stone-900 rounded-xl border border-stone-800 p-6 text-center">
            <p className="text-sm text-stone-400">Zoom into the map to find spots</p>
            <button
              onClick={onNavigateToMap}
              className="mt-3 text-xs bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold px-4 py-2 rounded-lg"
            >
              Open Map
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {nearbySpots.map((spot) => (
              <HomeSpotCard
                key={spot.id}
                spot={spot}
                userLat={lat}
                userLng={lng}
                onClick={() => onSelectSpot(spot)}
              />
            ))}

            <button
              onClick={onNavigateToMap}
              className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              View all {spots.length} spots on map
              <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Explore by category */}
      <div className="relative z-[1] px-4 pb-8 bg-stone-950">
        <h2 className="text-base font-bold text-stone-100 mb-3">Explore by Category</h2>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_FILTERS.map(({ label, Icon, categories }) => {
            const catConfig = getCategoryConfig(categories[0]);
            return (
              <button
                key={label}
                onClick={() => handleCategoryFilter(categories)}
                className="flex items-center gap-3 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl p-3 transition-colors text-left"
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${catConfig.color}20` }}
                >
                  <Icon size={18} className="text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-200">{label}</p>
                  <p className="text-[10px] text-stone-500">
                    {categories.map((c) => getCategoryConfig(c).label).join(', ')}
                  </p>
                </div>
                <ChevronRight size={14} className="text-stone-600 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function HomeSpotCard({ spot, userLat, userLng, onClick }: {
  spot: CampSpot;
  userLat: number | null;
  userLng: number | null;
  onClick: () => void;
}) {
  const categoryConfig = spot.iOverlanderCategory ? getCategoryConfig(spot.iOverlanderCategory) : null;
  const distMi = userLat && userLng
    ? (haversineKm(userLat, userLng, spot.lat, spot.lng) * 0.621371).toFixed(1)
    : null;

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl p-3 flex items-center gap-3 transition-colors"
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-lg"
        style={{ backgroundColor: categoryConfig ? `${categoryConfig.color}20` : '#d9770620' }}
      >
        {categoryConfig?.emoji ?? '\u26FA'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-stone-100 truncate">{spot.name}</p>
        {categoryConfig && (
          <p className="text-[10px] mt-0.5" style={{ color: categoryConfig.color }}>
            {categoryConfig.label}
          </p>
        )}
      </div>
      {distMi && (
        <span className="text-xs font-semibold text-amber-400 bg-stone-800 px-2 py-1 rounded-lg whitespace-nowrap">
          {distMi} mi
        </span>
      )}
      <ChevronRight size={14} className="text-stone-600 flex-shrink-0" />
    </button>
  );
}
