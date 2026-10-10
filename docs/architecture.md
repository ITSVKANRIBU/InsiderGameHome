# システム構成

## 目的

`InsiderGameHome` は、インサイダーゲーム用 LINE BOT の紹介・マニュアルを提供する静的サイトである。

## 配信構成

サイトは Vite のマルチページ構成でビルドする。HTML を入力として `dist/` を生成し、Netlify は `dist/` を公開する。HTML の共通部分は `partials/` の Handlebars パーシャルをビルド時に展開する。

`public/contents/` の画像・CSS・フォント・JSON は、外部から参照される URL を維持するため、ハッシュ付きアセットへ変換せず `/contents/...` で配信する。`public/_redirects` はビルド後も公開ルートに配置する。

## ページとコードの境界

| ページ                                                                           | エントリポイント                         | 責務                                                             |
| -------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------- |
| `index.html`、`rule.html`、`Instructions.html`、`opinion.html`、`article/*.html` | `src/pages/common.ts`                    | 共通ナビゲーション、ページトップ、スクロール、表示アニメーション |
| `other/powerpointkaraoke.html`                                                   | `src/pages/karaoke.ts`                   | スライド表示とページャ制御                                       |

共通のロゴ、ヘッダー、メニュー、フッターは `partials/` で一元管理する。ページ固有の本文とスタイルは各 HTML と `public/contents/css/` に保持する。

## 外部サービスとの境界

このサイトはバックエンド API と通信しない。

- ブラウザ版の村画面は外部サイト `https://insidergame.fyi/village` が提供し、このサイトはリンクのみ持つ。
- LINE 友だち追加、Google Form、記事内の外部リソースは各 HTML が外部 URL を直接参照する。

## URL と互換性

`/opinion.html` は最低限公開パスとして維持する。

旧 URL `/opnion.html` から `/opinion.html` への 301 リダイレクトと、旧 `/webcontent/*` パスのリダイレクトは `public/_redirects` で維持する。
