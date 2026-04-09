interface RouteLegConnectorProps {
  distanceMiles: number | null;
  durationFormatted: string | null;
  isLoading: boolean;
}

export default function RouteLegConnector({
  distanceMiles,
  durationFormatted,
  isLoading,
}: RouteLegConnectorProps) {
  return (
    <div className="flex items-center gap-2 py-1 pl-[15px]">
      <div className="w-0.5 h-6 border-l-2 border-dashed border-stone-700" />
      {isLoading ? (
        <div className="animate-pulse bg-stone-800 rounded h-3 w-24" />
      ) : distanceMiles != null && durationFormatted != null ? (
        <span className="text-xs text-stone-500 font-medium bg-stone-900 border border-stone-800 rounded-full px-2.5 py-0.5">
          {durationFormatted} · {Math.round(distanceMiles)} mi
        </span>
      ) : null}
    </div>
  );
}
