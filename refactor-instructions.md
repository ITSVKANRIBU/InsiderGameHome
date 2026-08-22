# refactor-instructions.md — InsiderGameHome リファクタリング＆モダナイズ指示書（v2）

このドキュメントは、実装担当モデルへの唯一の指示書である。
書かれていない大規模な削除・全面書き換え・仕様変更は行わないこと。

v2 更新: オーナーの回答により以下が確定した。本書はその決定を反映済みである。

| 決定事項                                              | 内容                                                                                                                              |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| GAS への二重送信                                      | **不要。削除する**                                                                                                                |
| API エンドポイント                                    | **1箇所に集約する**                                                                                                               |
| `file://` 直開き運用                                  | **存在しない**（ルート絶対パス使用可）                                                                                            |
| 記事ページとルートのナビ差分                          | **意図的ではない。統一する**                                                                                                      |
| IE 向け残骸（html5shiv / respond / 条件付きコメント） | **削除する**                                                                                                                      |
| `doc/マニュアル.pptx`                                 | **削除可**                                                                                                                        |
| ファイル名変更（`opnion.html` 等）                    | **可。ただし旧URLは 301 リダイレクトで保全**                                                                                      |
| 長期方針                                              | **TypeScript + Vite + Vitest の ESM 構成へ移行。Netlify 自動デプロイは維持**                                                      |
| jQuery                                                | **今後利用しない。最終状態は全ページ脱 jQuery**（npm 導入もしない。vanilla TS へ書き換える）                                      |
| Bootstrap                                             | **撤廃し、Tailwind CSS に置き換える**（使用箇所は form.html と karaoke の2ページのみ。既存カスタム CSS の Tailwind 化は提案のみ） |

---

## 1. Objective

既存の公開サイトの URL・表示・外部連携（LINE / Heroku バックエンド）を壊さずに、以下を達成する。

1. 死コード・不要ファイル・廃止済み機能（GAS 送信、IE 残骸）を削除する
2. 明白な小バグを修正し、line.html チャットのエラーハンドリングを追加する
3. **Vite ベースのビルド構成へ移行**し、実行時 include（同期 XHR + `document.write`）をビルド時 include に置き換える
4. **JS を TypeScript (ESM) 化**し、純粋ロジックに **Vitest のテスト**を付ける。**jQuery は段階的に全廃し、vanilla TS に書き換える**（npm での jQuery 導入はしない）
   4-2. **Bootstrap を撤廃し、使用箇所（form.html / karaoke）を Tailwind CSS に置き換える**
5. API エンドポイントを 1 つの設定モジュールに集約する
6. `opnion.html` → `opinion.html` へリネームし、旧 URL をリダイレクトで保全する
7. Netlify の自動デプロイをビルド付き構成（`netlify.toml` + `dist` 公開）に切り替える

見た目のデザイン変更・UI 刷新は目的ではない。**移行前後で各ページの表示と挙動が同一であることが合格条件**である。

---

## 2. Project Understanding（証拠に基づく現状把握）

### 2.1 プロジェクトの正体

- **インサイダーゲーム用 LINE BOT の紹介・マニュアルサイト**。純粋な静的サイト。
- 現状、ビルドツール・パッケージマネージャ・テスト・lint・CI は一切存在しない。
- デプロイ先: **Netlify**（https://insidergametool.netlify.app）。**master への push が本番デプロイになる\*_。`_redirects` が旧パス `/webcontent/_` をルートへリダイレクトしている（`webcontent/` ディレクトリは現存しない。互換維持のため残す）。

### 2.2 ページ構成と責務

| ページ                          | 責務                                                          |
| ------------------------------- | ------------------------------------------------------------- |
| `index.html`                    | トップ。更新情報、サイト説明、記事一覧                        |
| `rule.html`                     | ゲームルール説明（静的）                                      |
| `Instructions.html`             | BOT の使い方マニュアル（静的、画像中心）                      |
| `form.html`                     | **特殊村作成フォーム**。Heroku バックエンドへ POST            |
| `line.html`                     | **ブラウザ版チャットクライアント**。Heroku バックエンドへ GET |
| `opnion.html`                   | Google Form 埋め込み（→ `opinion.html` にリネームする）       |
| `article/article_001〜004.html` | コラム記事                                                    |
| `other/powerpointkaraoke.html`  | パワポカラオケ（picsum.photos のランダム画像＋ページャ）      |

