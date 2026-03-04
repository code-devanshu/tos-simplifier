'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ResultCard } from '@/components/ResultCard';
import type { AnalysisResult } from '@/lib/types';

function decodeResultSafe(encoded: string): AnalysisResult | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded))) as AnalysisResult;
  } catch {
    return null;
  }
}

export default function ResultsPage() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [source, setSource] = useState<string | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Primary: sessionStorage (in-app navigation from AnalyzerInput / History)
    const pending = sessionStorage.getItem('legal-analyzer-pending');
    const pendingSource = sessionStorage.getItem('legal-analyzer-pending-source') ?? undefined;
    if (pending) {
      try {
        setResult(JSON.parse(pending) as AnalysisResult);
        setSource(pendingSource);
      } catch { /* malformed */ }
      sessionStorage.removeItem('legal-analyzer-pending');
      sessionStorage.removeItem('legal-analyzer-pending-source');
    } else {
      // Fallback: URL param (share links)
      const params = new URLSearchParams(window.location.search);
      const data = params.get('data');
      const src = params.get('source') ?? undefined;
      if (data) setResult(decodeResultSafe(data));
      if (src) setSource(src);
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-slate-500 mb-6">No analysis data found.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Analyzer
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          New Analysis
        </Link>
        <h1 className="text-2xl font-bold text-white">Analysis Results</h1>
        <p className="text-slate-500 text-sm mt-1">
          AI-powered breakdown of the terms you submitted.
        </p>
      </div>

      <ResultCard result={result} source={source} />
    </div>
  );
}
