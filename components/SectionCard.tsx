'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';
import { cn, severityLabel } from '@/lib/utils';
import type { Section } from '@/lib/types';

const severityConfig = {
  safe: {
    badge: 'bg-emerald-900/40 text-emerald-300 border-emerald-800/60',
    border: 'border-emerald-900/40',
    bg: 'bg-emerald-950/20',
    icon: ShieldCheck,
    iconColor: 'text-emerald-400',
  },
  warning: {
    badge: 'bg-amber-900/40 text-amber-300 border-amber-800/60',
    border: 'border-amber-900/40',
    bg: 'bg-amber-950/20',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
  },
  danger: {
    badge: 'bg-red-900/40 text-red-300 border-red-800/60',
    border: 'border-red-900/40',
    bg: 'bg-red-950/20',
    icon: XCircle,
    iconColor: 'text-red-400',
  },
};

export function SectionCard({ section }: { section: Section }) {
  const [expanded, setExpanded] = useState(false);
  const config = severityConfig[section.severity];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'rounded-xl border p-5 transition-all duration-200',
        config.border,
        config.bg
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <Icon className={cn('w-5 h-5 mt-0.5 shrink-0', config.iconColor)} />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-100 text-sm">{section.title}</h3>
              <span
                className={cn(
                  'text-xs font-medium px-2 py-0.5 rounded-full border',
                  config.badge
                )}
              >
                {severityLabel(section.severity)}
              </span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{section.summary}</p>
          </div>
        </div>

        {section.details && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
            aria-label={expanded ? 'Collapse details' : 'Expand details'}
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {expanded && section.details && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <p className="text-slate-400 text-sm leading-relaxed">{section.details}</p>
        </div>
      )}
    </div>
  );
}