### 2.3 JS モジュールと責務

- [contents/js/main.js](contents/js/main.js) — 全ページ共通。責務が混在:
  - `includeHtml(url)`: 同期 AJAX + `document.write` によるパーシャル読み込み（→ Vite 移行で廃止する）
  - `submitAction()`: form.html の村作成。Heroku へ POST ＋ **GAS へ二重 POST（削除対象）**
  - スムーススクロール、ページトップボタン、`.btnspinner` による参加人数増減と `userdiv` 複製/削除
- [contents/js/line.js](contents/js/line.js) — line.html 専用チャット。cookie `userId`（365日）を発行し `GET /callapi?userId=&message=` を fetch。LINE Messaging API 形式のレスポンス（`text` / `template`）を吹き出し表示。
- [contents/js/karaoke.js](contents/js/karaoke.js) — カラオケページのページャ（スライド 0〜4）。
- [contents/js/particles.js](contents/js/particles.js) — line.html の背景パーティクル。設定は `/contents/json/particlesjs-config-line.json`（ルート絶対パス）。

### 2.4 include パーシャル

- ルート用 `contents/include/` と記事用 `article/include/`（`../` 相対パスのほぼ複製）が二重管理されており、ナビ内容も diverge している（記事側は「意見募集中」のみ）。**divergence は意図的でないと確認済み → ルート側の内容（ホーム/ルール/使い方/特殊村作成/ご意見番）に統一する。**
- `contents/include/ogp.html` はどこからも参照されていない（削除対象）。
- `other/powerpointkaraoke.html` は `../article/include/footer.html` を借用している。

### 2.5 外部依存（触る前に必ずこの節を読むこと）

| 依存                                                            | 使用箇所             | 扱い                                                                                                                                                                                                           |
| --------------------------------------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `https://insidergamehelper.herokuapp.com/specialvillage` (POST) | main.js              | **維持**。レスポンス `json_data["data"]` が村番号。2026-08-22 時点で稼働確認済み                                                                                                                               |
| `https://insidergamehelper.herokuapp.com/callapi` (GET)         | line.js              | **維持**。設定モジュールに集約する                                                                                                                                                                             |
| `https://script.google.com/macros/s/AKfycb.../exec` (POST)      | main.js:67-84        | **削除する**（オーナー確認済み）                                                                                                                                                                               |
| LINE 友だち追加 `https://line.me/R/ti/p/%40966mpnqz`            | 各ページ             | 事業の核。絶対に壊すな                                                                                                                                                                                         |
| Google Form 埋め込み                                            | opnion.html, menubar | 維持                                                                                                                                                                                                           |
| jQuery 3.3.1（CDN）                                             | ルート系ページ       | **Phase 4 で撤去**し、依存コードを vanilla TS 化                                                                                                                                                               |
| jQuery **2.1.3**（CDN）                                         | line.html            | **Phase 7 まで CDN 維持、Phase 7 で撤去**。line.js の `$(window).load()` は jQuery 3 で削除された API のため、それまで安易に触らない                                                                           |
| Bootstrap 4.3.1 + popper                                        | form.html, karaoke   | **撤廃対象**。form.html は CSS のみ利用（JS 依存なし）→ P4 で JS 系 CDN タグ撤去、P7 で CSS を Tailwind に置換。karaoke は popover が jQuery 依存 → P7 で CSS/JS とも撤去し Tailwind ＋ CSS ツールチップに置換 |
| mCustomScrollbar, js-cookie, particles.js                       | line.html            | Phase 7 まで CDN 維持。Phase 7 で mCustomScrollbar / js-cookie を撤去（particles.js は §8 Phase 7 の判断による）                                                                                               |
| animsition（jQuery プラグイン）                                 | karaoke              | Phase 7 で CSS アニメーションに置換                                                                                                                                                                            |
| picsum.photos                                                   | karaoke              | スライド画像そのもの。維持                                                                                                                                                                                     |
| html5shiv / respond（IE<9 条件付きコメント）                    | ほぼ全ページ         | **削除する**（オーナー確認済み）                                                                                                                                                                               |
| Google site verification meta, OGP, Twitter Card                | 各ページ             | 削除禁止。ビルド後も同一内容で出力されること                                                                                                                                                                   |

