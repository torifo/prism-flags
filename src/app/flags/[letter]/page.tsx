import { notFound } from 'next/navigation';
import { getFlagsByLetter, getLettersWithFlags } from '@/data/flags';
import { AlphabetGrid } from '@/components/AlphabetGrid';
import { FlagCard } from '@/components/FlagCard';

export async function generateStaticParams() {
  return getLettersWithFlags().map(letter => ({ letter }));
}

export async function generateMetadata({ params }: { params: Promise<{ letter: string }> }) {
  const { letter } = await params;
  return { title: `${letter.toUpperCase()} のフラグ一覧` };
}

export default async function LetterPage({ params }: { params: Promise<{ letter: string }> }) {
  const { letter } = await params;
  const flags = getFlagsByLetter(letter);

  if (flags.length === 0) notFound();

  return (
    <>
      <AlphabetGrid activeLetter={letter} />
      <div className="px-5 py-4">
        <p className="text-muted text-[8px] tracking-[0.18em] mb-3">
          {letter.toUpperCase()} — {flags.length} FLAG{flags.length > 1 ? 'S' : ''}
        </p>
        <div className="flex flex-col gap-1">
          {flags.map(flag => (
            <FlagCard key={flag.id} flag={flag} letter={letter} />
          ))}
        </div>
      </div>
    </>
  );
}
