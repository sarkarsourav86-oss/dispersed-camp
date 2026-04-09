import { Shuffle, Cursor } from 'react-bootstrap-icons';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface RouteActionButtonsProps {
  onOptimize: () => void;
  onViewMap: () => void;
  isOptimizing: boolean;
  canOptimize: boolean;
}

export default function RouteActionButtons({
  onOptimize,
  onViewMap,
  isOptimizing,
  canOptimize,
}: RouteActionButtonsProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        onClick={onOptimize}
        disabled={!canOptimize || isOptimizing}
        className="flex-1 flex items-center justify-center gap-2 bg-stone-800 text-stone-200 border border-stone-700 font-semibold text-sm py-2.5 px-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-700 transition-colors"
      >
        {isOptimizing ? (
          <LoadingSpinner size="sm" />
        ) : (
          <Shuffle size={16} />
        )}
        {isOptimizing ? 'Optimizing...' : 'Optimize Route'}
      </button>
      <button
        onClick={onViewMap}
        className="flex-1 flex items-center justify-center gap-2 bg-amber-500 text-stone-950 font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-amber-400 transition-colors"
      >
        <Cursor size={16} />
        View on Map &rsaquo;
      </button>
    </div>
  );
}
