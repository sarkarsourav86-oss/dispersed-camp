import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';
import { useSettingsStore } from '../../store';
import { IOVERLANDER_CATEGORIES } from '../../data/iOverlanderCategories';
import type { IOverlanderCategory } from '../../types';

const IOV_CATEGORY_KEYS = Object.keys(IOVERLANDER_CATEGORIES) as IOverlanderCategory[];

export function MapControls() {
  const {
    showBLM, showUSFS, showTopoMap, showIOverlander, iOverlanderCategories,
    toggleBLM, toggleUSFS, toggleTopo, toggleIOverlander, toggleIOverlanderCategory,
  } = useSettingsStore();

  const [iovExpanded, setIovExpanded] = useState(false);

  return (
    <div className="absolute top-16 right-4 z-[500] flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
      {/* Layer toggles */}
      <div className="bg-stone-900/90 rounded-xl p-3 flex flex-col gap-2 shadow-lg backdrop-blur-sm text-xs text-stone-300">
        <p className="font-semibold text-stone-400 uppercase tracking-wide text-[10px]">Layers</p>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="w-3 h-3 rounded-sm bg-amber-600 flex-shrink-0" />
          <input type="checkbox" className="accent-amber-500" checked={showBLM} onChange={toggleBLM} />
          BLM Land
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="w-3 h-3 rounded-sm bg-green-600 flex-shrink-0" />
          <input type="checkbox" className="accent-green-500" checked={showUSFS} onChange={toggleUSFS} />
          National Forest
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="w-3 h-3 rounded-sm bg-stone-500 flex-shrink-0" />
          <input type="checkbox" className="accent-stone-400" checked={showTopoMap} onChange={toggleTopo} />
          Topo Map
        </label>
      </div>

      {/* iOverlander toggles */}
      <div className="bg-stone-900/90 rounded-xl p-3 shadow-lg backdrop-blur-sm text-xs text-stone-300">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 flex-shrink-0" />
            <input type="checkbox" className="accent-emerald-500" checked={showIOverlander} onChange={toggleIOverlander} />
            iOverlander
          </label>
          {showIOverlander && (
            <button
              onClick={() => setIovExpanded(!iovExpanded)}
              className="text-stone-400 hover:text-stone-200 p-0.5"
              aria-label={iovExpanded ? 'Collapse categories' : 'Expand categories'}
            >
              {iovExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>

        {showIOverlander && iovExpanded && (
          <div className="mt-2 pt-2 border-t border-stone-700 flex flex-col gap-1.5">
            {IOV_CATEGORY_KEYS.map((cat) => {
              const config = IOVERLANDER_CATEGORIES[cat];
              return (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <input
                    type="checkbox"
                    className="accent-emerald-500"
                    checked={iOverlanderCategories[cat]}
                    onChange={() => toggleIOverlanderCategory(cat)}
                  />
                  <span className="truncate">{config.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
