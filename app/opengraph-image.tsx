import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'ToS Simplifier — Understand Any Privacy Policy in Seconds';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99,102,241,0.25) 0%, transparent 70%)',
          }}
        />

        {/* Logo row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
          <div
            style={{
              width: 72,
              height: 72,
              background: '#4f46e5',
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
            }}
          >
            🛡️
          </div>
          <span style={{ color: '#e2e8f0', fontSize: 40, fontWeight: 700, letterSpacing: '-0.5px' }}>
            ToS Simplifier
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            color: '#ffffff',
            fontSize: 58,
            fontWeight: 800,
            textAlign: 'center',
            lineHeight: 1.15,
            maxWidth: 960,
            marginBottom: 24,
            letterSpacing: '-1px',
          }}
        >
          Understand Any Privacy Policy
          <br />
          <span style={{ color: '#818cf8' }}>in Seconds</span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            color: '#94a3b8',
            fontSize: 26,
            textAlign: 'center',
            maxWidth: 720,
            marginBottom: 44,
            lineHeight: 1.5,
          }}
        >
          AI-powered red flag detection — paste a URL and get a plain-English breakdown. Free.
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 14 }}>
          {[
            { label: 'Red Flags', color: '#fca5a5', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
            { label: 'Warnings', color: '#fcd34d', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
            { label: 'Safe Clauses', color: '#6ee7b7', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
          ].map((badge) => (
            <div
              key={badge.label}
              style={{
                background: badge.bg,
                border: `1px solid ${badge.border}`,
                borderRadius: 10,
                padding: '10px 22px',
                color: badge.color,
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {badge.label}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
