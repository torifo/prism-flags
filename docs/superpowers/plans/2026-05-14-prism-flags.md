# prism-flags Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CLI引数一般化事典「prism-flags」をNext.js App Router + Tailwind CSS v4で構築し、GitHub Pagesに静的エクスポートする。

**Architecture:** 2層ルーティング（`/flags/[letter]/` → `/flags/[letter]/[flag]/`）で全ページを `generateStaticParams` で事前生成。データは `src/data/flags.ts` に集約し、テーマはCSS変数 + `data-theme` 属性で切替。

**Tech Stack:** Next.js 15 (App Router, output: export), Tailwind CSS v4, Lucide-react, TypeScript, Jest + ts-jest (データ層テスト)

---

## File Map

```
prism-flags/
├── next.config.mjs                          # output:export, basePath, trailingSlash
├── postcss.config.mjs                       # @tailwindcss/postcss
├── jest.config.ts                           # jest設定
├── src/
│   ├── app/
│   │   ├── layout.tsx                       # グローバルレイアウト（ナビ・ThemeScript）
│   │   ├── page.tsx                         # トップページ（ヒーロー + AlphabetGrid）
│   │   ├── globals.css                      # CSS変数テーマ・グリッド背景・ベーススタイル
│   │   └── flags/
│   │       └── [letter]/
│   │           ├── page.tsx                 # フラグ一覧ページ
│   │           └── [flag]/
│   │               └── page.tsx             # フラグ詳細ページ
│   ├── components/
│   │   ├── AlphabetGrid.tsx                 # A〜Zグリッド（リンク付き）
│   │   ├── FlagCard.tsx                     # フラグ一覧アイテム
│   │   ├── FlagDetail.tsx                   # フラグ詳細（影響度バー）
│   │   ├── CompareMatrix.tsx                # ツール比較マトリクス（クライアント）
│   │   ├── ThemeSwitcher.tsx                # 3テーマ切替スウォッチ（クライアント）
│   │   └── SiteNavButtons.tsx               # slate-errors / anchor-ports 遷移ボタン
│   ├── data/
│   │   ├── tools.ts                         # ツール定義定数
│   │   └── flags.ts                         # Flag型定義 + 全フラグデータ + ルックアップ関数
│   └── lib/
│       └── theme.ts                         # テーマ名定数・初期化スクリプト文字列
└── __tests__/
    └── data/
        └── flags.test.ts                    # getFlagsByLetter / getFlagById のユニットテスト
```

---

## Task 1: プロジェクト初期化

**Files:**
- Create: `next.config.mjs`
- Create: `postcss.config.mjs`
- Modify: `package.json` (依存追加)
- Create: `.gitignore` 追記

- [ ] **Step 1: Next.jsプロジェクトを作成**

```bash
cd /Users/akito-shoji/dev/web/prism-flags
npx create-next-app@latest . \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --no-eslint \
  --import-alias "@/*"
```

プロンプトが出た場合はすべてデフォルト（Enter）。

- [ ] **Step 2: Tailwind CSS v4 + 関連パッケージをインストール**

```bash
npm install tailwindcss@latest @tailwindcss/postcss@latest lucide-react
npm install -D jest ts-jest @types/jest jest-environment-jsdom
```

- [ ] **Step 3: `next.config.mjs` を上書き**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/prism-flags',
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
```

- [ ] **Step 4: `postcss.config.mjs` を上書き（Tailwind v4用）**

```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

- [ ] **Step 5: `jest.config.ts` を作成**

```ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
};

export default config;
```

- [ ] **Step 6: `.gitignore` に追記**

既存の `.gitignore` の末尾に以下を追加：

```
.superpowers/
```

- [ ] **Step 7: ビルドが通ることを確認**

```bash
npm run build
```

Expected: `✓ Compiled successfully` + `out/` ディレクトリが生成される

- [ ] **Step 8: コミット**

```bash
git init
git add next.config.mjs postcss.config.mjs jest.config.ts package.json package-lock.json .gitignore
git commit -m "feat: initialize Next.js 15 project with Tailwind v4 and static export config"
```

---

## Task 2: データ層の実装

**Files:**
- Create: `src/data/tools.ts`
- Create: `src/data/flags.ts`
- Create: `__tests__/data/flags.test.ts`

- [ ] **Step 1: `src/data/tools.ts` を作成**

