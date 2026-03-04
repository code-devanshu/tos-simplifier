'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, ArrowLeft, Trash2, ExternalLink, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';
import { formatTimestamp } from '@/lib/utils';
import type { HistoryItem } from '@/lib/types';

function getSeverityIcon(result: HistoryItem['result']) {
  const dangerCount = result.sections?.filter((s) => s.severity === 'danger').length ?? 0;
  const warningCount = result.sections?.filter((s) => s.severity === 'warning').length ?? 0;

  if (dangerCount > 0) return { icon: XCircle, color: 'text-red-400', label: `${dangerCount} red flag${dangerCount !== 1 ? 's' : ''}` };
  if (warningCount > 0) return { icon: AlertTriangle, color: 'text-amber-400', label: `${warningCount} warning${warningCount !== 1 ? 's' : ''}` };
  return { icon: ShieldCheck, color: 'text-emerald-400', label: 'All clear' };
}

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem('legal-analyzer-history');
      if (stored) setHistory(JSON.parse(stored) as HistoryItem[]);
    } catch {
      // ignore
    }
  }, []);

  const clearAll = () => {
    if (!confirm('Clear all analysis history? This cannot be undone.')) return;
    localStorage.removeItem('legal-analyzer-history');
    setHistory([]);
  };

  const deleteItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    localStorage.setItem('legal-analyzer-history', JSON.stringify(updated));
  };

  const openResult = (item: HistoryItem) => {
    sessionStorage.setItem('legal-analyzer-pending', JSON.stringify(item.result));
    if (item.source !== 'Pasted Text') {
      sessionStorage.setItem('legal-analyzer-pending-source', item.source);
    } else {
      sessionStorage.removeItem('legal-analyzer-pending-source');
    }
    router.push('/results');
  };

  if (!mounted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-900 rounded-xl border border-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-slate-400" />
            Analysis History
          </h1>
          <p className="text-slate-500 text-sm mt-1">Saved locally in your browser.</p>
        </div>

        {history.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-slate-500 hover:text-red-400 text-sm transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-20">
          <Clock className="w-10 h-10 text-slate-700 mx-auto mb-4" />
          <p className="text-slate-500 text-sm mb-2">No analyses yet.</p>
          <p className="text-slate-600 text-xs mb-6">
            Analyses you run will be saved here automatically.
          </p>
          <Link
            href="/"
            className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            Run your first analysis →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const { icon: Icon, color, label } = getSeverityIcon(item.result);
            const isUrl = item.source !== 'Pasted Text';

            return (
              <div
                key={item.id}
                className="group relative rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-slate-700 transition-all duration-150"
              >
                <button
                  onClick={() => openResult(item)}
                  className="w-full text-left p-5 pr-14"
                >
                  <div className="flex items-start gap-4">
                    <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-100 text-sm font-medium truncate">
                        {isUrl ? item.source : 'Pasted Text'}
                        {isUrl && <ExternalLink className="inline-block ml-1.5 w-3 h-3 text-slate-600" />}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-slate-500 text-xs">{formatTimestamp(item.timestamp)}</span>
                        <span className={`text-xs font-medium ${color}`}>{label}</span>
                      </div>
                      {item.result.tldr && (
                        <p className="text-slate-500 text-xs mt-2 line-clamp-1">
                          {item.result.tldr}
                        </p>
                      )}
                    </div>
                  </div>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteItem(item.id);
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-700 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-150"
                  aria-label="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
