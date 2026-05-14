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
