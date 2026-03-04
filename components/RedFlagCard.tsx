import { AlertOctagon } from 'lucide-react';

export function RedFlagCard({ flags }: { flags: string[] }) {
  if (flags.length === 0) return null;

  return (
    <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-red-900/50 flex items-center justify-center shrink-0">
          <AlertOctagon className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 className="text-red-300 font-bold text-lg">Watch Out For These</h2>
          <p className="text-red-400/70 text-xs">
            {flags.length} serious concern{flags.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      <ul className="space-y-2.5">
        {flags.map((flag, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1.5 w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="text-red-200 text-sm leading-relaxed">{flag}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
