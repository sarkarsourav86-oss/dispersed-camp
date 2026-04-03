import type { FireRestrictionResult } from '../../types';

interface Props {
  restriction: FireRestrictionResult;
}

export function FireRestrictionBanner({ restriction }: Props) {
  if (!restriction.restrictionsActive) return null;

  return (
    <div role="alert" className="bg-red-900/80 border border-red-700 rounded-xl p-3 flex gap-3 items-start">
      <span className="text-2xl flex-shrink-0">🔥</span>
      <div>
        <p className="text-red-200 font-semibold text-sm">Fire Restrictions Active</p>
        {restriction.message && (
          <p className="text-red-300 text-xs mt-0.5 leading-relaxed">{restriction.message}</p>
        )}
        {restriction.sourceUrl && (
          <a
            href={restriction.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-red-400 text-xs underline mt-1 inline-block"
          >
            Check current restrictions ↗
          </a>
        )}
      </div>
    </div>
  );
}
