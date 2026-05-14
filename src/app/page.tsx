import { AlphabetGrid } from '@/components/AlphabetGrid';
import { FLAGS } from '@/data/flags';

export const metadata = {
  title: 'PRISMFLAGS — CLI引数一般化事典',
};

export default function HomePage() {
  const toolCount = new Set(FLAGS.flatMap(f => f.tools.map(t => t.tool))).size;
  const flagCount = FLAGS.length;

  return (
    <>
      {/* Hero */}
      <div className="px-5 py-8 text-center border-b border-theme">
        <h1 className="text-xl font-bold tracking-wide mb-2 text-primary">
          CLI引数を、<span className="text-purple">プリズム</span>で分解する。
        </h1>
        <p className="text-dim text-sm">
          1つのフラグが、ツールによってどう変わるか。横断的に可視化する事典。
        </p>
        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center">
            <p className="text-purple text-2xl font-bold">{flagCount}</p>
            <p className="text-muted text-[10px] tracking-widest">FLAGS</p>
          </div>
          <div className="text-muted self-center">×</div>
          <div className="text-center">
            <p className="text-purple text-2xl font-bold">{toolCount}</p>
            <p className="text-muted text-[10px] tracking-widest">TOOLS</p>
          </div>
        </div>
      </div>

      {/* Alphabet */}
      <AlphabetGrid />

      {/* Intro text */}
      <div className="px-5 py-8 text-center">
        <p className="text-dim text-sm">
          アルファベットを選んで、フラグの世界を探索してください。
        </p>
      </div>
    </>
  );
}
