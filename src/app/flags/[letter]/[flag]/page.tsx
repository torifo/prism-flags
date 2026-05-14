import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getFlagById, getLettersWithFlags, getFlagsByLetter } from '@/data/flags';
import { AlphabetGrid } from '@/components/AlphabetGrid';
import { FlagDetail } from '@/components/FlagDetail';
import { CompareMatrix } from '@/components/CompareMatrix';
import { FlagCard } from '@/components/FlagCard';

export async function generateStaticParams() {
  return getLettersWithFlags().flatMap(letter =>
    getFlagsByLetter(letter).map(flag => ({ letter, flag: flag.id }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ letter: string; flag: string }>;
}) {
  const { letter, flag: flagId } = await params;
  const flag = getFlagById(letter, flagId);
  if (!flag) return { title: 'Not Found' };
  return {
    title: flag.long,
    description: flag.summary,
  };
}

export default async function FlagPage({
  params,
}: {
  params: Promise<{ letter: string; flag: string }>;
}) {
  const { letter, flag: flagId } = await params;
  const flag = getFlagById(letter, flagId);
  if (!flag) notFound();

  const siblings = getFlagsByLetter(letter).filter(f => f.id !== flagId);

  return (
    <>
      <AlphabetGrid activeLetter={letter} />

      <div className="flex min-h-[400px]">
        {/* Sidebar: other flags with the same letter */}
        <aside className="w-[250px] shrink-0 border-r border-theme p-2.5">
          <p className="text-muted text-[8px] tracking-[0.18em] mb-2 pb-1.5 border-b border-theme">
            {letter.toUpperCase()} — OTHER FLAGS
          </p>
          <Link
            href={`/flags/${letter}/`}
            className="block text-dim text-[9px] mb-2 hover:text-purple-light no-underline"
          >
            ← {letter.toUpperCase()} 一覧に戻る
          </Link>
          {siblings.map(f => (
            <FlagCard key={f.id} flag={f} letter={letter} />
          ))}
        </aside>

        {/* Detail */}
        <div className="flex-1 p-4">
          <FlagDetail flag={flag} />
          <CompareMatrix flag={flag} />
        </div>
      </div>
    </>
  );
}
