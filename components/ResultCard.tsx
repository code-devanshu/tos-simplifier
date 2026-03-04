'use client';

import { useState } from 'react';
import { Copy, Check, FileText } from 'lucide-react';
import { RedFlagCard } from './RedFlagCard';
import { SectionCard } from './SectionCard';
import { ExportButton } from './ExportButton';
import { encodeResult } from '@/lib/utils';
import type { AnalysisResult } from '@/lib/types';

export function ResultCard({
  result,
  source,
}: {
  result: AnalysisResult;
  source?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      const encoded = encodeResult(result);
      const shareUrl = `${window.location.origin}/results?data=${encoded}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('Could not copy link. Please copy the URL from your browser.');
    }
  };

  const dangerCount = result.sections.filter((s) => s.severity === 'danger').length;
  const warningCount = result.sections.filter((s) => s.severity === 'warning').length;
  const safeCount = result.sections.filter((s) => s.severity === 'safe').length;

  return (
    <div id="results-container" className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {source && (
            <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span className="truncate max-w-[300px]">{source}</span>
            </div>
          )}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-red-900/30 border-red-800/50 text-red-300">
              {dangerCount} Red Flag{dangerCount !== 1 ? 's' : ''}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-900/30 border-amber-800/50 text-amber-300">
              {warningCount} Warning{warningCount !== 1 ? 's' : ''}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full border bg-emerald-900/30 border-emerald-800/50 text-emerald-300">
              {safeCount} Safe
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-sm font-medium transition-all duration-150"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-400" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <ExportButton targetId="results-container" />
        </div>
      </div>

      {/* Red flags */}
      {result.redFlags && result.redFlags.length > 0 && (
        <RedFlagCard flags={result.redFlags} />
      )}

      {/* TL;DR */}
      <div className="rounded-xl border border-slate-700/60 bg-slate-900/60 p-6">
        <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">
          TL;DR
        </h2>
        <p className="text-slate-100 text-base leading-relaxed">{result.tldr}</p>
      </div>

      {/* Sections */}
      {result.sections && result.sections.length > 0 && (
        <div>
          <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-4">
            Breakdown by Category
          </h2>
          <div className="space-y-3">
            {result.sections.map((section, i) => (
              <SectionCard key={i} section={section} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
