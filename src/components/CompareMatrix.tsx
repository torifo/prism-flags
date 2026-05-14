'use client';

import { useState } from 'react';
import { Flag } from '@/data/flags';
import { TOOLS } from '@/data/tools';

export function CompareMatrix({ flag }: { flag: Flag }) {
  const availableTools = flag.tools.map(t => t.tool);
  const [selected, setSelected] = useState<Set<string>>(new Set(availableTools.slice(0, 3)));

  function toggle(tool: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(tool) ? next.delete(tool) : next.add(tool);
      return next;
    });
  }

  const rows = flag.tools.filter(t => selected.has(t.tool));

  return (
    <div>
      <p className="text-muted text-[8px] tracking-[0.18em] mb-2 pt-3 border-t border-theme mt-4">
        COMPARE TOOLS — 比較マトリクス
      </p>

      {/* Tool toggles */}
      <div className="flex gap-1.5 flex-wrap mb-3">
        {availableTools.map(toolId => {
          const tool = TOOLS.find(t => t.id === toolId);
          const isOn = selected.has(toolId);
          return (
            <button
              key={toolId}
              onClick={() => toggle(toolId)}
              className={[
                'text-[9px] px-2 py-1 rounded border transition-all',
                isOn
                  ? 'bg-purple-dim border-purple text-purple-light'
                  : 'bg-surface2 border-theme text-dim hover:border-purple/50',
              ].join(' ')}
            >
              {tool?.label ?? toolId}
            </button>
          );
        })}
      </div>

      {/* Matrix table */}
      {rows.length === 0 ? (
        <p className="text-muted text-[10px] py-4 text-center">ツールを選択してください</p>
      ) : (
        <table className="w-full text-[10px] border-collapse">
          <thead>
            <tr>
              {['TOOL', 'SYNTAX', '動作', '重み'].map(h => (
                <th key={h} className="text-left text-muted text-[7px] tracking-widest px-2 py-1 border-b border-theme font-normal">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.tool} className="border-b border-theme last:border-0">
                <td className="px-2 py-1.5 text-purple-light font-semibold">{TOOLS.find(t => t.id === row.tool)?.label ?? row.tool}</td>
                <td className="px-2 py-1.5 font-mono text-primary">{row.syntax}</td>
                <td className="px-2 py-1.5 text-dim">{row.description}</td>
                <td className="px-2 py-1.5">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className="block w-1.5 h-1.5 rounded-full"
                        style={{ background: i < row.impact ? 'var(--purple)' : 'var(--bar-off)' }}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
