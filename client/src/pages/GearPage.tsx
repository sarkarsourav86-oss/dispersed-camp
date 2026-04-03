import { GearChecklist } from '../components/gear/GearChecklist';

export function GearPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-100">Gear Checklist</h1>
          <p className="text-stone-400 text-sm mt-1">
            Customize your trip details and check off gear as you pack.
          </p>
        </div>
        <GearChecklist />
      </div>
    </div>
  );
}