### 2.6 検証コマンド（現状）

自動テストは存在しない。現状の検証は手動のみ:

```bash
python3 -m http.server 8000
```

移行後は `npm run dev` / `npm run build && npm run preview` / `npm run test` が検証手段になる。

---

## 3. Behaviors To Preserve（絶対に壊してはいけない挙動）

1. **公開 URL の完全互換**。ビルド後の `dist/` は現在と同じパスで各ページを配信すること:
   `/index.html` `/rule.html` `/Instructions.html`（大文字 I のまま） `/form.html` `/line.html` `/article/article_00N.html` `/other/powerpointkaraoke.html`。
   `opnion.html` のみ `opinion.html` へ改名し、`/opnion.html → /opinion.html` の 301 を `_redirects` に追加する。
2. **外部から直リンクされ得るアセット URL の維持**。`og:image` 等が絶対 URL で `/contents/img/ogp.png` などを指している。**`contents/img/`・`contents/json/`・`contents/font/` は Vite の `public/` 配下に置き、ハッシュ付与や移動をしない**。
3. **form.html の村作成**: `{"message": ["...", ...]}` を `/specialvillage` へ POST し、成功時に村番号を `#villagenum` へ表示。スピナーは min 2 / max 20、ラベル「参加者N」。（GAS への送信だけが無くなる。それ以外のリクエスト・表示は同一。）
4. **line.html のチャット**: 初回メッセージ、cookie `userId`（キー名・365日）の発行と維持、送信ボタン/Enter 送信、`type: "text"` / `type: "template"`（`template.text` + `thumbnailImageUrl`）の解釈、mCustomScrollbar による表示。
5. **全ページの `<head>` メタ**: OGP、Twitter Card、`google-site-verification`、favicon、description/keywords。ビルド後の HTML に同一内容が含まれること。
6. **`_redirects` の既存 2 行**（`/webcontent/*` 互換）。
7. **ヘッダ/フッタ/メニュー/ロゴの表示**（実現方式は実行時 include → ビルド時 include に変わってよいが、レンダリング結果の DOM 構造・リンク先は統一後のナビ仕様に一致すること）。
8. カラオケページのスライド枚数（0〜4）とページャの活性制御。

---

## 4. Non-Negotiables（作業上の絶対ルール）

- 最初に `git status` を確認する。既存の未コミット変更があれば自分の変更と混ぜない。
- **master へ直接 push しない**。master への push は本番デプロイである。作業ブランチ（例: `refactor/vite-migration`）で行い、マージはオーナーの確認後とする。
- 編集前に baseline を記録する（§6）。
- 変更は小さく戻しやすい単位でコミットする。1コミット = 1論点。
- 無関係な整形・「ついで」のリファクタリングをしない。diff は意図した変更だけにする。
- 移行フェーズでは**挙動の変更とビルド構成の変更を同じコミットに混ぜない**。
- 証拠なくファイルを消さない。削除は grep での全参照確認結果をコミットメッセージに添える。
- `contents/img/` の画像ファイルは削除しない（外部直リンクの可能性を否定できない。提案のみ）。
- 各フェーズ完了ごとに §9 の検証を実施し、結果を記録する。

---

## 5. Stop And Ask Conditions（実装を止めて質問する条件）

1. Heroku バックエンドの**リクエスト/レスポンス契約を変えたくなった場合**（バックエンドは別リポジトリ。こちらから変更不可）。
2. cookie `userId` の生成方式・キー名・有効期限を変えたくなった場合（サーバ側がこの値でセッション識別している）。
3. line.html の CDN スタック（jQuery 2.1.3 / mCustomScrollbar / particles.js）を Phase 7 より前に置き換えたくなった場合。
4. `Instructions.html` など**本書で指定した以外のファイル名・URL** を変えたくなった場合。
5. ビルド後の HTML と現行 HTML の間で、メタタグ・リンク先・表示 DOM に**説明できない差分**が出た場合（無理に合わせ込まず報告する）。
6. Netlify のダッシュボード設定変更が必要と判明した場合（リポジトリ内の `netlify.toml` で完結しない事象が出たら、必要な設定内容を報告して停止する）。
7. 依存パッケージの選定で本書の指定（§8）と異なるものを使いたい場合。

---

## 6. Baseline Commands（着手前に必ず実行）

