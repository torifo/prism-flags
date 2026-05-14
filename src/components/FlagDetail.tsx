import { Flag } from '@/data/flags';

const IMPACT_LABELS: Record<number, string> = {
  1: 'LOW — 副作用なし',
  2: 'LOW-MED',
  3: 'MEDIUM',
  4: 'HIGH — 注意',
  5: 'CRITICAL — 破壊的',
};

export function FlagDetail({ flag }: { flag: Flag }) {
  const maxImpact = Math.max(...flag.tools.map(t => t.impact));

  return (
    <div>
      <h1 className="text-xl font-bold text-primary">
        {flag.short && <span>{flag.short} / </span>}
        <span className="text-purple">{flag.long}</span>
      </h1>
      <p className="text-dim text-sm mt-1">{flag.summary}</p>

      {/* Impact bar */}
      <div className="flex items-center gap-3 mt-3">
        <span className="text-dim text-[9px]">操作の重み</span>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className="block w-5 h-1.5 rounded-sm"
              style={{
                background: i < maxImpact ? 'var(--purple)' : 'var(--bar-off)',
                boxShadow: i < maxImpact ? '0 0 4px var(--purple)' : 'none',
              }}
            />
          ))}
        </div>
        <span className="text-muted text-[8px]">{IMPACT_LABELS[maxImpact]}</span>
      </div>
    </div>
  );
}
