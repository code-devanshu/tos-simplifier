import { AnalyzerInput } from '@/components/AnalyzerInput';
import { ShieldCheck, AlertTriangle, XCircle, Zap, Lock, Eye, Globe, LayoutList, Target, X, Check } from 'lucide-react';

// --- Static example analyses shown on the home page ---
const EXAMPLES = [
  {
    id: 'ex1',
    service: 'MegaCorp Social',
    category: 'Social Media Platform',
    overallSeverity: 'danger',
    redFlagCount: 5,
    sections: [
      { severity: 'danger', label: 'Data Collection' },
      { severity: 'danger', label: 'Third-Party Sharing' },
      { severity: 'warning', label: 'Auto-Renewals' },
      { severity: 'danger', label: 'Legal & Arbitration' },
      { severity: 'safe', label: 'Your Rights' },
    ],
    tldr:
      'This platform collects biometric data, sells your browsing history to advertisers, and forces you into binding arbitration if anything goes wrong — meaning you can\'t sue them in court.',
  },
  {
    id: 'ex2',
    service: 'StreamFlix',
    category: 'Streaming Service',
    overallSeverity: 'warning',
    redFlagCount: 2,
    sections: [
      { severity: 'warning', label: 'Data Collection' },
      { severity: 'safe', label: 'Your Rights' },
      { severity: 'warning', label: 'Auto-Renewals & Billing' },
      { severity: 'safe', label: 'Account Termination' },
      { severity: 'safe', label: 'Third-Party Sharing' },
    ],
    tldr:
      'Mostly reasonable terms. Watch out for auto-renewal charges without advance notice, and be aware that viewing data is shared with marketing partners.',
  },
  {
    id: 'ex3',
    service: 'ReadDaily',
    category: 'Newsletter Service',
    overallSeverity: 'safe',
    redFlagCount: 0,
    sections: [
      { severity: 'safe', label: 'Data Collection' },
      { severity: 'safe', label: 'Your Rights' },
      { severity: 'safe', label: 'Auto-Renewals & Billing' },
      { severity: 'safe', label: 'Account Termination' },
      { severity: 'safe', label: 'Third-Party Sharing' },
    ],
    tldr:
      'Clean and simple terms. No data selling, easy cancellation anytime, and a clear 30-day data deletion policy when you leave.',
  },
];

