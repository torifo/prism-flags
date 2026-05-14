'use client';

import { useEffect, useState } from 'react';
import { THEMES, Theme, DEFAULT_THEME, STORAGE_KEY } from '@/lib/theme';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    if (saved && THEMES.includes(saved as Theme)) {
      setTheme(saved as Theme);
    }
  }, []);

  function applyTheme(t: Theme) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem(STORAGE_KEY, t);
    setTheme(t);
  }

  if (!mounted) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted text-[9px] tracking-widest">THEME</span>
      {THEMES.map(t => (
        <button
          key={t}
          onClick={() => applyTheme(t)}
          title={t.charAt(0).toUpperCase() + t.slice(1)}
          aria-label={`テーマを${t}に切替`}
          className={[
            'w-4 h-4 rounded-full border-2 transition-all',
            t === 'black'  ? 'bg-[#050508] border-[#444]' : '',
            t === 'purple' ? 'bg-[#7c3aed] border-transparent' : '',
            t === 'white'  ? 'bg-[#f8f9fc] border-[#bbb]' : '',
            theme === t ? 'outline outline-2 outline-offset-2 outline-[var(--purple-light)]' : '',
          ].join(' ')}
        />
      ))}
    </div>
  );
}
