# 運用手順

## 前提

Node.js 22.22.2 を推奨する。依存関係は `package-lock.json` で固定し、初回セットアップでは次を実行する。

```bash
npm ci
```

## 開発と検証

開発サーバーを起動する。

```bash
npm run dev
```

テストと本番相当のビルドを確認する。

```bash
npm run test
npm run build
npm run preview
```

`npm run build` は `dist/` に全ページを生成する。生成物には、公開ページ、`contents/` 配下の直リンク対象アセット、`_redirects` が含まれる。ビルド後は、ページ URL と旧 URL のリダイレクトが維持されていることを確認する。

外部 API の実リクエストは村の状態を変更するため、通常の検証では実行しない。フォームの payload とチャットの応答処理は、テスト内のモックで確認する。

## Netlify 配信

Netlify の設定は `netlify.toml` で管理する。

- ビルドコマンド: `npm run build`
- 公開ディレクトリ: `dist`
- Node.js: 22.22.2

`master` への push が本番デプロイになる。公開前に `npm run test` と `npm run build` を実行し、`dist/` の公開パスに意図しない変更がないことを確認する。

## API 接続先の切り替え

API のベース URL はビルド時環境変数 `VITE_API_BASE` で上書きできる。未指定時は本番バックエンド URL を使用する。API のパスや payload の形式を変更する場合は、先に [バックエンド API 仕様](api-specification.md) とバックエンド側の契約を確認する。

## リダイレクトと公開アセット

旧 URL の互換性を保つため、`public/_redirects` の次のルールを削除・変更しない。

- `/webcontent/index.html` から `/` へのリダイレクト
- `/webcontent/*` から対応するルートパスへのリダイレクト
- `/opnion.html` から `/opinion.html` への 301 リダイレクト

`public/contents/` 内のファイルは外部直リンクの対象になり得るため、ファイル名や URL を変更しない。
