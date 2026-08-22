# システム構成

## 目的

`InsiderGameHome` は、インサイダーゲーム用 LINE BOT の紹介・マニュアルと、ブラウザから利用する補助機能を提供する静的サイトである。

## 配信構成

サイトは Vite のマルチページ構成でビルドする。HTML を入力として `dist/` を生成し、Netlify は `dist/` を公開する。HTML の共通部分は `partials/` の Handlebars パーシャルをビルド時に展開する。

`public/contents/` の画像・CSS・フォント・JSON は、外部から参照される URL を維持するため、ハッシュ付きアセットへ変換せず `/contents/...` で配信する。`public/_redirects` はビルド後も公開ルートに配置する。

## ページとコードの境界

| ページ                                                                           | エントリポイント                         | 責務                                                             |
| -------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| `index.html`、`rule.html`、`Instructions.html`、`opinion.html`、`article/*.html` | `src/pages/common.ts`                    | 共通ナビゲーション、ページトップ、スクロール、表示アニメーション |
| `form.html`                                                                      | `src/pages/form.ts`、`src/form-logic.ts` | 特殊村作成フォームと `/specialvillage` への送信                  |
| `line.html`                                                                      | `src/pages/line.ts`、`src/chat/`         | ブラウザチャット、`userId` cookie、`/callapi` との通信           |
| `other/powerpointkaraoke.html`                                                   | `src/pages/karaoke.ts`                   | スライド表示とページャ制御                                       |

共通のロゴ、ヘッダー、メニュー、フッターは `partials/` で一元管理する。ページ固有の本文とスタイルは各 HTML と `public/contents/css/` に保持する。

## 外部サービスとの境界

バックエンド API のベース URL は `src/config.ts` に集約する。`VITE_API_BASE` が指定されていない場合は本番バックエンド URL を使用する。API のリクエスト・レスポンス・エラー契約は [バックエンド API 仕様](api-specification.md) を正とする。

- `form.html` は特殊村作成 API に参加者向けメッセージ配列を POST する。
- `line.html` はチャット入力を API に GET で送信し、LINE Messaging API 形式の応答を表示する。
- LINE 友だち追加、Google Form、記事内の外部リソース、`line.html` のパーティクル描画は各 HTML が外部 URL を直接参照する。

## URL と互換性

次のページ URL とアセット URL は最低限公開パスとして維持する。

- `/form.html`
- `/opinion.html`

旧 URL `/opnion.html` から `/opinion.html` への 301 リダイレクトと、旧 `/webcontent/*` パスのリダイレクトは `public/_redirects` で維持する。`line.html` の `userId` cookie はキー名を `userId` とし、有効期間を 365 日とする。
