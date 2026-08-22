# 検証チェックリスト

> この文書はリファクタリング作業用の検証記録である。結論を現行仕様へ反映した後に削除する。

このチェックリストは `refactor-instructions.md` §6・§9 の baseline と移行後のパリティ確認に使用する。

## Baseline

- 記録日: 2026-08-23（Asia/Tokyo）
- ブランチ: `refactor/vite-migration`
- 起動コマンド: `python3 -m http.server 8000`
- 対象 URL: `http://localhost:8000`
- Console: 9 ページを確認し、通常ページにエラー・警告なし。`line.html` は `particles.js` の設定読み込みログのみ。
- スクリーンショット: 9 ページを表示確認。既存のカスタム CSS によるレイアウトを移行後の比較対象とする。

### ページ別 baseline

| URL | 描画 | ヘッダー / フッター / メニュー | Console | 特記事項 |
| --- | --- | --- | --- | --- |
| `/index.html` | OK | ロゴ、5 項目メニュー、フッター表示 | エラーなし | 更新情報・記事一覧表示。`opnion.html` へのリンクあり |
| `/rule.html` | OK | ロゴ、5 項目メニュー、フッター表示 | エラーなし | ルール漫画・役職表表示 |
| `/Instructions.html` | OK | ロゴ、5 項目メニュー、フッター表示 | エラーなし | 長文マニュアル表示 |
| `/form.html` | OK | 特殊ヘッダー、ロゴ、フッター表示 | エラーなし | 初期値 5 人、参加者 1〜5 表示。＋で 6 人、−で 5 人へ戻ることを確認 |
| `/line.html` | OK | チャット専用ヘッダー（共通メニューなし） | パーティクル設定のログのみ | 初回メッセージと時刻の吹き出しを確認 |
| `/opnion.html` | OK | ロゴ、5 項目メニュー、フッター表示 | エラーなし | Google Form の埋め込み領域と代替リンク表示 |
| `/article/article_001.html` | OK | ロゴ、記事側の 2 項目メニュー、フッター表示 | エラーなし | ルートと記事側でナビが相違 |
| `/article/article_004.html` | OK | ロゴ、記事側の 2 項目メニュー、フッター表示 | エラーなし | コラム表示 |
| `/other/powerpointkaraoke.html` | OK | 共通フッター表示 | エラーなし | 初期スライド `0 / 4`、前ボタン disabled、次ボタン active |

### 操作確認対象

- `form.html`: ＋ / − の参加者欄増減、最小 2・最大 20、ラベル `参加者N`。baseline では「村作成」をクリックしない。
- `line.html`: 初回メッセージ、送信メッセージの吹き出し化、`userId` cookie の発行・維持、API 応答表示。
- `other/powerpointkaraoke.html`: スライド 0〜4 の巡回、ページャ活性制御。

## 移行後の検証コマンド

```bash
npm run build
npm run preview
npm run test
```

### Vite / 配信確認

- [x] `dist/` に `/index.html`、`/rule.html`、`/Instructions.html`、`/form.html`、`/line.html`、`/opinion.html`、記事 4 ページ、`/other/powerpointkaraoke.html` が同一パスで存在する。
- [x] `dist/contents/img/`、`dist/contents/json/`、`dist/contents/font/` に直リンク対象アセットが同一パスで存在する。
- [x] `dist/_redirects` に既存の `/webcontent/*` 互換 2 行と `/opnion.html /opinion.html 301` が存在する。
- [x] 全ページの OGP、Twitter Card、`google-site-verification`、favicon、description / keywords が baseline と一致する。
- [x] preview 上の 9 URL で表示、ヘッダー / フッター / メニュー、Console に説明できない差分がない。

### 機能確認

- [x] `form.html`: 参加者数 2〜20、ラベル `参加者N`、ペイロード `{"message":[...]}` を純粋ロジック／APIテストで確認。外部 Heroku への実送信は行っていない。
- [x] `line.html`: 初回メッセージ、ネイティブスクロール、通信失敗時のフェールセーフメッセージを確認。cookie のキー名・有効期限はコードレビューで確認し、外部 API への実送信は行っていない。
- [x] `other/powerpointkaraoke.html`: スライド 0〜4 の巡回と前後ボタンの活性制御。
- [x] `npm run test` が全件 pass（4 files / 13 tests）。

### 移行後の補足

- 実 API への送信はバックエンドの村状態を変更するため、ブラウザからは実行せず、`fetch` のモックを使った `src/chat/api.test.ts` と payload テストで契約を確認した。
- Phase 7 の比較画像は、作業ブランチ `refactor/tailwind-legacy-removal` で form / line / karaoke の before / after を取得済み。マージ前にオーナー確認を行う。
