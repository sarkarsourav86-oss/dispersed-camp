import { useMemo } from 'react';
import { useGearStore } from '../../store';
import { GEAR_ITEMS } from '../../data/gearItems';
import { GearConfigurator } from './GearConfigurator';
import type { GearCategory, GearConfig, GearItem } from '../../types';

const DURATION_DAYS: Record<string, number> = {
  overnight: 1,
  weekend: 2,
  week: 7,
  extended: 14,
};

const CATEGORY_LABELS: Record<GearCategory, string> = {
  shelter: '⛺ Shelter',
  sleep: '🛌 Sleep',
  cooking: '🍳 Cooking',
  water: '💧 Water',
  navigation: '🧭 Navigation',
  safety: '🩹 Safety',
  clothing: '👕 Clothing',
  fire: '🔥 Fire',
  hygiene: '🚿 Hygiene',
  vehicle: '🚗 Vehicle',
  'leave-no-trace': '🌿 Leave No Trace',
};

function getApplicableItems(items: GearItem[], config: GearConfig): GearItem[] {
  const days = DURATION_DAYS[config.duration] ?? 2;
  return items.filter((item) => {
    const c = item.conditions;
    if (c.seasons?.length && !c.seasons.includes(config.season)) return false;
    if (c.terrain?.length && !c.terrain.includes(config.terrain)) return false;
    if (c.minDays !== undefined && days < c.minDays) return false;
    if (c.hasWaterNearby !== undefined && c.hasWaterNearby !== config.hasWaterNearby) return false;
    if (c.fireRestrictionsActive !== undefined && c.fireRestrictionsActive !== config.fireRestrictionsActive) return false;
    return true;
  });
}

export function GearChecklist() {
  const { config, checkedItems, toggleItem, resetChecked } = useGearStore();

  const applicable = useMemo(() => getApplicableItems(GEAR_ITEMS, config), [config]);

  const grouped = useMemo(() => {
    const map = new Map<GearCategory, GearItem[]>();
    for (const item of applicable) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    return map;
  }, [applicable]);

  const totalChecked = applicable.filter((i) => checkedItems.includes(i.id)).length;
  const essentialDone = applicable.filter((i) => i.essential && checkedItems.includes(i.id)).length;
  const essentialTotal = applicable.filter((i) => i.essential).length;

  return (
    <div className="space-y-6">
      <GearConfigurator />

      {/* Progress */}
      <div className="bg-stone-800 rounded-xl p-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-stone-300">
            {totalChecked}/{applicable.length} packed
            {config.fireRestrictionsActive && <span className="ml-2 text-red-400 font-medium">🔥 Fire restrictions ON</span>}
          </span>
          <button onClick={resetChecked} className="text-stone-500 hover:text-stone-300 text-xs">Reset</button>
        </div>
        <div className="h-2 bg-stone-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all"
            style={{ width: `${applicable.length ? (totalChecked / applicable.length) * 100 : 0}%` }}
          />
        </div>
        <p className="text-xs text-stone-500 mt-1">
          Essentials: {essentialDone}/{essentialTotal}
          {essentialDone === essentialTotal && essentialTotal > 0 && <span className="text-green-400 ml-1">✓ All packed!</span>}
        </p>
      </div>

      {/* Categories */}
      {Array.from(grouped.entries()).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-stone-300 mb-2">
            {CATEGORY_LABELS[category]}
          </h3>
          <div className="space-y-1">
            {items.map((item) => {
              const checked = checkedItems.includes(item.id);
              return (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    checked ? 'bg-stone-800/60' : 'bg-stone-800 hover:bg-stone-750'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleItem(item.id)}
                    className="mt-0.5 w-4 h-4 accent-amber-500 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <span className={`text-sm ${checked ? 'line-through text-stone-500' : 'text-stone-200'}`}>
                      {item.name}
                      {item.essential && !checked && (
                        <span className="ml-1 text-amber-500 text-[10px] font-bold uppercase">essential</span>
                      )}
                    </span>
                    {item.notes && !checked && (
                      <p className="text-[11px] text-stone-500 mt-0.5">{item.notes}</p>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
