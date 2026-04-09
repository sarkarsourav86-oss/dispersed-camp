import { useState, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchTripChat } from '../services/api';
import { useLocationStore } from '../store';
import { useLocationDetails } from './useLocationDetails';
import type { ChatMessage, TripChatWaypoint, CampSpot, RouteResult, VanProfile, RoutePoiSegment } from '../types';

interface UseTripChatOptions {
  spot: CampSpot;
  vanProfile: VanProfile | null;
  routeInfo: RouteResult | null;
  routePoiSegments: RoutePoiSegment[] | null;
}

// Only these categories are useful for trip stop planning
const RELEVANT_CATEGORIES = new Set([
  'Campground', 'Informal Campsite', 'Wild Camping',
  'Water', 'Propane',
]);

function formatPoiContext(segments: RoutePoiSegment[]): string {
  const lines: string[] = ['REAL VERIFIED STOPS ALONG THE ROUTE (use ONLY these — never invent locations):'];

  for (const seg of segments) {
    const relevantPois = seg.pois.filter((p) => RELEVANT_CATEGORIES.has(p.category));
    if (relevantPois.length === 0) {
      lines.push(`\nMile ${seg.startMile}-${seg.endMile}: (no services found)`);
      continue;
    }

    lines.push(`\nMile ${seg.startMile}-${seg.endMile}:`);

    // Group by category, take closest 2 per category
    const byCategory = new Map<string, typeof seg.pois>();
    for (const poi of relevantPois) {
      const list = byCategory.get(poi.category) ?? [];
      list.push(poi);
      byCategory.set(poi.category, list);
    }

    for (const [category, pois] of byCategory) {
      // Sort by distance from route, take 2 closest
      const best = [...pois].sort((a, b) => a.milesFromRoute - b.milesFromRoute).slice(0, 2);
      for (const poi of best) {
        lines.push(`  ${category}: "${poi.name}" mile ${poi.mileAlongRoute} (${poi.milesFromRoute}mi off) [${poi.lat.toFixed(4)}, ${poi.lng.toFixed(4)}]`);
      }
    }
  }

  return lines.join('\n');
}

export function useTripChat({ spot, vanProfile, routeInfo, routePoiSegments }: UseTripChatOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [waypoints, setWaypoints] = useState<TripChatWaypoint[]>([]);

  const lat = useLocationStore((s) => s.lat);
  const lng = useLocationStore((s) => s.lng);
  const { data: startLocationDetails } = useLocationDetails(lat, lng);

  const mutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const newMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];

      const request = {
        messages: newMessages,
        spot: {
          name: spot.name,
          lat: spot.lat,
          lng: spot.lng,
          category: spot.iOverlanderCategory,
          description: spot.description,
        },
        startLocation: lat != null && lng != null ? {
          lat,
          lng,
          city: startLocationDetails?.city ?? null,
          state: startLocationDetails?.state ?? null,
        } : null,
        routePoiContext: routePoiSegments ? formatPoiContext(routePoiSegments) : null,
        vanProfile: vanProfile ? {
          vanType: vanProfile.vanType,
          lengthFt: vanProfile.length,
          clearance: vanProfile.clearance,
          drivetrain: vanProfile.drivetrain,
          waterTankGal: vanProfile.waterTankGallons,
          fuelTankGal: vanProfile.fuelTankGallons,
          mpg: vanProfile.mpg,
          peopleCount: vanProfile.peopleCount,
          hasPet: vanProfile.hasPet,
          hasSolar: vanProfile.hasSolar,
          hasGenerator: vanProfile.hasGenerator,
          needsInternet: vanProfile.needsInternet,
        } : null,
        routeInfo: routeInfo ? {
          distanceMiles: routeInfo.distanceMiles,
          durationSeconds: routeInfo.durationSeconds,
          durationFormatted: routeInfo.durationFormatted,
        } : null,
      };

      return { response: await fetchTripChat(request), newMessages };
    },
    onSuccess: ({ response, newMessages }) => {
      const assistantMessage: ChatMessage = { role: 'assistant', content: response.message };
      setMessages([...newMessages, assistantMessage]);

      if (response.waypoints && response.waypoints.length > 0) {
        setWaypoints(response.waypoints);
      }
    },
  });

  const sendMessage = useCallback((text: string) => {
    mutation.mutate(text);
  }, [mutation]);

  const resetChat = useCallback(() => {
    setMessages([]);
    setWaypoints([]);
  }, []);

  return {
    messages,
    waypoints,
    sendMessage,
    resetChat,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
}