```ts
export const TOOLS = [
  { id: 'git',     label: 'Git',     color: '#f05033' },
  { id: 'docker',  label: 'Docker',  color: '#2496ed' },
  { id: 'npm',     label: 'npm',     color: '#cb3837' },
  { id: 'curl',    label: 'curl',    color: '#073551' },
  { id: 'kubectl', label: 'kubectl', color: '#326ce5' },
  { id: 'python',  label: 'Python',  color: '#3776ab' },
  { id: 'cargo',   label: 'Cargo',   color: '#dea584' },
  { id: 'sed',     label: 'sed',     color: '#4b5563' },
] as const;

export type ToolId = (typeof TOOLS)[number]['id'];
```

- [ ] **Step 2: `src/data/flags.ts` の型定義と初期データを作成**

```ts
import { ToolId } from './tools';

export type ImpactLevel = 1 | 2 | 3 | 4 | 5;

export interface ToolUsage {
  tool: ToolId;
  syntax: string;
  description: string;
  impact: ImpactLevel;
}

export interface Flag {
  id: string;
  letter: string;
  short?: string;
  long: string;
  summary: string;
  tools: ToolUsage[];
}

export const FLAGS: Flag[] = [
  {
    id: 'verbose',
    letter: 'v',
    short: '-v',
    long: '--verbose',
    summary: '詳細な出力・ログを有効にする',
    tools: [
      { tool: 'git',    syntax: 'git clone -v URL',     description: 'クローン進捗を詳細表示',   impact: 1 },
      { tool: 'npm',    syntax: 'npm install --verbose', description: 'インストールログを詳細出力', impact: 2 },
      { tool: 'curl',   syntax: 'curl -v URL',           description: 'HTTPヘッダ・通信全体を表示', impact: 2 },
      { tool: 'cargo',  syntax: 'cargo build -v',        description: 'コンパイル詳細を表示',      impact: 1 },
    ],
  },
  {
    id: 'version',
    letter: 'v',
    long: '--version',
    summary: 'バージョン情報を表示して終了',
    tools: [
      { tool: 'git',    syntax: 'git --version',    description: 'Gitのバージョンを表示して終了', impact: 1 },
      { tool: 'npm',    syntax: 'npm --version',    description: 'npmのバージョンを表示して終了', impact: 1 },
      { tool: 'python', syntax: 'python --version', description: 'Pythonのバージョンを表示',     impact: 1 },
      { tool: 'cargo',  syntax: 'cargo --version',  description: 'Cargoのバージョンを表示',      impact: 1 },
    ],
  },
  {
    id: 'volume',
    letter: 'v',
    short: '-v',
    long: '--volume',
    summary: 'ホストとコンテナ間のボリュームをマウント',
    tools: [
      { tool: 'docker', syntax: 'docker run -v /host:/container IMAGE', description: 'ホストパスをコンテナにマウント', impact: 3 },
    ],
  },
  {
    id: 'all',
    letter: 'a',
    short: '-a',
    long: '--all',
    summary: '隠しファイルを含むすべての対象を表示・処理',
    tools: [
      { tool: 'git',  syntax: 'git add -A',   description: '変更・削除・未追跡ファイルをすべてステージ', impact: 2 },
      { tool: 'curl', syntax: 'curl -a URL',   description: 'ファイルに追記モードで出力',               impact: 2 },
    ],
  },
  {
    id: 'force',
    letter: 'f',
    short: '-f',
    long: '--force',
    summary: '確認なしに強制実行する',
    tools: [
      { tool: 'git',    syntax: 'git push -f',           description: 'リモートを強制上書き（破壊的）',         impact: 5 },
      { tool: 'docker', syntax: 'docker rm -f CONTAINER', description: '実行中コンテナを強制削除',              impact: 4 },
      { tool: 'npm',    syntax: 'npm install --force',   description: 'キャッシュ無視・競合を無視してインストール', impact: 3 },
      { tool: 'sed',    syntax: 'sed -i -f script FILE',  description: 'スクリプトファイルから読み込み',         impact: 2 },
    ],
  },
  {
    id: 'help',
    letter: 'h',
    short: '-h',
    long: '--help',
    summary: 'ヘルプメッセージを表示して終了',
    tools: [
      { tool: 'git',     syntax: 'git --help',     description: 'Gitのヘルプを表示',      impact: 1 },
      { tool: 'docker',  syntax: 'docker --help',  description: 'Dockerのヘルプを表示',   impact: 1 },
      { tool: 'npm',     syntax: 'npm --help',     description: 'npmのヘルプを表示',      impact: 1 },
      { tool: 'kubectl', syntax: 'kubectl --help', description: 'kubectlのヘルプを表示',  impact: 1 },
      { tool: 'python',  syntax: 'python --help',  description: 'Pythonのヘルプを表示',   impact: 1 },
      { tool: 'cargo',   syntax: 'cargo --help',   description: 'Cargoのヘルプを表示',    impact: 1 },
    ],
  },
  {
    id: 'output',
    letter: 'o',
    short: '-o',
    long: '--output',
    summary: '出力先ファイルを指定する',
    tools: [
      { tool: 'curl',   syntax: 'curl -o file.html URL',       description: 'レスポンスをファイルに保存',          impact: 2 },
      { tool: 'sed',    syntax: 'sed -n -e "p" file > out.txt', description: '（リダイレクトで代替）',              impact: 2 },
      { tool: 'cargo',  syntax: 'cargo build --out-dir ./bin', description: '成果物の出力ディレクトリを指定',       impact: 2 },
    ],
  },
  {
    id: 'recursive',
    letter: 'r',
    short: '-r',
    long: '--recursive',
    summary: 'ディレクトリを再帰的に処理する',
    tools: [
      { tool: 'npm',    syntax: 'npm ls -r',          description: '依存関係を再帰的にリスト表示',         impact: 1 },
      { tool: 'docker', syntax: 'docker build --no-cache', description: '（再帰概念なし、類似オプション）', impact: 2 },
    ],
  },
  {
    id: 'quiet',
    letter: 'q',
    short: '-q',
    long: '--quiet',
    summary: '出力を抑制してサイレント実行する',
    tools: [
      { tool: 'git',  syntax: 'git clone -q URL', description: '進捗出力を抑制',              impact: 1 },
      { tool: 'npm',  syntax: 'npm install -q',   description: 'ログ出力を最小限に抑制',       impact: 1 },
      { tool: 'curl', syntax: 'curl -q URL',      description: 'プログレス・エラーを非表示',    impact: 1 },
    ],
  },
  {
    id: 'dry-run',
    letter: 'd',
    long: '--dry-run',
    summary: '実際には実行せず、何が起きるかを確認する',
    tools: [
      { tool: 'git',    syntax: 'git clean --dry-run',      description: '削除されるファイルを表示するだけ',           impact: 1 },
      { tool: 'npm',    syntax: 'npm publish --dry-run',    description: 'パッケージ公開の検証（実際には公開しない）', impact: 1 },
      { tool: 'kubectl',syntax: 'kubectl apply --dry-run=client -f', description: 'リソース適用の検証',              impact: 1 },
    ],
  },
  {
    id: 'namespace',
    letter: 'n',
    short: '-n',
    long: '--namespace',
    summary: '対象の名前空間を指定する',
    tools: [
      { tool: 'kubectl', syntax: 'kubectl get pods -n kube-system', description: '指定した名前空間のPodを取得', impact: 1 },
      { tool: 'docker',  syntax: 'docker network ls',               description: '（ネットワーク経由で分離）', impact: 2 },
    ],
  },
  {
    id: 'port',
    letter: 'p',
    short: '-p',
    long: '--port',
    summary: 'ポートのマッピングを指定する',
    tools: [
      { tool: 'docker', syntax: 'docker run -p 8080:80 IMAGE', description: 'ホストポート:コンテナポートをマッピング', impact: 3 },
      { tool: 'kubectl',syntax: 'kubectl port-forward pod 8080:80', description: 'ローカルポートをPodに転送',        impact: 2 },
    ],
  },
  {
    id: 'interactive',
    letter: 'i',
    short: '-i',
    long: '--interactive',
    summary: '標準入力を保持してインタラクティブモードで実行',
    tools: [
      { tool: 'docker', syntax: 'docker run -i IMAGE',  description: '標準入力を保持（通常-tと併用）', impact: 2 },
      { tool: 'sed',    syntax: 'sed -i "s/foo/bar/" FILE', description: 'ファイルをインプレース編集（GNU sed）', impact: 4 },
    ],
  },
  {
    id: 'expression',
    letter: 'e',
    short: '-e',
    long: '--expression',
    summary: '処理スクリプト・式をコマンドラインで直接指定する',
    tools: [
      { tool: 'sed',    syntax: "sed -e 's/foo/bar/' FILE",      description: '置換スクリプトを直接指定',       impact: 3 },
      { tool: 'python', syntax: 'python -c "print(\'hello\')"',  description: 'Pythonコードを直接実行',          impact: 2 },
      { tool: 'curl',   syntax: 'curl -e https://referer.com URL', description: 'Refererヘッダを指定',          impact: 1 },
    ],
  },
  {
    id: 'watch',
    letter: 'w',
    short: '-w',
    long: '--watch',
    summary: 'ファイルの変更を監視してリアルタイムで再実行',
    tools: [
      { tool: 'npm',    syntax: 'npm test -- --watch',  description: 'テストをウォッチモードで実行',   impact: 1 },
      { tool: 'cargo',  syntax: 'cargo watch -x build', description: 'ソース変更時に自動ビルド',       impact: 1 },
      { tool: 'kubectl',syntax: 'kubectl get pods -w',  description: 'Podの状態変化をリアルタイム監視', impact: 1 },
    ],
  },
];

export function getFlagsByLetter(letter: string): Flag[] {
  return FLAGS.filter(f => f.letter === letter.toLowerCase());
}

export function getFlagById(letter: string, id: string): Flag | undefined {
  return FLAGS.find(f => f.letter === letter.toLowerCase() && f.id === id);
}

export function getLettersWithFlags(): string[] {
  return [...new Set(FLAGS.map(f => f.letter))].sort();
}
```

