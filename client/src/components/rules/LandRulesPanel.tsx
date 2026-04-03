import { useState } from 'react';
import type { LandType } from '../../types';
import { LAND_RULES } from '../../data/landRules';

const CATEGORY_ICONS: Record<string, string> = {
  'stay-limit': '📅',
  fire: '🔥',
  water: '💧',
  vehicle: '🚗',
  waste: '🗑️',
  fees: '💚',
};

interface Props {
  landType: LandType;
}

export function LandRulesPanel({ landType }: Props) {
  const [expanded, setExpanded] = useState(false);
  const rules = LAND_RULES[landType] ?? LAND_RULES['unknown'];

  return (
    <div className="bg-stone-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold">
          {landType === 'BLM' ? 'BLM' : landType === 'USFS' ? 'National Forest' : 'Land'} Rules & Regulations
        </p>
        <span className="text-stone-500 text-sm">{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {rules.generalRules.map((rule) => (
            <div key={rule.id} className="flex gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">{CATEGORY_ICONS[rule.category] ?? '📌'}</span>
              <div>
                <p className="text-stone-200 text-sm font-medium">{rule.title}</p>
                <p className="text-stone-400 text-xs leading-relaxed mt-0.5">{rule.description}</p>
                {rule.citation && (
                  <p className="text-stone-500 text-[10px] mt-0.5 font-mono">{rule.citation}</p>
                )}
              </div>
            </div>
          ))}
          <a
            href={landType === 'BLM'
              ? 'https://www.blm.gov/programs/recreation/camping'
              : 'https://www.fs.usda.gov/visit/recreation'}
            target="_blank"
            rel="noreferrer"
            className="text-amber-400 text-xs underline block mt-2"
          >
            Official {landType === 'BLM' ? 'BLM' : 'USFS'} camping rules ↗
          </a>
        </div>
      )}
    </div>
  );
}