```bash
git status
git log --oneline -5
python3 -m http.server 8000
```

以下 9 URL を開き、①描画 ②ヘッダ/フッタ/メニュー ③Console のエラー/警告 を記録する:

```
/index.html  /rule.html  /Instructions.html  /form.html  /line.html
/opnion.html  /article/article_001.html  /article/article_004.html
/other/powerpointkaraoke.html
```

form.html は「＋/−」での参加者欄増減、line.html は初回メッセージ表示と入力の吹き出し化まで確認する。**「村作成」の実クリックは本番村を作成するため baseline では押さない。**

この記録が移行後のパリティ検証の比較対象になる。

---

## 7. Debt Map（負債一覧と扱い）

凡例 — 各項目に対応フェーズを記す。

| #   | 負債                                                                                                                           | 根拠                                               | 対応                                                                                                | フェーズ |
| --- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------- |
| D1  | 未使用 `contents/include/ogp.html`                                                                                             | 全 HTML/JS grep で参照ゼロ                         | 削除                                                                                                | P2       |
| D2  | main.js の無意味な行 `messageList.length = [index + 1]`（[main.js:29](contents/js/main.js)）、未使用変数 `size`（main.js:201） | コード査読                                         | 削除。POST ペイロード不変を検証                                                                     | P2       |
| D3  | **GAS への二重 POST**（[main.js:67-84](contents/js/main.js)）                                                                  | オーナー「不要」                                   | ブロック削除                                                                                        | P2       |
| D4  | IE<9 残骸（html5shiv/respond 条件付きコメント、`X-UA-Compatible` メタ）                                                        | 全ページに存在                                     | 全ページから削除                                                                                    | P2       |
| D5  | 廃止機能のコメントアウト残骸（[Instructions.html:171-177, 281-287](Instructions.html)）                                        | git log「お題投稿廃止」と整合                      | 削除。line.js の localhost コメントは P5 の集約で自然消滅                                           | P2       |
| D6  | `doc/マニュアル.pptx` 未参照                                                                                                   | grep 参照ゼロ、オーナー「削除可」                  | 削除                                                                                                | P2       |
| D7  | og:url typo `ohter`（[other/powerpointkaraoke.html:19](other/powerpointkaraoke.html)）                                         | 実パスは `other/`                                  | メタ値のみ修正                                                                                      | P2       |
| D8  | `opnion.html` の typo ファイル名                                                                                               | オーナー「変更あり」                               | `opinion.html` へ改名＋301＋内部リンク更新                                                          | P3       |
| D9  | include パーシャル二重管理＋ナビ divergence                                                                                    | §2.4                                               | ビルド時 include に一本化、ナビはルート版に統一                                                     | P3       |
| D10 | 実行時 include（同期 XHR + document.write）                                                                                    | [main.js:2-12](contents/js/main.js)                | Vite 移行で廃止                                                                                     | P3       |
| D11 | ビルド・テスト・型の不在                                                                                                       | リポジトリに設定ファイルなし                       | Vite + TypeScript + Vitest 導入                                                                     | P3-P4    |
| D12 | エンドポイントのハードコード分散（main.js:41, line.js:121）                                                                    | grep                                               | `src/config.ts` に集約                                                                              | P5       |
| D13 | line.js のエラーハンドリング欠落（`callApi` が null を返すと `data[0]` で TypeError、未知 type で "undefined" 表示）           | [line.js:100-155](contents/js/line.js)             | フェールセーフメッセージ追加。正常系は不変                                                          | P6       |
| D14 | line.js の implicit global `msg`（line.js:101）、無効な `{passive:true}` 第2引数（line.js:47）                                 | コード査読                                         | TS 化の過程で解消。Enter 送信の挙動は維持                                                           | P6       |
| D15 | main.js の責務混在                                                                                                             | §2.3                                               | TS 化時にページ別エントリへ分割（P4）                                                               | P4       |
| D16 | jQuery 2/3 混在（方針: 全廃）                                                                                                  | §2.5                                               | ルート系ページは P4 で vanilla TS 化して撤去。line.html / karaoke は P7 で撤去（それまで CDN 維持） | P4, P7   |
| D17 | line.js がサーバレスポンスを HTML として挿入（[line.js:69-73](contents/js/line.js)）                                           | XSS になり得るのは自社バックエンドのみで脅威は低い | P7 のチャット刷新時にエスケープ方針を含めて設計。それまで触らない                                   | P7       |
| D18 | CSS 命名の紛らわしさ（`line.css` はチャットUI、`lineStyle.css` は記事の会話風表示。セレクタ衝突はなし）                        | grep 比較済み                                      | 提案のみ（`docs/refactor-proposals.md` へ）                                                         | P8       |
| D19 | 未参照の可能性がある画像                                                                                                       | 外部直リンクを否定できない                         | 削除禁止。提案のみ                                                                                  | P8       |
| D20 | Bootstrap 依存（form.html, karaoke。CDN 読み込み＋ユーティリティクラス）                                                       | オーナー「撤廃し Tailwind へ」                     | P7 で Tailwind に置換。他ページへ preflight の影響を出さない（§8 P3-1 注意書き）                    | P7       |

