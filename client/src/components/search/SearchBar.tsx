import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Sliders } from 'react-bootstrap-icons';
import { useGeocode } from '../../hooks/useGeocode';
import { useLocationStore } from '../../store';
import type { GeocodingResult } from '../../types';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const setSearchLocation = useLocationStore((s) => s.setSearchLocation);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isFetching } = useGeocode(debouncedQuery);

  const handleSelect = useCallback((result: GeocodingResult) => {
    setSearchLocation(result.lat, result.lng, result.displayName);
    setQuery('');
    setDebouncedQuery('');
    setOpen(false);
    inputRef.current?.blur();
  }, [setSearchLocation]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="absolute top-4 left-4 right-4 z-[600]">
      <div className="flex items-center gap-2 bg-stone-900/95 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-lg border border-stone-800">
        <Search className="w-4 h-4 text-stone-500 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search by city, zip, or location"
          className="flex-1 bg-transparent text-stone-100 placeholder-stone-500 text-sm outline-none"
        />
        {isFetching && (
          <div className="w-4 h-4 border-2 border-stone-600 border-t-amber-400 rounded-full animate-spin flex-shrink-0" />
        )}
        {query && (
          <button
            onClick={() => { setQuery(''); setDebouncedQuery(''); setOpen(false); }}
            className="text-stone-500 hover:text-stone-300 text-lg leading-none flex-shrink-0"
          >
            &times;
          </button>
        )}
        <div className="w-px h-5 bg-stone-700 flex-shrink-0" />
        <Sliders className="w-4 h-4 text-stone-400 flex-shrink-0" />
      </div>

      {open && results.length > 0 && (
        <ul className="mt-2 bg-stone-900/95 backdrop-blur-sm border border-stone-800 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
          {results.map((result) => (
            <li key={result.placeId}>
              <button
                onClick={() => handleSelect(result)}
                className="w-full text-left px-4 py-3 text-sm text-stone-200 hover:bg-stone-800 transition-colors border-b border-stone-800/50 last:border-b-0 first:rounded-t-2xl last:rounded-b-2xl"
              >
                {result.displayName}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