- [ ] **Step 3: テストを書く**

```ts
// __tests__/data/flags.test.ts
import { FLAGS, getFlagsByLetter, getFlagById, getLettersWithFlags } from '@/data/flags';

describe('getFlagsByLetter', () => {
  it('v の旗を返す', () => {
    const result = getFlagsByLetter('v');
    expect(result.length).toBeGreaterThan(0);
    result.forEach(f => expect(f.letter).toBe('v'));
  });

  it('大文字でも動作する', () => {
    expect(getFlagsByLetter('V')).toEqual(getFlagsByLetter('v'));
  });

  it('データのない文字は空配列を返す', () => {
    expect(getFlagsByLetter('z')).toEqual([]);
  });
});

describe('getFlagById', () => {
  it('verbose を取得できる', () => {
    const flag = getFlagById('v', 'verbose');
    expect(flag).toBeDefined();
    expect(flag!.long).toBe('--verbose');
  });

  it('存在しないIDはundefinedを返す', () => {
    expect(getFlagById('v', 'nonexistent')).toBeUndefined();
  });

  it('文字とIDが不一致のときundefinedを返す', () => {
    expect(getFlagById('a', 'verbose')).toBeUndefined();
  });
});

describe('getLettersWithFlags', () => {
  it('ソート済みのユニークな文字一覧を返す', () => {
    const letters = getLettersWithFlags();
    expect(letters).toEqual([...letters].sort());
    expect(new Set(letters).size).toBe(letters.length);
  });

  it('すべての文字がFLAGSに存在する', () => {
    const letters = getLettersWithFlags();
    letters.forEach(l => {
      expect(FLAGS.some(f => f.letter === l)).toBe(true);
    });
  });
});

describe('FLAGS データ整合性', () => {
  it('全フラグがlongプロパティを持つ', () => {
    FLAGS.forEach(f => expect(f.long).toMatch(/^--/));
  });

  it('全フラグのtoolsが1件以上ある', () => {
    FLAGS.forEach(f => expect(f.tools.length).toBeGreaterThan(0));
  });

  it('全フラグのimpactが1〜5の範囲', () => {
    FLAGS.forEach(f =>
      f.tools.forEach(t => {
        expect(t.impact).toBeGreaterThanOrEqual(1);
        expect(t.impact).toBeLessThanOrEqual(5);
      })
    );
  });
});
```

