# prism-flags — 設計仕様書

**作成日**: 2026-05-14  
**ステータス**: 承認済み

---

## 概要

CLI引数一般化事典「prism-flags」。「1つのコマンドという光を、引数というプリズムで分解し、その真の意図を可視化する」というコンセプトのもと、複数ツールにまたがるフラグの意味・動作・影響度を横断的に比較できる静的Webサイト。

**公開先**: GitHub Pages (`https://<user>.github.io/prism-flags/`)  
**技術スタック**: Next.js 15 (App Router), Tailwind CSS v4, Lucide-react, TypeScript

---

## アーキテクチャ

### 静的エクスポート設定

```
next.config.mjs
  output: 'export'
  basePath: '/prism-flags'
  trailingSlash: true
```

### ルーティング構造（2層）

```
/                         → トップページ（ヒーロー + アルファベット選択）
/flags/[letter]/          → フラグ一覧ページ（例: /flags/v/）
/flags/[letter]/[flag]/   → フラグ詳細ページ（例: /flags/v/verbose/）
```

フラグ起点のナビゲーション。アルファベット → フラグ一覧 → 詳細+比較マトリクス の2ステップ遷移。

### ディレクトリ構成

```
src/
  app/
    layout.tsx              グローバルレイアウト（ナビ・テーマプロバイダ）
    page.tsx                トップページ
    flags/
      [letter]/
        page.tsx            フラグ一覧ページ
        [flag]/
          page.tsx          フラグ詳細ページ
  components/
    AlphabetGrid.tsx        A〜Zグリッド（データあり/なしで色分け）
    FlagCard.tsx            フラグ一覧アイテム（名前・説明・ツールタグ・影響度ドット）
    FlagDetail.tsx          フラグ詳細（説明・影響度バー・比較マトリクス）
    CompareMatrix.tsx       ツール選択チェックボックス + 比較テーブル
    ThemeSwitcher.tsx       3テーマ切替スウォッチ（黒・紫・白）
    SiteNavButtons.tsx      slate-errors / anchor-ports 遷移ボタン
  data/
    flags.ts                全フラグデータ（型定義含む）
    tools.ts                ツール定義（git, docker, linux, npm, kubectl, python, cargo, sed）
  lib/
    theme.ts                テーマ定義・CSS変数マッピング
```

---

## データモデル

```typescript
// src/data/flags.ts

type ImpactLevel = 1 | 2 | 3 | 4 | 5;

interface ToolUsage {
  tool: string;        // "git" | "npm" | "curl" | "docker" | "kubectl" | "python" | "cargo" | "sed"
  syntax: string;      // "git -v"
  description: string; // "バージョン表示"
  impact: ImpactLevel;
}

interface Flag {
  id: string;          // "verbose"
  letter: string;      // "v" — short フラグがある場合はその文字、ない場合は long の先頭文字
  short?: string;      // "-v"（省略可：long フラグのみのケース）
  long: string;        // "--verbose"
  summary: string;     // "詳細出力を有効にする"
  tools: ToolUsage[];
}
```

**対象ツール（8種）**: git, docker, linux (ls/grep/curl), npm, kubectl, python, cargo, sed

`tools.ts` はツール名・表示ラベル・カラーを定義する定数配列をエクスポートする。

---

## デザインシステム

### テーマ（3種・CSS変数で切替）

| テーマ | 背景 (--bg) | アクセント (--purple) | テキスト |
|--------|------------|----------------------|---------|
| **Black**（デフォルト）| `#050508` | `#7c3aed` | `#ffffff` |
| **Purple** | `#12001f` | `#c084fc` | `#f3e8ff` |
| **White** | `#f8f9fc` | `#7c3aed` | `#0f0f14` |

テーマは `<html>` の `data-theme` 属性で切替。`localStorage` に保存してリロード後も維持。

### ロゴ

```
🚩 PRISMFLAGS β
   ^^^^^^ ← 紫色 (--purple)
```

### 影響度バー

1〜5段階のドット（一覧）またはバーセグメント（詳細）で表示。  
`impact: 1` → LOW、`impact: 3` → MEDIUM、`impact: 5` → HIGH

### グローバル背景

`global.css` にグリッドパターン（CSS `repeating-linear-gradient`）を定義。テーマごとに透明度を調整。

---

## コンポーネント詳細

### AlphabetGrid

- A〜Zを横並びグリッドで表示
- データが存在する文字: `--text` 色（明るく）
- データなし: `--text-muted` 色（暗く）
- 選択中: `--purple` 背景・白文字・グロー

### FlagCard（一覧アイテム）

- フラグ名（`-v / --verbose`）
- 1行説明
- ツールタグバッジ（`--purple-dim` 背景）
- 影響度ドット5個

### CompareMatrix

- ツールチェックボックス（選択/非選択でトグル）
- 選択ツールのみテーブルに表示
- 列: TOOL / SYNTAX / 動作 / 重み

### ThemeSwitcher

- 右上固定スウォッチ（●●●）
- クリックで `data-theme` 切替 + `localStorage` 保存

---

## 遷移ボタン（SiteNavButtons）

ページ下部に2ボタン固定。デザインは遷移先の世界観に合わせる。

### slate-errors（黒板）

- 背景: 深緑黒 `#1c2a1e`
- 横罫線テクスチャ（CSS `repeating-linear-gradient`）
- 下部に黒板消しトレイ（ブラウン帯）
- 右上にエラーコード薄字: `No.403 404 500`
- タイトルフォント: Georgia serif、チョーク色 `#ddd8c4`

### anchor-ports（夜の海）

- 背景: 夜空→深海グラデーション
- 星（CSS `radial-gradient` 点）
- 三日月: 右上エリア（テキストと重ならない位置）
- 波3層（CSS `border-radius` 波形）
- 帆船アイコン（右端・波上）
- テキスト領域: `max-width: 62%`（船エリアと分離）

---

## ページ生成戦略

静的エクスポートのため、全ページを `generateStaticParams` で事前生成。

```typescript
// /flags/[letter]/page.tsx
export function generateStaticParams() {
  return Object.keys(flagsByLetter).map(letter => ({ letter }));
}

// /flags/[letter]/[flag]/page.tsx
export function generateStaticParams() {
  return allFlags.map(f => ({ letter: f.letter, flag: f.id }));
}
```

---

## 非機能要件

- **SEO**: 各ページに `<title>` と `<meta description>` を設定
- **アクセシビリティ**: キーボードナビゲーション対応（アルファベットグリッド・チェックボックス）
- **パフォーマンス**: 全データをビルド時に静的生成、クライアントサイドフェッチなし
- **テーマ永続化**: `localStorage` キー `prism-flags-theme`
