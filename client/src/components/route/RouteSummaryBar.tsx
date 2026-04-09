import { GeoAltFill } from 'react-bootstrap-icons';

interface RouteSummaryBarProps {
  totalDistanceMiles: number;
  totalDurationFormatted: string;
  stopCount: number;
  fuelTankGallons?: number;
  mpg?: number;
}

export default function RouteSummaryBar({
  totalDistanceMiles,
  totalDurationFormatted,
  stopCount,
  fuelTankGallons,
  mpg,
}: RouteSummaryBarProps) {
  const fuelNeeded = mpg ? totalDistanceMiles / mpg : null;
  const exceedsTank = fuelNeeded && fuelTankGallons ? fuelNeeded > fuelTankGallons : false;

  return (
    <div className="bg-stone-900 rounded-xl border border-stone-800 p-4 mb-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-stone-100">
            <GeoAltFill size={14} className="inline mr-1 text-amber-400" />
            {Math.round(totalDistanceMiles)} mi · {totalDurationFormatted}
          </p>
        </div>
        <span className="text-xs bg-stone-800 text-stone-400 rounded-full px-2.5 py-1">
          {stopCount} {stopCount === 1 ? 'stop' : 'stops'}
        </span>
      </div>
      {fuelNeeded !== null && (
        <p className={`text-xs mt-1 ${exceedsTank ? 'text-amber-400' : 'text-stone-500'}`}>
          ~ {fuelNeeded.toFixed(1)} gal needed
          {exceedsTank && ' · Exceeds tank — plan a fuel stop'}
        </p>
      )}
    </div>
  );
}
