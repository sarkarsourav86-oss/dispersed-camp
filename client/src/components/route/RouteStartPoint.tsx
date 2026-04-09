import { GeoAltFill } from 'react-bootstrap-icons';
import { useLocationDetails } from '../../hooks/useLocationDetails';

interface RouteStartPointProps {
  lat: number | null;
  lng: number | null;
}

function StartPointLocation({ lat, lng }: { lat: number; lng: number }) {
  const { data: location } = useLocationDetails(lat, lng);

  const locationText = location?.city && location?.state
    ? `${location.city}, ${location.state}`
    : location?.state ?? 'Locating...';

  return <p className="text-xs text-stone-500">{locationText}</p>;
}

export default function RouteStartPoint({ lat, lng }: RouteStartPointProps) {
  return (
    <div className="flex items-center gap-3 mb-1">
      {lat != null && lng != null ? (
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">S</span>
        </div>
      ) : (
        <div className="w-8 h-8 border-2 border-dashed border-stone-600 rounded-full flex items-center justify-center shrink-0">
          <GeoAltFill size={12} className="text-stone-600" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-sm font-medium text-stone-200">Your Location</p>
        {lat != null && lng != null ? (
          <StartPointLocation lat={lat} lng={lng} />
        ) : (
          <p className="text-xs text-stone-500">Enable location for route start</p>
        )}
      </div>
    </div>
  );
}
