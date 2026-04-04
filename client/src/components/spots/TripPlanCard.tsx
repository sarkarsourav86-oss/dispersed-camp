import { useState } from 'react';
import {
  SignpostFill, Droplet, TruckFront, Clock, Stars,
  Shop, Wifi, ShieldCheck, ArrowRepeat,
  ChevronDown, ChevronUp, CheckCircleFill, XCircleFill,
} from 'react-bootstrap-icons';
import type { TripPlanResult } from '../../services/api';
import type { ComponentType } from 'react';

interface Props {
  plan: TripPlanResult;
}

interface SectionDef {
  key: Exclude<keyof TripPlanResult, 'readiness'>;
  title: string;
  Icon: ComponentType<{ size?: number; className?: string }>;
}

const SECTIONS: SectionDef[] = [
  { key: 'stopPlan', title: 'Route + Stop Plan', Icon: SignpostFill },
  { key: 'waterFuelMath', title: 'Water + Fuel Math', Icon: Droplet },
  { key: 'rigAccess', title: 'Rig Access Check', Icon: TruckFront },
  { key: 'arrivalStrategy', title: 'Arrival Strategy', Icon: Clock },
  { key: 'campConditions', title: 'Camp Conditions', Icon: Stars },
  { key: 'resupplyWaste', title: 'Resupply + Waste', Icon: Shop },
  { key: 'connectivity', title: 'Connectivity', Icon: Wifi },
  { key: 'rulesRisks', title: 'Rules + Risks', Icon: ShieldCheck },
  { key: 'backupPlan', title: 'Backup Plan', Icon: ArrowRepeat },
];

function parseBullets(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^[•\-*]\s*/, '').trim())
    .filter((line) => line.length > 0);
}

export function TripPlanCard({ plan }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['stopPlan', 'rigAccess', 'waterFuelMath']));

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {/* Trip Readiness */}
      {plan.readiness && (
        <div className="bg-stone-900 rounded-xl border border-stone-800 p-4">
          <p className="text-xs text-stone-400 uppercase tracking-wide font-semibold mb-3">Trip Readiness</p>

          {plan.readiness.goodIf?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-green-400 font-semibold mb-1.5">Good if:</p>
              <div className="space-y-1">
                {plan.readiness.goodIf.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircleFill size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-stone-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {plan.readiness.badIf?.length > 0 && (
            <div>
              <p className="text-xs text-red-400 font-semibold mb-1.5">Not ideal if:</p>
              <div className="space-y-1">
                {plan.readiness.badIf.map((item, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <XCircleFill size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-stone-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sections */}
      <div className="bg-stone-900 rounded-xl border border-stone-800 overflow-hidden divide-y divide-stone-800">
        {SECTIONS.map(({ key, title, Icon }) => {
          const content = plan[key];
          if (!content) return null;
          const isOpen = expanded.has(key);
          const bullets = parseBullets(content);

          return (
            <div key={key}>
              <button
                onClick={() => toggle(key)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-stone-800/50 transition-colors"
              >
                <Icon size={16} className="text-amber-400 flex-shrink-0" />
                <span className="text-sm font-medium text-stone-200 flex-1 text-left">{title}</span>
                {isOpen
                  ? <ChevronUp size={14} className="text-stone-500" />
                  : <ChevronDown size={14} className="text-stone-500" />
                }
              </button>
              {isOpen && bullets.length > 0 && (
                <div className="px-4 pb-3 pl-11 space-y-1.5">
                  {bullets.map((bullet, i) => {
                    const [label, ...rest] = bullet.split(':');
                    const hasLabel = rest.length > 0 && label.length < 30;
                    return (
                      <div key={i} className="text-sm leading-snug">
                        {hasLabel ? (
                          <>
                            <span className="text-stone-400 font-medium">{label}:</span>
                            <span className="text-stone-300">{rest.join(':')}</span>
                          </>
                        ) : (
                          <span className="text-stone-300">{bullet}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