---

## 8. Implementation Phases（この順で実施）

### Phase 1: 現状確認と安全網

1. `git status`、作業ブランチ作成、baseline 記録（§6）。
2. 手動検証チェックリストを `docs/verification-checklist.md` として作成（§6・§9 を清書）。

### Phase 2: 現行構成のままの整理（移行前に済ませる）

各項目を個別コミットにし、都度 §9-A で検証する。

1. D3: GAS への POST ブロック削除（main.js:66-84 の2つ目の `$.ajax`）。村作成の成功/失敗表示が不変であること。
2. D1, D6: `contents/include/ogp.html` と `doc/マニュアル.pptx` を削除。
3. D2: main.js の無意味な行・未使用変数を削除。
4. D4: 全 HTML から IE 条件付きコメント（html5shiv/respond）と `X-UA-Compatible` メタを削除。
5. D5: Instructions.html のコメントアウト 2 ブロックを削除。
6. D7: karaoke ページの og:url typo 修正。
7. line.html のプロトコル相対 URL `//cdnjs...` を `https://` 明示に。

### Phase 3: Vite 移行（挙動は変えない。実現方式だけ変える）

1. `npm init`（package manager は npm、Node は LTS）。導入パッケージ: `vite`, `typescript`, `vitest`, `jsdom`（テスト用）, `vite-plugin-handlebars`（ビルド時パーシャル用）, `tailwindcss` + `@tailwindcss/vite`（P7 で使用）。**jQuery は npm 導入しない**（方針: 全廃）。
   **Tailwind の注意**: preflight（グローバルリセット）を全ページに当てると既存カスタム CSS のページ（index / rule / Instructions / 記事 / line）の見た目が変わる。**Tailwind の CSS エントリは Bootstrap 置換対象ページ（form / karaoke）にのみ読み込む**か、preflight を無効化して utilities のみ使う構成にし、他ページに影響を出さないこと。
2. **ディレクトリ再編**:
   - URL 非依存の静的アセット（`contents/img/`, `contents/json/`, `contents/font/`, favicon）→ `public/contents/...` に**同一パスのまま**移動（§3-2）。
   - `_redirects` → `public/_redirects` に移動し、既存 2 行を維持。
   - CSS は当面 `public/contents/css/` に置き、HTML から現行どおり `<link>` 参照（CSS のバンドル化は P8 提案扱い）。
3. **MPA エントリ設定**: `vite.config.ts` の `rollupOptions.input` に全 HTML（index, rule, Instructions, form, line, opinion, article/×4, other/powerpointkaraoke）を列挙。ビルド後の出力パスが §3-1 と一致することを確認。
4. **ビルド時 include 化（D9, D10）**: `contents/include/` と `article/include/` の中身を `partials/`（header, footer, logo, menubar）に一本化し、リンク・画像・CSS 参照は**ルート絶対パス**（`/contents/...`, `/index.html` 等）で記述。各 HTML の `includeHtml(...)` スクリプトを `{{> partial}}` に置換。ナビはルート版（ホーム/ルール/使い方/特殊村作成/ご意見番）に統一。旧 `contents/include/` と `article/include/` は置換完了後に削除。
5. D8: `opnion.html` → `opinion.html` に改名。内部リンク（menubar、index.html の更新情報）を更新し、`public/_redirects` に `/opnion.html /opinion.html 301` を追加。
6. **Netlify 設定**: `netlify.toml` を追加（`command = "npm run build"`, `publish = "dist"`）。
7. この時点では JS は移行しない: `main.js`（includeHtml を除去した残り）, `line.js`, `karaoke.js`, `particles.js` は `public/contents/js/` に置き、HTML から現行どおり classic script として読み込む。CDN スクリプト（jQuery/Bootstrap ほか）もそのまま。
8. 検証: §9-B のパリティ検証。

