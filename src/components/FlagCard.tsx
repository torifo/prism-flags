import Link from 'next/link';
import { Flag } from '@/data/flags';

function ImpactDots({ max, impact }: { max: number; impact: number }) {
  return (
    <div className="flex gap-1 items-center">
      <span className="text-muted text-[7px]">影響度</span>
      {Array.from({ length: max }, (_, i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: i < impact ? 'var(--purple)' : 'var(--bar-off)' }}
        />
      ))}
    </div>
  );
}

export function FlagCard({ flag, letter }: { flag: Flag; letter: string }) {
  const maxImpact = Math.max(...flag.tools.map(t => t.impact));
  const displayName = flag.short ? `${flag.short} / ${flag.long}` : flag.long;

  return (
    <Link
      href={`/flags/${letter}/${flag.id}/`}
      className="block p-3 rounded border border-transparent border-l-[3px] no-underline
                 hover:bg-surface2 hover:border-theme transition-all"
      style={{ borderLeftColor: 'transparent' }}
    >
      <p className="text-primary text-[11px] font-semibold">{displayName}</p>
      <p className="text-dim text-[9px] mt-0.5">{flag.summary}</p>
      <div className="flex gap-1 mt-1 flex-wrap">
        {flag.tools.map(t => (
          <span
            key={t.tool}
            className="bg-purple-dim border border-purple/20 text-purple-light text-[7px] px-1.5 py-0.5 rounded-sm"
          >
            {t.tool}
          </span>
        ))}
      </div>
      <div className="mt-1">
        <ImpactDots max={5} impact={maxImpact} />
      </div>
    </Link>
  );
}
