import { useMemo, useState } from 'react';
import { ArrowLeft, GeoAltFill, Cursor, Clock, Signpost, ChatDots, Map } from 'react-bootstrap-icons';
import type { CampSpot, RouteWaypoint } from '../../types';
import { useRouting } from '../../hooks/useRouting';
import { useMultiStopRoute } from '../../hooks/useMultiStopRoute';
import { useRoutePois } from '../../hooks/useRoutePois';
import { useTripChat } from '../../hooks/useTripChat';
import { useLocationStore, useVanStore } from '../../store';
import { CampingMap } from '../map/CampingMap';
import TripChat from './TripChat';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface RouteDetailViewProps {
  spot: CampSpot;
  onBack: () => void;
}

export default function RouteDetailView({ spot, onBack }: RouteDetailViewProps) {
  const vanProfile = useVanStore((s) => s.profile);
  const lat = useLocationStore((s) => s.lat);
  const lng = useLocationStore((s) => s.lng);

  // Single-destination route for distance/duration display
  const { data: routeInfo, isLoading: routeLoading } = useRouting(spot.lat, spot.lng);

  // Also get the base route with geometry (userLocation -> destination)
  // We wrap the destination in a CampSpot array for useMultiStopRoute
  const baseDestSpots: CampSpot[] = useMemo(() => [spot], [spot]);
  const { data: baseRouteData } = useMultiStopRoute(baseDestSpots);

  // Fetch real POIs along the base route geometry
  const { data: routePoiData, isLoading: poisLoading } = useRoutePois(baseRouteData?.geometry);
  const routeReady = !!routePoiData && !poisLoading;

  // Chat hook with real POI data
  const { messages, waypoints, sendMessage, isLoading: chatLoading } = useTripChat({
    spot,
    vanProfile,
    routeInfo: routeInfo ?? null,
    routePoiSegments: routePoiData?.segments ?? null,
  });

  // When AI adds waypoints, build multi-stop route
  const hasAiWaypoints = waypoints.length > 0;

  const aiWaypointSpots: CampSpot[] = useMemo(() =>
    waypoints.map((wp, i) => ({
      id: `ai-waypoint-${i}`,
      name: wp.name,
      lat: wp.lat,
      lng: wp.lng,
      landType: 'unknown' as const,
      source: 'ioverlander' as const,
    })),
    [waypoints]
  );

  const multiStopSpots: CampSpot[] = useMemo(() =>
    [...aiWaypointSpots, { ...spot, id: `dest-${spot.id}` }],
    [aiWaypointSpots, spot]
  );

  const { data: multiRouteData } = useMultiStopRoute(
    hasAiWaypoints ? multiStopSpots : []
  );

  // Route geometry: use multi-stop if AI waypoints, otherwise use base route
  const routeGeometry = hasAiWaypoints
    ? (multiRouteData?.geometry ?? null)
    : (baseRouteData?.geometry ?? null);

  // Build waypoint markers for the map
  const routeWaypointMarkers: RouteWaypoint[] = useMemo(() => {
    const markers: RouteWaypoint[] = [];

    if (lat != null && lng != null) {
      markers.push({ lat, lng, index: 0, name: 'Start' });
    }

    waypoints.forEach((wp, i) => {
      markers.push({ lat: wp.lat, lng: wp.lng, index: i + 1, name: wp.name });
    });

    markers.push({
      lat: spot.lat,
      lng: spot.lng,
      index: waypoints.length + 1,
      name: spot.name,
    });

    return markers;
  }, [lat, lng, waypoints, spot]);

  // Display data
  const displayDistance = hasAiWaypoints && multiRouteData
    ? Math.round(multiRouteData.totalDistanceMiles)
    : routeInfo
      ? Math.round(routeInfo.distanceMiles)
      : null;

  const displayDuration = hasAiWaypoints && multiRouteData
    ? multiRouteData.totalDurationFormatted
    : routeInfo?.durationFormatted ?? null;

  const stopCount = waypoints.length;

  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${spot.lat},${spot.lng}&travelmode=driving`;

  const [chatMinimized, setChatMinimized] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-stone-800">
        <button
          onClick={onBack}
          className="p-1.5 text-stone-400 hover:text-stone-200 transition-colors"
          aria-label="Back to saved locations"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-semibold text-stone-100 truncate">{spot.name}</h2>
        </div>
        <button
          onClick={() => setChatMinimized(!chatMinimized)}
          className="p-1.5 text-stone-400 hover:text-amber-400 transition-colors"
          aria-label={chatMinimized ? 'Show chat' : 'Show map'}
        >
          {chatMinimized ? <ChatDots size={20} /> : <Map size={20} />}
        </button>
      </div>

      {/* Map section — expands when chat is minimized */}
      <div className={`flex-shrink-0 relative ${chatMinimized ? 'flex-1' : 'h-48'}`}>
        <CampingMap
          key={chatMinimized ? 'map-full' : 'map-small'}
          onSpotSelect={() => {}}
          mode="route"
          routeGeometry={routeGeometry}
          routeWaypoints={routeWaypointMarkers.length >= 2 ? routeWaypointMarkers : null}
        />
      </div>

      {/* Route summary */}
      <div className="px-4 py-3 border-b border-stone-800">
        {routeLoading ? (
          <div className="flex items-center justify-center py-2">
            <LoadingSpinner size="sm" />
            <span className="text-xs text-stone-400 ml-2">Calculating route...</span>
          </div>
        ) : displayDistance != null ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <GeoAltFill size={14} className="text-amber-400" />
                <span className="text-sm font-semibold text-stone-100">{displayDistance} mi</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} className="text-amber-400" />
                <span className="text-sm font-semibold text-stone-100">{displayDuration}</span>
              </div>
              {stopCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Signpost size={14} className="text-amber-400" />
                  <span className="text-sm text-stone-400">{stopCount} {stopCount === 1 ? 'stop' : 'stops'}</span>
                </div>
              )}
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-amber-500 text-stone-950 font-semibold text-xs py-2 px-3 rounded-lg hover:bg-amber-400 transition-colors"
            >
              <Cursor size={12} />
              Navigate
            </a>
          </div>
        ) : (
          <p className="text-xs text-stone-500 text-center">Enable location to see route</p>
        )}
      </div>

      {/* Chat section — hidden when minimized */}
      {!chatMinimized && (
        <div className="flex-1 min-h-0">
          <TripChat
            messages={messages}
            onSendMessage={sendMessage}
            isLoading={chatLoading}
            spotName={spot.name}
            routeReady={routeReady}
          />
        </div>
      )}
    </div>
  );
}
