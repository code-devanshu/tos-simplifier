'use client';

import { useEffect, useState } from 'react';
import { Globe, ShieldCheck, FileSearch, BookOpen, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type StepDef = {
  icon: React.ElementType;
  title: string;
  subtitle: string;
};

// URL mode — 4 real server-driven steps (indices 0-3)
const URL_STEPS: StepDef[] = [
  {
    icon: Globe,
    title: 'Connecting to website',
    subtitle: 'Sending a request to the target URL…',
  },
  {
    icon: ShieldCheck,
    title: 'Attempting to bypass bot protection',
    subtitle: 'Using ToS Simplifier AI Reader to render JavaScript and bypass blocks…',
  },
  {
    icon: FileSearch,
    title: 'Extracting document text',
    subtitle: 'Trying article extractor and direct fetch as fallbacks…',
  },
  {
    icon: Sparkles,
    title: 'Gemini is analyzing',
    subtitle: 'Identifying red flags, data practices, and your rights…',
  },
];

// Text mode — 2 real server-driven steps (indices 0-1)
const TEXT_STEPS: StepDef[] = [
  {
    icon: BookOpen,
    title: 'Processing your document',
    subtitle: 'Preparing the pasted text for analysis…',
  },
  {
    icon: Sparkles,
    title: 'Gemini is analyzing',
    subtitle: 'Identifying red flags, data practices, and your rights…',
  },
];

interface Props {
  /** Real step index received from the server — drives the loader directly */
  step: number;
  mode: 'url' | 'text';
}

export function CinematicLoader({ step, mode }: Props) {
  const steps = mode === 'url' ? URL_STEPS : TEXT_STEPS;
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setBlink((b) => !b), 530);
    return () => clearInterval(id);
  }, []);

  const progress = Math.round(((step + 1) / steps.length) * 100);

  return (
    /* Full-page overlay */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      {/* Card */}
      <div className="w-full max-w-md mx-4 rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl shadow-black/60">
        {/* Progress bar */}
        <div className="h-0.5 bg-slate-800">
          <div
            className="h-full bg-linear-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="px-6 pt-5 pb-2 flex items-center justify-between">
          <p className="text-slate-400 text-xs font-medium tracking-wide uppercase">
            Analyzing document
          </p>
          <span className="text-slate-600 text-xs tabular-nums">{progress}%</span>
        </div>

        {/* Steps */}
        <div className="px-6 pb-6 space-y-1">
          {steps.map((s, i) => {
            const isPast = i < step;
            const isActive = i === step;
            const isPending = i > step;
            const Icon = s.icon;

            return (
              <div
                key={i}
                className={cn(
                  'relative flex items-start gap-3.5 rounded-xl px-3 py-3 transition-all duration-400',
                  isActive && 'bg-indigo-950/40 border border-indigo-900/50',
                  isPast && 'opacity-35',
                  isPending && 'opacity-20',
                )}
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[1.85rem] top-[2.9rem] w-px h-[calc(100%-0.5rem)] bg-slate-800" />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300',
                    isActive && 'bg-indigo-900/60 border border-indigo-700/60',
                    isPast && 'bg-slate-900 border border-slate-700',
                    isPending && 'bg-slate-900 border border-slate-800',
                  )}
                >
                  {isActive ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  ) : (
                    <Icon
                      className={cn(
                        'w-4 h-4',
                        isPast ? 'text-slate-500' : 'text-slate-700',
                      )}
                    />
                  )}
                </div>

                {/* Text */}
                <div className="pt-1.5 min-w-0">
                  <p
                    className={cn(
                      'text-sm font-semibold leading-tight',
                      isActive && 'text-indigo-200',
                      isPast && 'text-slate-500',
                      isPending && 'text-slate-700',
                    )}
                  >
                    {s.title}
                  </p>
                  <p
                    className={cn(
                      'text-xs mt-0.5 leading-relaxed',
                      isActive ? 'text-slate-400' : 'text-slate-600',
                    )}
                  >
                    {s.subtitle}
                    {isActive && (
                      <span
                        className={cn(
                          'inline-block w-1.5 h-3 ml-0.5 rounded-sm bg-indigo-400 align-middle transition-opacity duration-100',
                          blink ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
