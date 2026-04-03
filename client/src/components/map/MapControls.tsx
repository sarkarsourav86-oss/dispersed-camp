import { useSettingsStore } from '../../store';

export function MapControls() {
  const { showBLM, showUSFS, showTopoMap, radiusKm, toggleBLM, toggleUSFS, toggleTopo, setRadius } = useSettingsStore();

  return (
    <div className="absolute top-4 right-4 z-[500] flex flex-col gap-2">
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

      {/* Radius */}
      <div className="bg-stone-900/90 rounded-xl p-3 shadow-lg backdrop-blur-sm text-xs text-stone-300">
        <p className="font-semibold text-stone-400 uppercase tracking-wide text-[10px] mb-2">Search Radius</p>
        <input
          type="range"
          min={10}
          max={150}
          step={10}
          value={radiusKm}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="w-full accent-amber-500"
        />
        <p className="text-center mt-1 text-amber-400 font-medium">{radiusKm} km</p>
      </div>
    </div>
  );
}