### Phase 4: TypeScript 化＋脱 jQuery（ルート系ページ）

対象: index, rule, Instructions, form, opinion, article/×4。**line.html と karaoke は触らない（Phase 7 の legacy island）。**

1. **TS 化の前に characterization test を書く**: 村作成ペイロード生成・スピナーの min/max クランプ（2〜20）・参加者ラベル生成を純関数として設計し、Vitest（jsdom）で現行挙動どおりのテストを先に通す。
2. `src/` を作成し、`main.js` の機能をページ別エントリに分割して **vanilla TS** で書き換える（D15, D16）:
   - `src/pages/common.ts` — スムーススクロール（`scrollIntoView` / `window.scrollTo({behavior:"smooth"})`）、ページトップボタン（jQuery animate → CSS transition + class 切替で同等の見た目に）
   - `src/pages/form.ts` — スピナー増減・`userdiv` 複製/削除・村作成送信（`$.ajax` → `fetch`。POST 先・ペイロード・成功/失敗表示は現行と同一）
   - **パーシャル内のナビ開閉スクリプト**（header の `navi-trigger`。現状 `jQuery(document).ready` 依存）も vanilla TS に書き換え、`src/pages/common.ts` へ移す
3. 各 HTML の script 参照を Vite の module script に置換し、**jQuery 3.3.1 の CDN タグをルート系ページから撤去**。form.html の Bootstrap JS / popper の CDN タグは、ページ内に JS 依存（popover 等）がないことを確認のうえ撤去（CSS の `<link>` は **P7 まで残す** — 見た目の変更を P7 のスクリーンショット承認ゲートに集約するため）。
4. 検証: §9-B ＋ `npm run test`。特にナビ開閉・ページトップ・スムーススクロール・form の一連の動作を baseline と比較する。

### Phase 5: エンドポイント集約（D12）

1. `src/config.ts` を作成: `export const API_BASE = import.meta.env.VITE_API_BASE ?? "https://insidergamehelper.herokuapp.com";`
2. form の POST 先を `${API_BASE}/specialvillage` に変更。line.js は P6 で TS 化する際に `${API_BASE}/callapi` を使う。
3. デフォルト値で現行と同一 URL になることをテストで固定する。

### Phase 6: チャットロジックの TS 化とエラーハンドリング（D13, D14）

1. `line.js` のうち**ロジック層のみ** TS 化: `getText` / `getImg` / `zeroPadding` / userId 生成 / API 呼び出しを `src/chat/` の純関数モジュールへ抽出し、Vitest でテスト（`text` 型・`template` 型・null・空配列・未知 type）。
2. D13: `data` が null / 空 / 未知 type の場合、「通信に失敗しました。時間をおいて再度お試しください。」をボット吹き出しとして表示。
3. D14: implicit global の解消、無効な `{passive:true}` の除去。Enter 送信・DOM 構造・mCustomScrollbar 連携は**現行のまま**（jQuery 2.1.3 CDN も維持。module script から `window.$` を参照する構成でよい）。
4. 検証: §9-B の line.html 項目＋ DevTools オフラインでエラーメッセージ表示を確認。

### Phase 7: 脱 jQuery ＆ 脱 Bootstrap（**独立ブランチ・オーナー確認必須**）

ページごとに独立コミットとする。