const severityColors = {
  safe: {
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-800/40',
    badge: 'bg-emerald-900/50 text-emerald-300',
    icon: ShieldCheck,
    iconColor: 'text-emerald-400',
    dot: 'bg-emerald-500',
  },
  warning: {
    bg: 'bg-amber-950/30',
    border: 'border-amber-800/40',
    badge: 'bg-amber-900/50 text-amber-300',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    dot: 'bg-amber-400',
  },
  danger: {
    bg: 'bg-red-950/30',
    border: 'border-red-800/40',
    badge: 'bg-red-900/50 text-red-300',
    icon: XCircle,
    iconColor: 'text-red-400',
    dot: 'bg-red-500',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'ToS Simplifier',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tos-simplifier.vercel.app',
  description:
    'AI-powered Terms of Service and Privacy Policy analyzer. Paste any URL to get an instant plain-English breakdown with red flags highlighted.',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Web',
  browserRequirements: 'Requires JavaScript',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'URL scraping with bot protection bypass',
    'AI-powered red flag detection',
    'Plain English summaries',
    'Severity ratings per clause',
    'Multi-chunk document analysis',
    'Analysis history',
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      {/* Hero */}
      <div className="text-center mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium mb-6">
          <Zap className="w-3.5 h-3.5" />
          Powered by Gemini AI
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-5 leading-tight">
          Stop Agreeing to Things
          <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-400 to-violet-400">
            You Don't Understand
          </span>
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-xl mx-auto leading-relaxed">
          Paste any Terms of Service or Privacy Policy URL and get a plain-English breakdown in
          seconds — with red flags highlighted.
        </p>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 text-slate-500 text-xs">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Text never stored
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            Results in seconds
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5" />
            Plain English output
          </span>
        </div>
      </div>

      {/* Input section */}
      <div className="flex justify-center mb-24">
        <AnalyzerInput />
      </div>

      {/* Why use us */}
      <div className="mb-28">
        <div className="text-center mb-12">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-2">
            The difference
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
            Why not just ask Gemini directly?
          </h2>
          <p className="text-slate-400 text-sm mt-3 max-w-lg mx-auto leading-relaxed">
            Try pasting{' '}
            <span className="font-mono text-xs bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
              policy.medium.com/medium-privacy-policy-f03bf92035c9
            </span>{' '}
            into Gemini. Here's what happens.
          </p>
        </div>

        {/* Comparison table */}
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto mb-12">
          {/* Gemini column */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-slate-300 font-semibold text-sm">Generic AI (Gemini / ChatGPT)</span>
            </div>
            <ul className="space-y-3.5">
              {[
                'Can\'t open bot-protected URLs — gives you an error or outdated cached text',
                'Returns a wall of prose you still have to read through yourself',
                'No severity ratings — you don\'t know what\'s actually dangerous',
                'Misses arbitration clauses, auto-renewal traps, and biometric data clauses',
                'You have to know the right questions to ask',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed">
                  <X className="w-3.5 h-3.5 text-red-500/70 shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Us column */}
          <div className="rounded-2xl border border-indigo-800/50 bg-indigo-950/20 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-br from-indigo-950/30 to-violet-950/10 pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-7 h-7 rounded-lg bg-indigo-900/60 border border-indigo-700/40 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <span className="text-indigo-200 font-semibold text-sm">ToS Simplifier</span>
              </div>
              <ul className="space-y-3.5">
                {[
                  'Fetches any URL automatically — bypasses Cloudflare, JS-gated pages, and bot blocks',
                  'Color-coded sections: red flags, warnings, and safe clauses at a glance',
                  'Danger / Warning / Safe severity on every clause that matters',
                  'Purpose-built prompts tuned for arbitration, data selling, auto-renewals, and more',
                  'Just paste the URL — no prompting, no follow-up questions needed',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            {
              icon: Globe,
              color: 'text-sky-400',
              bg: 'bg-sky-950/30 border-sky-800/30',
              title: 'Scrapes any URL',
              body: 'Three-layer scraper: AI reader → article extractor → direct fetch. Handles Cloudflare, JS rendering, and login walls.',
            },
            {
              icon: LayoutList,
              color: 'text-violet-400',
              bg: 'bg-violet-950/30 border-violet-800/30',
              title: 'Structured output',
              body: 'Every policy broken into named sections with a severity badge, plain-English summary, and a TL;DR you can actually read.',
            },
            {
              icon: Target,
              color: 'text-rose-400',
              bg: 'bg-rose-950/30 border-rose-800/30',
              title: 'Legal-doc focused',
              body: 'Prompts tuned for the six clauses that hurt you most: data collection, arbitration, auto-billing, third-party sharing, and more.',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className={`rounded-xl border p-5 ${card.bg}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 bg-slate-900/60`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
                <h3 className="text-slate-100 font-semibold text-sm mb-1.5">{card.title}</h3>
                <p className="text-slate-400 text-xs leading-relaxed">{card.body}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Example analyses */}
      <div>
        <div className="text-center mb-10">
          <p className="text-slate-500 text-xs uppercase tracking-widest font-semibold mb-2">
            Example Analyses
          </p>
          <h2 className="text-2xl font-bold text-slate-200">See It In Action</h2>
          <p className="text-slate-400 text-sm mt-2">
            Here's what ToS Simplifier found in three common services.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {EXAMPLES.map((ex) => {
            const config = severityColors[ex.overallSeverity as keyof typeof severityColors];
            const Icon = config.icon;

            return (
              <div
                key={ex.id}
                className={`rounded-xl border p-5 flex flex-col gap-4 ${config.bg} ${config.border}`}
              >
                {/* Service header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-slate-100 text-base">{ex.service}</h3>
                    <p className="text-slate-500 text-xs mt-0.5">{ex.category}</p>
                  </div>
                  <div className="shrink-0">
                    <Icon className={`w-5 h-5 ${config.iconColor}`} />
                  </div>
                </div>

                {/* Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${config.badge}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                    {ex.redFlagCount > 0 ? `${ex.redFlagCount} Red Flags` : 'All Clear'}
                  </span>
                </div>

                {/* TL;DR */}
                <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">{ex.tldr}</p>

                {/* Section severity dots */}
                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/50">
                  {ex.sections.map((s, i) => {
                    const sc = severityColors[s.severity as keyof typeof severityColors];
                    return (
                      <div
                        key={i}
                        title={`${s.label}: ${s.severity}`}
                        className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border ${sc.bg} ${sc.border}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dot} shrink-0`} />
                        <span className="text-slate-400 text-[10px]">{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
    </>
  );
}
