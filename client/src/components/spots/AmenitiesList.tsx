import {
  Droplet,
  Fire,
  Wifi,
  Lightning,
  Trash,
  Signpost,
  CurrencyDollar,
  People,
  ShieldCheck,
  Table,
} from 'react-bootstrap-icons';
import type { ComponentType } from 'react';

interface Props {
  tags: Record<string, string>;
}

interface AmenityDef {
  key: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

const AMENITIES: AmenityDef[] = [
  { key: 'drinking_water', label: 'Drinking water', icon: Droplet },
  { key: 'toilets', label: 'Toilets', icon: Signpost },
  { key: 'shower', label: 'Showers', icon: Droplet },
  { key: 'fire_pit', label: 'Fire pit', icon: Fire },
  { key: 'bbq', label: 'BBQ', icon: Fire },
  { key: 'picnic_table', label: 'Picnic table', icon: Table },
  { key: 'internet_access', label: 'WiFi', icon: Wifi },
  { key: 'electricity', label: 'Electricity', icon: Lightning },
  { key: 'waste_disposal', label: 'Waste disposal', icon: Trash },
  { key: 'fee', label: 'Fee required', icon: CurrencyDollar },
  { key: 'capacity', label: 'Sites', icon: People },
  { key: 'access', label: 'Access', icon: ShieldCheck },
];

export function AmenitiesList({ tags }: Props) {
  const available = AMENITIES.filter((a) => tags[a.key]);
  if (available.length === 0) return null;

  return (
    <div className="bg-stone-800 rounded-xl p-4">
      <p className="text-xs text-stone-400 uppercase tracking-wide mb-3 font-semibold">Amenities</p>
      <div className="flex flex-wrap gap-2">
        {available.map((amenity) => {
          const value = tags[amenity.key];
          const isYes = value === 'yes';
          const isNo = value === 'no';
          const Icon = amenity.icon;

          return (
            <span
              key={amenity.key}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${
                isNo
                  ? 'bg-stone-700 text-stone-500 line-through'
                  : 'bg-stone-700 text-stone-200'
              }`}
            >
              <Icon size={14} className={isNo ? 'text-stone-500' : 'text-amber-400'} />
              {amenity.label}
              {!isYes && !isNo && <span className="text-stone-400">({value})</span>}
            </span>
          );
        })}
      </div>
    </div>
  );
}