1. **form.html（Bootstrap CSS → Tailwind, D20）**: Bootstrap CSS の CDN `<link>` を撤去し、使用中のクラス（`container`, `row`, `justify-content-center`, `w-25`, `w-100`, `text-center`/`text-right`, `form-control`, `alert alert-success` / `alert-danger` 等）を Tailwind ユーティリティで再現する。フォームの機能（スピナー・送信・成功/失敗表示）は P4 の実装のまま一切変えない。
2. **line.html**: jQuery 2.1.3 / mCustomScrollbar / js-cookie の CDN 依存を撤去し、ネイティブ scroll（CSS `overflow-y`）＋ `document.cookie` ラッパで再実装（cookie キー名 `userId`・365日は不変）。D16, D17（表示テキストのエスケープ方針決定を含む）。particles.js は挙動維持を優先し CDN 継続でよい（脱 CDN は提案扱い）。
3. **karaoke（脱 jQuery ＋ Bootstrap → Tailwind, D20）**: jQuery / Bootstrap CSS・JS / popper / animsition の CDN を撤去。ページャを vanilla TS（`src/pages/karaoke.ts`）で書き換え、スライド表示切替の `d-none` 相当は Tailwind の `hidden` 等に置換、フェードは CSS アニメーション、popover は CSS ツールチップまたは常時表示の説明文に置換。スライド 0〜4 の巡回とページャ活性制御は不変。
4. **ビフォー/アフターのスクリーンショット比較（form / line / karaoke 各ページ）を添えてオーナーの確認を得てからマージ**。視覚差分が出る唯一の許容フェーズ。ただしレイアウト崩れ（要素の重なり・折返し破綻）は差分として許容しない。

### Phase 8: 提案の文書化

1. D18, D19、CSS のバンドル化、既存カスタム CSS の Tailwind への段階的移行、記事ページのテンプレート化、lint/format（ESLint + Prettier）と CI（GitHub Actions で `build` + `test`）の導入案を `docs/refactor-proposals.md` にまとめる。実装しない。

---

## 9. Verification Requirements

### 9-A. 現行構成での検証（Phase 2）

```bash
python3 -m http.server 8000
```

§6 の 9 URL を baseline と比較（描画・ヘッダ/フッタ/メニュー・Console）。form.html のペイロード検証が必要な変更（D2, D3）では、DevTools の Network タブで送信が **Heroku への 1 本のみ**かつ `{"message":[...]}` が入力値と一致することを確認する（実クリックは 1 回まで）。

### 9-B. Vite 構成での検証（Phase 3 以降、毎フェーズ）

```bash
npm run build
npm run preview   # dist を配信
npm run test      # Phase 4 以降
```

1. `dist/` に §3-1 の全ページが同一パスで存在すること（`ls -R dist` で確認）。
2. `dist` 配下に `/contents/img/ogp.png` 等の外部参照アセットが同一パスで存在すること。
3. preview 上で §6 の 9 URL（opnion→opinion 読み替え）を baseline と比較。
4. `dist/_redirects` に既存 2 行＋ `/opnion.html /opinion.html 301` があること。
5. 各ページの `<head>`（OGP / Twitter Card / google-site-verification / favicon）が現行と同一内容であること（`grep` で機械的に比較してよい）。
6. line.html: 初回メッセージ → 送信 → 応答表示、リロードで cookie `userId` 不変。
7. form.html: スピナー 2〜20、ラベル「参加者N」。
8. カラオケ: 0〜4 巡回とページャ活性制御。
9. `git diff` を目視し、意図しない差分がないこと。

---

## 10. Reporting Format（完了報告の形式）

1. 実施したフェーズと、フェーズごとのコミット一覧（`git log --oneline`）
2. スキップ・停止した項目とその理由（§5 該当時はその番号）
3. 実行した検証コマンドと結果（9-A / 9-B の項目ごとに baseline との差分有無を明記。テストは pass/fail 数）
4. Netlify 側でダッシュボード操作が必要な事項があれば列挙（例: ビルド設定の確認）
5. `docs/refactor-proposals.md` に記載した提案の一覧
6. Phase 7 に進む場合は、スクリーンショット比較と承認依頼

## 11. Out-of-scope Items（今回はやらない）

- デザイン変更・レスポンシブ改善・アクセシビリティ改修（Phase 7 の視覚パリティ内の差分を除く）
- CSS のリネーム・統合・バンドル化（提案のみ）
- `contents/img/` の画像削除（提案のみ）
- particles.js の脱 CDN（提案のみ。※Bootstrap は P7 で撤廃、jQuery 依存 JS は P4/P7 で撤去する）
- **既存カスタム CSS（style.css ほか約 3,000 行）の Tailwind への全面書き換え**（視覚回帰リスクが大きすぎる。提案のみ）
- 記事ページ本文のリライトやテンプレートエンジンへの全面移行（パーシャル置換のみ行う）
- Heroku バックエンド側の変更、`Instructions.html` など指定外のファイル名変更
- React 等の UI フレームワーク導入
