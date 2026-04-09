import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, XLg, ChevronRight } from 'react-bootstrap-icons';
import type { CampSpot } from '../../types';
import { getCategoryConfig } from '../../data/iOverlanderCategories';
import { useLocationDetails } from '../../hooks/useLocationDetails';

interface RouteStopItemProps {
  spot: CampSpot;
  index: number;
  onRemove: (id: string) => void;
  onClick: (spot: CampSpot) => void;
}

export default function RouteStopItem({ spot, index, onRemove, onClick }: RouteStopItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: spot.id });

  const { data: location } = useLocationDetails(spot.lat, spot.lng);
  const category = spot.iOverlanderCategory ? getCategoryConfig(spot.iOverlanderCategory) : null;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const locationText = [location?.city, location?.state].filter(Boolean).join(', ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 ${isDragging ? 'opacity-50 scale-105 z-50 ring-2 ring-amber-500 rounded-xl' : ''}`}
    >
      {/* Drag handle + number */}
      <div className="flex flex-col items-center gap-1 shrink-0">
        <button
          {...attributes}
          {...listeners}
          className="p-2 touch-none cursor-grab active:cursor-grabbing text-stone-600 hover:text-stone-400"
          aria-label="Drag to reorder"
        >
          <GripVertical size={20} />
        </button>
        <div className="w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
          <span className="text-xs font-bold text-stone-950">{index + 1}</span>
        </div>
      </div>

      {/* Spot card */}
      <button
        onClick={() => onClick(spot)}
        className="flex-1 bg-stone-900 border border-stone-800 rounded-xl p-3 text-left hover:border-stone-700 transition-colors min-w-0"
      >
        <div className="flex items-start gap-2">
          {category && (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm"
              style={{ backgroundColor: category.color + '22' }}
            >
              {category.emoji}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-stone-100 truncate">{spot.name}</p>
            {locationText && (
              <p className="text-xs text-stone-500 truncate">{locationText}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              {category && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: category.color + '22', color: category.color }}
                >
                  {category.label}
                </span>
              )}
              {spot.dateVerified && (
                <span className="text-xs text-stone-600">
                  Verified {spot.dateVerified}
                </span>
              )}
            </div>
          </div>
          <ChevronRight size={14} className="text-stone-600 shrink-0 mt-1" />
        </div>
      </button>

      {/* Remove button */}
      <button
        onClick={() => onRemove(spot.id)}
        className="p-2 text-stone-600 hover:text-red-400 transition-colors shrink-0"
        aria-label="Remove stop"
      >
        <XLg size={14} />
      </button>
    </div>
  );
}
