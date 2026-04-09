import { ArrowLeft, XLg } from 'react-bootstrap-icons';
import { CampingMap } from '../map/CampingMap';
import type { CampSpot, MultiStopRouteResult, RouteWaypoint } from '../../types';
import { useLocationStore } from '../../store';

interface RouteMapViewProps {
  spots: CampSpot[];
  routeData: MultiStopRouteResult | undefined;
  onBack: () => void;
}

export default function RouteMapView({ spots, routeData, onBack }: RouteMapViewProps) {
  const lat = useLocationStore((s) => s.lat);
  const lng = useLocationStore((s) => s.lng);

  const waypoints: RouteWaypoint[] = [];

  // Start point
  if (lat != null && lng != null) {
    waypoints.push({ lat, lng, index: -1, name: 'Your Location' });
  }

  // Stop points
  spots.forEach((spot, i) => {
    waypoints.push({ lat: spot.lat, lng: spot.lng, index: i, name: spot.name });
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-stone-950 border-b border-stone-800 shrink-0 z-10">
        <button
          onClick={onBack}
          className="p-1 text-stone-400 hover:text-stone-100 transition-colors"
          aria-label="Back to route list"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-base font-semibold text-stone-100">Your Route</h2>
        {routeData ? (
          <span className="text-xs bg-stone-800 text-amber-400 rounded-full px-2.5 py-1 font-medium">
            {Math.round(routeData.totalDistanceMiles)} mi {routeData.totalDurationFormatted}
          </span>
        ) : (
          <div className="w-8" />
        )}
      </div>

      {/* Map */}
      <div className="flex-1 relative">
        <CampingMap
          key="route-map"
          mode="route"
          onSpotSelect={() => {}}
          routeGeometry={routeData?.geometry ?? null}
          routeWaypoints={waypoints}
        />
        {/* Close button on map */}
        <button
          onClick={onBack}
          className="absolute top-4 right-4 z-[500] w-10 h-10 bg-stone-900/90 rounded-lg flex items-center justify-center text-stone-300 hover:text-stone-100 border border-stone-700"
          aria-label="Close map"
        >
          <XLg size={16} />
        </button>
      </div>
    </div>
  );
}
