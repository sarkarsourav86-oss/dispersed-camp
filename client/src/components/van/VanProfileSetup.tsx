import { useState } from 'react';
import { CheckCircleFill } from 'react-bootstrap-icons';
import { useVanStore } from '../../store';
import type { VanProfile, VanType, Clearance, Drivetrain } from '../../types';

interface Props {
  onComplete: () => void;
}

const VAN_TYPES: { value: VanType; label: string }[] = [
  { value: 'sprinter', label: 'Sprinter' },
  { value: 'transit', label: 'Transit' },
  { value: 'promaster', label: 'Promaster' },
  { value: 'truck-camper', label: 'Truck Camper' },
  { value: 'class-b', label: 'Class B' },
  { value: 'class-c', label: 'Class C' },
  { value: 'suv', label: 'SUV' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'other', label: 'Other' },
];

const CLEARANCES: { value: Clearance; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'standard', label: 'Standard' },
  { value: 'high', label: 'High' },
];

const DRIVETRAINS: { value: Drivetrain; label: string }[] = [
  { value: '2wd', label: '2WD' },
  { value: 'awd', label: 'AWD' },
  { value: '4wd', label: '4WD' },
];

export function VanProfileSetup({ onComplete }: Props) {
  const { profile, setProfile } = useVanStore();

  const [form, setForm] = useState<VanProfile>(profile ?? {
    vanType: 'sprinter',
    length: 20,
    clearance: 'standard',
    drivetrain: '2wd',
    waterTankGallons: 20,
    fuelTankGallons: 25,
    mpg: 15,
    peopleCount: 2,
    hasPet: false,
    hasSolar: false,
    hasGenerator: false,
    needsInternet: false,
  });

  const handleSave = () => {
    setProfile(form);
    onComplete();
  };

  const update = <K extends keyof VanProfile>(key: K, value: VanProfile[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="text-center pb-2">
        <h2 className="text-lg font-bold text-stone-100">Set Up Your Van</h2>
        <p className="text-sm text-stone-400">Tell us about your rig for personalized trip plans</p>
      </div>

      {/* Vehicle */}
      <div className="bg-stone-900 rounded-xl p-4 border border-stone-800 space-y-3">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold">Vehicle</p>

        <div>
          <label className="text-xs text-stone-400 mb-1 block">Van Type</label>
          <div className="grid grid-cols-3 gap-1.5">
            {VAN_TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => update('vanType', t.value)}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  form.vanType === t.value
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-stone-400 mb-1 block">Length (ft)</label>
            <input
              type="number"
              value={form.length}
              onChange={(e) => update('length', Number(e.target.value))}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-stone-100 outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-stone-400 mb-1 block">Clearance</label>
            <div className="flex gap-1">
              {CLEARANCES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => update('clearance', c.value)}
                  className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium ${
                    form.clearance === c.value
                      ? 'bg-amber-500 text-stone-950'
                      : 'bg-stone-800 text-stone-300'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-stone-400 mb-1 block">Drivetrain</label>
          <div className="flex gap-1.5">
            {DRIVETRAINS.map((d) => (
              <button
                key={d.value}
                onClick={() => update('drivetrain', d.value)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium ${
                  form.drivetrain === d.value
                    ? 'bg-amber-500 text-stone-950'
                    : 'bg-stone-800 text-stone-300'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tanks */}
      <div className="bg-stone-900 rounded-xl p-4 border border-stone-800 space-y-3">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold">Tanks + Fuel</p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-stone-400 mb-1 block">Water (gal)</label>
            <input
              type="number"
              value={form.waterTankGallons}
              onChange={(e) => update('waterTankGallons', Number(e.target.value))}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-stone-100 outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-stone-400 mb-1 block">Fuel (gal)</label>
            <input
              type="number"
              value={form.fuelTankGallons}
              onChange={(e) => update('fuelTankGallons', Number(e.target.value))}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-stone-100 outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label className="text-xs text-stone-400 mb-1 block">MPG</label>
            <input
              type="number"
              value={form.mpg}
              onChange={(e) => update('mpg', Number(e.target.value))}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-stone-100 outline-none focus:border-amber-500"
            />
          </div>
        </div>
      </div>

      {/* Crew */}
      <div className="bg-stone-900 rounded-xl p-4 border border-stone-800 space-y-3">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold">Crew</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-stone-400 mb-1 block">People</label>
            <input
              type="number"
              min={1}
              max={8}
              value={form.peopleCount}
              onChange={(e) => update('peopleCount', Number(e.target.value))}
              className="w-full bg-stone-800 border border-stone-700 rounded-lg px-3 py-1.5 text-sm text-stone-100 outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex items-end">
            <ToggleButton label="Pet on board" checked={form.hasPet} onChange={(v) => update('hasPet', v)} />
          </div>
        </div>
      </div>

      {/* Power + Connectivity */}
      <div className="bg-stone-900 rounded-xl p-4 border border-stone-800 space-y-3">
        <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold">Power + Connectivity</p>
        <div className="grid grid-cols-2 gap-2">
          <ToggleButton label="Solar" checked={form.hasSolar} onChange={(v) => update('hasSolar', v)} />
          <ToggleButton label="Generator" checked={form.hasGenerator} onChange={(v) => update('hasGenerator', v)} />
          <ToggleButton label="Need Internet" checked={form.needsInternet} onChange={(v) => update('needsInternet', v)} />
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <CheckCircleFill size={16} />
        Save Van Profile
      </button>
    </div>
  );
}

function ToggleButton({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-full px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
        checked
          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
          : 'bg-stone-800 text-stone-400 border border-stone-700'
      }`}
    >
      {checked ? '\u2713 ' : ''}{label}
    </button>
  );
}
