import {
  DndContext,
  closestCenter,
  TouchSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { CampSpot, RouteLeg } from '../../types';
import RouteStopItem from './RouteStopItem';
import RouteLegConnector from './RouteLegConnector';

interface RouteStopListProps {
  spots: CampSpot[];
  legs: RouteLeg[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  onRemove: (id: string) => void;
  onSpotClick: (spot: CampSpot) => void;
  isLoadingLegs: boolean;
}

export default function RouteStopList({
  spots,
  legs,
  onReorder,
  onRemove,
  onSpotClick,
  isLoadingLegs,
}: RouteStopListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const fromIndex = spots.findIndex((s) => s.id === active.id);
    const toIndex = spots.findIndex((s) => s.id === over.id);
    if (fromIndex !== -1 && toIndex !== -1) {
      onReorder(fromIndex, toIndex);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={spots.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-0">
          {spots.map((spot, i) => (
            <div key={spot.id}>
              {/* Leg connector before this stop */}
              <RouteLegConnector
                distanceMiles={legs[i]?.distanceMiles ?? null}
                durationFormatted={legs[i]?.durationFormatted ?? null}
                isLoading={isLoadingLegs}
              />
              <RouteStopItem
                spot={spot}
                index={i}
                onRemove={onRemove}
                onClick={onSpotClick}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