- [ ] **Step 4: テストを実行してパスを確認**

```bash
npx jest __tests__/data/flags.test.ts --verbose
```

Expected: 全テストが PASS

- [ ] **Step 5: コミット**

```bash
git add src/data/ __tests__/ jest.config.ts
git commit -m "feat: add data layer with Flag type, 15 flags, and lookup functions"
```

---

## Task 3: テーマシステムとグローバルCSS

**Files:**
- Create: `src/lib/theme.ts`
- Modify: `src/app/globals.css`

- [ ] **Step 1: `src/lib/theme.ts` を作成**

```ts
export const THEMES = ['black', 'purple', 'white'] as const;
export type Theme = (typeof THEMES)[number];
export const DEFAULT_THEME: Theme = 'black';
export const STORAGE_KEY = 'prism-flags-theme';

export const themeInitScript = `
(function() {
  try {
    var t = localStorage.getItem('${STORAGE_KEY}');
    if (t === 'black' || t === 'purple' || t === 'white') {
      document.documentElement.setAttribute('data-theme', t);
    } else {
      document.documentElement.setAttribute('data-theme', '${DEFAULT_THEME}');
    }
  } catch(e) {}
})();
`;
```

- [ ] **Step 2: `src/app/globals.css` を上書き**

```css
@import "tailwindcss";

/* ── Theme: Black (default) ── */
:root,
[data-theme="black"] {
  --bg:           #050508;
  --bg2:          #0d0d18;
  --bg3:          #1a1a2e;
  --border:       #1f1f35;
  --purple:       #7c3aed;
  --purple-light: #a78bfa;
  --purple-dim:   rgba(124, 58, 237, 0.14);
  --text:         #ffffff;
  --text-dim:     #6b7280;
  --text-muted:   #374151;
  --grid:         rgba(124, 58, 237, 0.04);
  --bar-off:      #1f1f35;
}

/* ── Theme: Purple ── */
[data-theme="purple"] {
  --bg:           #12001f;
  --bg2:          #1e003a;
  --bg3:          #2d0055;
  --border:       #4a0080;
  --purple:       #c084fc;
  --purple-light: #e9d5ff;
  --purple-dim:   rgba(192, 132, 252, 0.15);
  --text:         #f3e8ff;
  --text-dim:     #a78bfa;
  --text-muted:   #7c3aed;
  --grid:         rgba(192, 132, 252, 0.05);
  --bar-off:      #2d0055;
}

/* ── Theme: White ── */
[data-theme="white"] {
  --bg:           #f8f9fc;
  --bg2:          #ffffff;
  --bg3:          #e5e7eb;
  --border:       #e2e8f0;
  --purple:       #7c3aed;
  --purple-light: #5b21b6;
  --purple-dim:   rgba(124, 58, 237, 0.08);
  --text:         #0f0f14;
  --text-dim:     #6b7280;
  --text-muted:   #9ca3af;
  --grid:         rgba(124, 58, 237, 0.05);
  --bar-off:      #e2e8f0;
}

/* ── Base ── */
html {
  background-color: var(--bg);
  color: var(--text);
  font-family: 'SF Mono', 'Fira Code', ui-monospace, monospace;
}

body {
  min-height: 100vh;
  background-color: var(--bg);
  background-image:
    repeating-linear-gradient(
      0deg,
      var(--grid) 0px, transparent 1px, transparent 40px
    ),
    repeating-linear-gradient(
      90deg,
      var(--grid) 0px, transparent 1px, transparent 40px
    );
}

/* ── Utility classes using CSS vars ── */
.bg-surface       { background-color: var(--bg); }
.bg-surface2      { background-color: var(--bg2); }
.bg-surface3      { background-color: var(--bg3); }
.border-theme     { border-color: var(--border); }
.text-primary     { color: var(--text); }
.text-dim         { color: var(--text-dim); }
.text-muted       { color: var(--text-muted); }
.text-purple      { color: var(--purple); }
.text-purple-light{ color: var(--purple-light); }
.bg-purple        { background-color: var(--purple); }
.bg-purple-dim    { background-color: var(--purple-dim); }
.border-purple    { border-color: var(--purple); }
```

