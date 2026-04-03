import { useGearStore } from '../../store';
import type { Season, TerrainType, TripDuration } from '../../types';

const SEASONS: { value: Season; label: string }[] = [
  { value: 'spring', label: '🌱 Spring' },
  { value: 'summer', label: '☀️ Summer' },
  { value: 'fall', label: '🍂 Fall' },
  { value: 'winter', label: '❄️ Winter' },
];

const TERRAINS: { value: TerrainType; label: string }[] = [
  { value: 'forest', label: '🌲 Forest' },
  { value: 'mountain', label: '⛰️ Mountain' },
  { value: 'desert', label: '🏜️ Desert' },
  { value: 'coastal', label: '🌊 Coastal' },
];

const DURATIONS: { value: TripDuration; label: string }[] = [
  { value: 'overnight', label: '1 Night' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'week', label: '1 Week' },
  { value: 'extended', label: '7+ Days' },
];

export function GearConfigurator() {
  const { config, setConfig } = useGearStore();

  return (
    <div className="space-y-4">
      <ToggleGroup
        label="Season"
        options={SEASONS}
        value={config.season}
        onChange={(v) => setConfig({ season: v as Season })}
      />
      <ToggleGroup
        label="Terrain"
        options={TERRAINS}
        value={config.terrain}
        onChange={(v) => setConfig({ terrain: v as TerrainType })}
      />
      <ToggleGroup
        label="Trip Length"
        options={DURATIONS}
        value={config.duration}
        onChange={(v) => setConfig({ duration: v as TripDuration })}
      />

      <div className="flex gap-4">
        <div className="flex-1">
          <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold mb-2">Group Size</p>
          <div className="flex items-center gap-3 bg-stone-800 rounded-xl px-4 py-2">
            <button
              onClick={() => setConfig({ groupSize: Math.max(1, config.groupSize - 1) })}
              className="text-stone-400 hover:text-stone-200 text-lg w-6 h-6 flex items-center justify-center"
            >−</button>
            <span className="text-stone-100 font-bold text-lg flex-1 text-center">{config.groupSize}</span>
            <button
              onClick={() => setConfig({ groupSize: Math.min(20, config.groupSize + 1) })}
              className="text-stone-400 hover:text-stone-200 text-lg w-6 h-6 flex items-center justify-center"
            >+</button>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold mb-2">Water Nearby?</p>
          <button
            onClick={() => setConfig({ hasWaterNearby: !config.hasWaterNearby })}
            className={`w-full rounded-xl py-2 text-sm font-medium transition-colors ${
              config.hasWaterNearby
                ? 'bg-blue-700 text-blue-100'
                : 'bg-stone-800 text-stone-400'
            }`}
          >
            {config.hasWaterNearby ? '💧 Yes' : 'No water'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleGroup({
  label, options, value, onChange,
}: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold mb-2">{label}</p>
      <div className="flex gap-2 flex-wrap">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              value === opt.value
                ? 'bg-amber-600 text-amber-950 font-semibold'
                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
