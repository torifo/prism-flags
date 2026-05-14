import Link from 'next/link';
import { getLettersWithFlags } from '@/data/flags';

const ALL_LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');

export function AlphabetGrid({ activeLetter }: { activeLetter?: string }) {
  const lettersWithData = new Set(getLettersWithFlags());

  return (
    <div className="px-5 py-3 border-b border-theme">
      <p className="text-muted text-[8px] tracking-[0.2em] mb-2">SELECT LETTER</p>
      <div className="flex flex-wrap gap-1">
        {ALL_LETTERS.map(letter => {
          const hasData = lettersWithData.has(letter);
          const isActive = letter === activeLetter?.toLowerCase();

          const base = 'w-7 h-7 rounded flex items-center justify-center text-[10px] font-semibold border transition-all';
          const style = isActive
            ? `${base} bg-purple text-white border-purple shadow-[0_0_10px_var(--purple)]`
            : hasData
            ? `${base} bg-surface2 text-primary border-theme hover:border-purple hover:text-purple-light`
            : `${base} bg-surface2 text-muted border-[var(--bar-off)] cursor-default`;

          if (!hasData) {
            return (
              <span key={letter} className={style}>
                {letter.toUpperCase()}
              </span>
            );
          }

          return (
            <Link
              key={letter}
              href={`/flags/${letter}/`}
              className={style}
              aria-label={`${letter.toUpperCase()} から始まるフラグ一覧`}
            >
              {letter.toUpperCase()}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