- [ ] **Step 3: コミット**

```bash
git add src/lib/theme.ts src/app/globals.css
git commit -m "feat: add CSS variable theme system (black/purple/white)"
```

---

## Task 4: グローバルレイアウトとThemeSwitcher

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/ThemeSwitcher.tsx`

- [ ] **Step 1: `src/components/ThemeSwitcher.tsx` を作成**

```tsx
'use client';

import { useEffect, useState } from 'react';
import { THEMES, Theme, DEFAULT_THEME, STORAGE_KEY } from '@/lib/theme';

export function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);

  useEffect(() => {
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
```

- [ ] **Step 2: `src/app/layout.tsx` を上書き**

```tsx
import type { Metadata } from 'next';
import './globals.css';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { SiteNavButtons } from '@/components/SiteNavButtons';
import { themeInitScript } from '@/lib/theme';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { default: 'PRISMFLAGS', template: '%s | PRISMFLAGS' },
  description: 'CLI引数一般化事典 — 1つのフラグが、ツールによってどう変わるか。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* NAV */}
        <header className="flex items-center justify-between px-5 py-3 border-b border-theme sticky top-0 bg-surface z-10">
          <Link href="/prism-flags/" className="flex items-center gap-2 no-underline">
            <span className="text-lg">🚩</span>
            <span className="font-bold tracking-wide text-sm text-primary">
              <span className="text-purple">PRISM</span>FLAGS
              <sup className="text-purple-light text-[7px] ml-0.5">β</sup>
            </span>
          </Link>
          <ThemeSwitcher />
        </header>

        {/* MAIN */}
        <main className="flex-1">
          {children}
        </main>

        {/* FOOTER */}
        <SiteNavButtons />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: ビルドが通ることを確認**

```bash
npm run build
```

Expected: エラーなし（SiteNavButtons は次タスクで作るため、先に空実装を作る）

※ SiteNavButtons がない場合は先に空ファイルを作る：

```bash
mkdir -p src/components
cat > src/components/SiteNavButtons.tsx << 'EOF'
export function SiteNavButtons() { return null; }
EOF
```

再度 `npm run build` を実行。

- [ ] **Step 4: コミット**

```bash
git add src/app/layout.tsx src/components/ThemeSwitcher.tsx src/components/SiteNavButtons.tsx
git commit -m "feat: add global layout with ThemeSwitcher and theme flash prevention"
```

---

## Task 5: SiteNavButtons（遷移ボタン）

**Files:**
- Modify: `src/components/SiteNavButtons.tsx`

- [ ] **Step 1: `src/components/SiteNavButtons.tsx` を実装**

```tsx
export function SiteNavButtons() {
  return (
    <div className="flex gap-3 px-5 py-4 border-t border-theme">

      {/* slate-errors: chalkboard */}
      <a
        href="https://torifo.github.io/slate-errors/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 h-[90px] rounded-lg overflow-hidden relative cursor-pointer no-underline"
        style={{
          background: '#1c2a1e',
          border: '2px solid #2e3d2f',
          backgroundImage:
            'repeating-linear-gradient(180deg, transparent 0px, transparent 18px, rgba(255,255,255,0.04) 18px, rgba(255,255,255,0.04) 19px)',
        }}
      >
        {/* chalk dust */}
        <span
          className="absolute top-2 right-3 rounded-full"
          style={{ width: 50, height: 10, background: 'rgba(220,215,200,0.07)', filter: 'blur(4px)' }}
        />
        {/* error codes watermark */}
        <span
          className="absolute top-2 right-3 text-[8px] tracking-wider"
          style={{ color: 'rgba(220,215,200,0.22)', fontFamily: 'Georgia, serif' }}
        >
          No.403 404 500
        </span>
        {/* chalk tray */}
        <span
          className="absolute bottom-0 left-0 right-0"
          style={{ height: 10, background: '#3a2a1a', borderTop: '1px solid #4a3a28' }}
        />
        {/* content */}
        <div className="absolute inset-0 flex items-end pb-5 pl-4 gap-3">
          <span className="text-xl opacity-55">🖊</span>
          <div>
            <p style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#ddd8c4', letterSpacing: '0.06em', opacity: 0.92 }}>
              slate-errors
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: 9, color: '#7a7a60', marginTop: 2 }}>
              放課後の黒板で、HTTPエラーを学び直す →
            </p>
          </div>
        </div>
      </a>

      {/* anchor-ports: night sea */}
      <a
        href="https://torifo.github.io/anchor-ports/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 h-[90px] rounded-lg overflow-hidden relative cursor-pointer no-underline"
        style={{ border: '2px solid #1a3a5c' }}
      >
        {/* ocean bg */}
        <span className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0a1a2e 0%, #0d2a4a 45%, #0a3d6b 68%, #041828 100%)' }} />
        {/* stars */}
        <span className="absolute" style={{ top: 0, left: 0, right: 0, height: 36, backgroundImage: 'radial-gradient(1px 1px at 12% 25%, rgba(255,255,255,0.8) 0%, transparent 100%), radial-gradient(1px 1px at 28% 40%, rgba(255,255,255,0.5) 0%, transparent 100%), radial-gradient(1px 1px at 50% 20%, rgba(255,255,255,0.6) 0%, transparent 100%), radial-gradient(1px 1px at 88% 18%, rgba(255,255,255,0.7) 0%, transparent 100%)' }} />
        {/* moon — ship の左上、テキストと重ならない右寄り位置 */}
        <span className="absolute rounded-full" style={{ top: 7, right: 46, width: 13, height: 13, background: 'radial-gradient(circle at 38% 38%, #fef3c7, #fbbf24)', boxShadow: '0 0 8px rgba(251,191,36,0.45)' }} />
        {/* waves */}
        <span className="absolute overflow-hidden" style={{ bottom: 0, left: 0, right: 0, height: 26 }}>
          <span className="absolute" style={{ bottom: 19, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent, rgba(150,210,255,0.35), rgba(200,230,255,0.55), transparent)' }} />
          <span className="absolute" style={{ bottom: 10, left: -20, right: -20, height: 20, background: 'rgba(10,60,120,0.6)', borderRadius: '50% 50% 0 0 / 10px 10px 0 0' }} />
          <span className="absolute" style={{ bottom: 5, left: -20, right: -20, height: 20, background: 'rgba(8,50,100,0.7)', borderRadius: '50% 50% 0 0 / 10px 10px 0 0' }} />
          <span className="absolute" style={{ bottom: 0, left: -20, right: -20, height: 20, background: '#041828', borderRadius: '50% 50% 0 0 / 10px 10px 0 0' }} />
        </span>
        {/* ship */}
        <span className="absolute" style={{ right: 14, bottom: 18, fontSize: 26, filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.9))', opacity: 0.88 }}>⛵</span>
        {/* text — max-width で船エリアと分離 */}
        <div className="absolute top-0 left-0 p-3 z-10" style={{ maxWidth: '62%' }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', color: '#93c5fd', textShadow: '0 0 10px rgba(96,165,250,0.5)' }}>
            ⚓ anchor-ports
          </p>
          <p style={{ fontSize: 8, color: '#3b6fd4', marginTop: 3, letterSpacing: '0.04em' }}>
            Cyber Nautical Port Ledger
          </p>
          <span style={{ display: 'inline-block', marginTop: 5, background: 'rgba(127,29,29,0.85)', color: '#fca5a5', border: '1px solid rgba(185,28,28,0.5)', fontSize: 7, padding: '1px 6px', borderRadius: 2, letterSpacing: '0.08em' }}>
            PORT REGISTRY
          </span>
        </div>
      </a>

    </div>
  );
}
```

- [ ] **Step 2: ビルドとプレビュー確認**

```bash
npm run build && npx serve out -p 3001
```

ブラウザで `http://localhost:3001/prism-flags/` を開き、フッターの2ボタンが黒板・海のデザインで表示されることを確認。

- [ ] **Step 3: コミット**

```bash
git add src/components/SiteNavButtons.tsx
git commit -m "feat: add site nav buttons with chalkboard and night-sea designs"
```

---

## Task 6: AlphabetGrid コンポーネント

**Files:**
- Create: `src/components/AlphabetGrid.tsx`

- [ ] **Step 1: `src/components/AlphabetGrid.tsx` を作成**

```tsx
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
              href={`/prism-flags/flags/${letter}/`}
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
```

- [ ] **Step 2: コミット**

```bash
git add src/components/AlphabetGrid.tsx
git commit -m "feat: add AlphabetGrid component with active and has-data states"
```

---

## Task 7: トップページ

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: `src/app/page.tsx` を上書き**

```tsx
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
```

- [ ] **Step 2: ビルドとプレビュー確認**

```bash
npm run build && npx serve out -p 3001
```

`http://localhost:3001/prism-flags/` でヒーローとアルファベットグリッドが表示されること、データのある文字がリンクになっていることを確認。

- [ ] **Step 3: コミット**

```bash
git add src/app/page.tsx
git commit -m "feat: add top page with hero section and alphabet grid"
```

---

## Task 8: FlagCard と フラグ一覧ページ

**Files:**
- Create: `src/components/FlagCard.tsx`
- Create: `src/app/flags/[letter]/page.tsx`

- [ ] **Step 1: `src/components/FlagCard.tsx` を作成**

```tsx
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
      href={`/prism-flags/flags/${letter}/${flag.id}/`}
      className="block p-3 rounded border border-transparent border-l-[3px] no-underline
                 hover:bg-surface2 hover:border-theme hover:border-l-purple transition-all"
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
```

- [ ] **Step 2: `src/app/flags/[letter]/page.tsx` を作成**

```tsx
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
```

- [ ] **Step 3: ビルドとプレビュー確認**

```bash
npm run build && npx serve out -p 3001
```

`http://localhost:3001/prism-flags/flags/v/` でVのフラグ一覧が表示されること、各カードが詳細ページへのリンクになっていることを確認。

- [ ] **Step 4: コミット**

```bash
git add src/components/FlagCard.tsx src/app/flags/
git commit -m "feat: add FlagCard component and letter flag-list page"
```

---

## Task 9: CompareMatrix と フラグ詳細ページ

**Files:**
- Create: `src/components/FlagDetail.tsx`
- Create: `src/components/CompareMatrix.tsx`
- Create: `src/app/flags/[letter]/[flag]/page.tsx`

- [ ] **Step 1: `src/components/FlagDetail.tsx` を作成**

```tsx
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
  const displayName = flag.short ? `${flag.short} / ${flag.long}` : flag.long;

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
```

- [ ] **Step 2: `src/components/CompareMatrix.tsx` を作成**

```tsx
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
                <td className="px-2 py-1.5 text-purple-light font-semibold">{row.tool}</td>
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
```

- [ ] **Step 3: `src/app/flags/[letter]/[flag]/page.tsx` を作成**

```tsx
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
        {/* Sidebar: 同じ文字のフラグ一覧 */}
        <aside className="w-[250px] shrink-0 border-r border-theme p-2.5">
          <p className="text-muted text-[8px] tracking-[0.18em] mb-2 pb-1.5 border-b border-theme">
            {letter.toUpperCase()} — OTHER FLAGS
          </p>
          <Link
            href={`/prism-flags/flags/${letter}/`}
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
```

- [ ] **Step 4: ビルドとプレビュー確認**

```bash
npm run build && npx serve out -p 3001
```

`http://localhost:3001/prism-flags/flags/v/verbose/` で:
- 左サイドバーにVの他フラグが表示される
- 右に --verbose の詳細と影響度バーが表示される
- ツールチェックボックスでテーブルが動的に絞り込まれる（クライアントJSが動く）
- テーマスウォッチで3テーマが切り替わる

- [ ] **Step 5: コミット**

```bash
git add src/components/FlagDetail.tsx src/components/CompareMatrix.tsx src/app/flags/
git commit -m "feat: add flag detail page with FlagDetail and interactive CompareMatrix"
```

---

## Task 10: GitHub Pages デプロイ設定

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: `.github/workflows/deploy.yml` を作成**

```bash
mkdir -p .github/workflows
```

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npm run build

      - uses: actions/upload-pages-artifact@v3
        with:
          path: out

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 2: GitHub Pages を有効化（手動操作）**

GitHubリポジトリの Settings → Pages → Source を **GitHub Actions** に設定。

- [ ] **Step 3: 最終ビルド確認**

```bash
npm run build
```

Expected: `out/` 以下に全ページが静的生成されること:
- `out/index.html`
- `out/flags/v/index.html`
- `out/flags/v/verbose/index.html`
- （その他全フラグ分）

- [ ] **Step 4: コミット**

```bash
git add .github/workflows/deploy.yml
git commit -m "feat: add GitHub Actions workflow for GitHub Pages deployment"
```

---

## Self-Review チェックリスト

- [x] **ルーティング2層** — Task 8, 9でカバー
- [x] **generateStaticParams** — 両ページで実装
- [x] **テーマ3種（CSS変数）** — Task 3でカバー、フラッシュ防止スクリプトあり
- [x] **アルファベットグリッド** — Task 6でカバー、データあり/なし色分け
- [x] **FlagCard（影響度ドット）** — Task 8でカバー
- [x] **CompareMatrix（インタラクティブ）** — Task 9でカバー
- [x] **ThemeSwitcher + localStorage** — Task 4でカバー
- [x] **SiteNavButtons（黒板・夜の海）** — Task 5でカバー
- [x] **next.config.mjs（output/basePath/trailingSlash）** — Task 1でカバー
- [x] **データ層ユニットテスト** — Task 2でカバー
- [x] **GitHub Pages デプロイ** — Task 10でカバー
- [x] **ImpactDots** は `FlagCard.tsx` 内にインライン定義（再利用スコープが限定的なため）
- [x] **FlagDetail の IMPACT_LABELS** と **CompareMatrix の impact ドット** — 両方とも `ImpactLevel 1〜5` を参照、定義はTask 2のデータ層と一致
