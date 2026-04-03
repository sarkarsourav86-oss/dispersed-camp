import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.markercluster';
import { useLocationStore, useSpotsStore, useSettingsStore } from '../../store';
import { useNearbySpots } from '../../hooks/useNearbySpots';
import { useLandOverlays } from '../../hooks/useLandOverlays';
import type { CampSpot } from '../../types';
import { LoadingSpinner } from '../shared/LoadingSpinner';

// Fix default marker icon paths broken by Vite
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const CAMP_ICON = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:#d97706;border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,0.4)"><div style="transform:rotate(45deg);width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:14px">⛺</div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

interface Props {
  onSpotSelect: (spot: CampSpot) => void;
}

export function CampingMap({ onSpotSelect }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const hasFlownToUser = useRef(false);
  const userCircleRef = useRef<L.Circle | null>(null);
  const blmLayerRef = useRef<L.GeoJSON | null>(null);
  const usfsLayerRef = useRef<L.GeoJSON | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const topoLayerRef = useRef<L.TileLayer | null>(null);

  const { lat, lng, searchLocation } = useLocationStore();
  const { selectSpot } = useSpotsStore();
  const { showBLM, showUSFS, showTopoMap } = useSettingsStore();

  const [bbox, setBbox] = useState<{ west: number; south: number; east: number; north: number } | null>(null);

  const { data: spots = [], isLoading: spotsLoading } = useNearbySpots();
  const { data: land } = useLandOverlays(bbox);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [39.5, -98.35],
      zoom: 5,
      zoomControl: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const osmTile = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    const topoTile = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://opentopomap.org">OpenTopoMap</a>',
      maxZoom: 17,
      opacity: 0,
    }).addTo(map);

    const cluster = (L as unknown as { markerClusterGroup: (opts: object) => L.MarkerClusterGroup }).markerClusterGroup({
      maxClusterRadius: 60,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
    });
    map.addLayer(cluster);

    map.on('moveend', () => {
      const b = map.getBounds();
      setBbox({
        west: b.getWest(),
        south: b.getSouth(),
        east: b.getEast(),
        north: b.getNorth(),
      });
    });

    mapRef.current = map;
    clusterRef.current = cluster;
    tileLayerRef.current = osmTile;
    topoLayerRef.current = topoTile;

    return () => { map.remove(); mapRef.current = null; };
  }, []);

  // Fly to user location on first fix only; update blue dot silently after
  useEffect(() => {
    if (!lat || !lng || !mapRef.current) return;

    if (!hasFlownToUser.current) {
      hasFlownToUser.current = true;
      mapRef.current.flyTo([lat, lng], 10, { duration: 1.5 });
    }

    if (userCircleRef.current) {
      userCircleRef.current.setLatLng([lat, lng]);
    } else {
      userCircleRef.current = L.circle([lat, lng], {
        radius: 30,
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(mapRef.current);
    }
  }, [lat, lng]);

  // Fly to search location
  useEffect(() => {
    if (searchLocation && mapRef.current) {
      mapRef.current.flyTo([searchLocation.lat, searchLocation.lng], 10, { duration: 1.5 });
    }
  }, [searchLocation]);

  // Topo layer toggle
  useEffect(() => {
    if (topoLayerRef.current) {
      topoLayerRef.current.setOpacity(showTopoMap ? 0.7 : 0);
    }
  }, [showTopoMap]);

  // Render camp spot markers
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;
    cluster.clearLayers();

    spots.forEach((spot) => {
      const marker = L.marker([spot.lat, spot.lng], { icon: CAMP_ICON });
      marker.bindTooltip(spot.name, { permanent: false, direction: 'top' });
      marker.on('click', () => {
        selectSpot(spot);
        onSpotSelect(spot);
      });
      cluster.addLayer(marker);
    });
  }, [spots, selectSpot, onSpotSelect]);

  // Render BLM overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !land?.blm) return;

    if (blmLayerRef.current) map.removeLayer(blmLayerRef.current);
    if (!showBLM) return;

    const layer = L.geoJSON(land.blm as GeoJSON.GeoJsonObject, {
      style: { color: '#d97706', fillColor: '#d97706', fillOpacity: 0.15, weight: 1 },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.ADMU_NAME ?? 'BLM Land';
        layer.bindTooltip(`🟠 BLM: ${name}`, { sticky: true });
      },
    }).addTo(map);
    blmLayerRef.current = layer;
  }, [land?.blm, showBLM]);

  // Render USFS overlay
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !land?.usfs) return;

    if (usfsLayerRef.current) map.removeLayer(usfsLayerRef.current);
    if (!showUSFS) return;

    const layer = L.geoJSON(land.usfs as GeoJSON.GeoJsonObject, {
      style: { color: '#16a34a', fillColor: '#16a34a', fillOpacity: 0.15, weight: 1 },
      onEachFeature: (feature, layer) => {
        const name = feature.properties?.FORESTNAME ?? 'National Forest';
        layer.bindTooltip(`🟢 USFS: ${name}`, { sticky: true });
      },
    }).addTo(map);
    usfsLayerRef.current = layer;
  }, [land?.usfs, showUSFS]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />
      {spotsLoading && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500] bg-stone-900/90 rounded-full px-4 py-2 flex items-center gap-2 text-sm text-stone-300">
          <LoadingSpinner size="sm" /> Finding spots…
        </div>
      )}
    </div>
  );
}
