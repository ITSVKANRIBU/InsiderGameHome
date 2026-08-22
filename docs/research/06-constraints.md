# 現状資産と技術制約の棚卸し

調査日: 2026-08-23
調査対象: `/Users/fukasedaichi/git/InsiderGameHome`（コードを実際に読んで確認。Web検索は行っていない）

## CSS資産の現状

CSS はすべて `public/contents/css/` 配下の素の CSS ファイルであり、Sass/Less などのプリプロセッサや専用ビルドパイプラインは存在しない（ファイル拡張子・ディレクトリ内に `.scss`/`.sass` は一切なし）。唯一のビルド連携は Tailwind CSS v4（`@tailwindcss/vite`）で、これは `src/styles/tailwind.css`（5行、`@import "tailwindcss";` 相当の宣言のみ）として新規に導入されており、旧来の CSS 群とは別レイヤーで併存している。

| ファイル | 行数 | 役割 | 読み込まれるページ |
| --- | --- | --- | --- |
| `public/contents/css/style.css` | 1178 | サイト全体の基本レイアウト・タイポグラフィ・共通コンポーネント（ヘッダー/フッター/メニュー/ボタン/ページトップ等）。`.fontShadows`、`.animationFadeIn`/`@keyframes fadeInDown`、`other/powerpointkaraoke.html` 用の `.fadeInAnime`/`fadeInAnimeright` キーフレームもここに定義。 | index, rule, Instructions, form, opinion, article_001〜004, other/powerpointkaraoke（全ページ共通の基盤） |
| `public/contents/css/previewStyle.css` | 420 | トップページのみのヒーロー演出専用（`#indeximgdiv .absonsive` の縦書き風タイトル文字アニメーション、`.pan`/`.flower`/`.drop`（雨滴）のフェードイン、`body.loaded` セレクタによる読み込み後の遷移制御）。 | index.html のみ |
| `public/contents/css/blog-style.css` | 446 | トップページの記事カード一覧（`.blog-wrapper`, `.single-blog-area`, `.hover-content` 等のホバーで説明を出すブログカードUI）。 | index.html のみ |
| `public/contents/css/headerStyle.css` | 356 | `partials/header.hbs`（サイドから出る `#navi` ナビゲーションメニュー、`.navi-trigger`）専用スタイル。 | header.hbs を includeしている form.html, article_001〜004（index/rule/opinion/Instructions は header.hbs を使っておらず読み込んでいない＝ページごとにヘッダー実装が不統一） |
| `public/contents/css/line.css` | 438 | `line.html`（ブラウザ版チャットUI）専用。LINE風の吹き出し、`particles.js` の背景キャンバス周りのレイアウト。 | line.html のみ |
| `public/contents/css/lineStyle.css` | 194 | 記事ページ（article_001〜004）の座談会・吹き出し風の装飾用（`line.css` とは別物、名前が紛らわしい）。 | article_001〜004 のみ |
| `src/styles/tailwind.css` | 5 | Tailwind v4 のエントリポイント。Vite の `@tailwindcss/vite` プラグインでビルド時に処理される。 | form.html のみ（`link rel="stylesheet" href="/src/styles/tailwind.css"`） |

**特記事項**
- `style.css` は分割・整理されておらず、全ページに対して1本の巨大ファイルを読み込ませる構成。レスポンシブ、コンポーネント別のセクション分けはコメントベースで、CSS変数（カスタムプロパティ）はほぼ未使用（目視確認の範囲）。
- `form.html` だけ「レガシーCSS（style.css）＋ Tailwindユーティリティクラス」が同一DOM要素に混在している（例: `class="box box-border mx-auto w-full !px-[15px] sm:max-w-[540px] ..."`）。Tailwind の `!important`（`!px-[15px]`）付きユーティリティで既存のレガシーCSSを上書きする形で移行が中途半端に進んでいる状態。
- 合計約3037行の素のCSS（Tailwind分除く）が現存し、ページ間で重複・命名衝突（`line.css` と `lineStyle.css`）がある。

## ページ構成と役割

Vite のマルチページ構成（`vite.config.ts` の `rollupOptions.input`）でビルドされる公開ページは以下の10種類。

| ページ | 目的 | 使用パーシャル | 備考 |
| --- | --- | --- | --- |
| `index.html` | トップページ。サービス紹介、更新情報、記事一覧、LINE友だち追加導線。 | `logo`, `menubar`, `footer` | `header`（サイドナビ）は未使用。独自のヒーローアニメーション(`previewStyle.css`)と記事カード(`blog-style.css`)を持つ唯一のページ。 |
| `rule.html` | ゲームルール説明（役職表、外部マンガへのリンク）。 | `logo`, `menubar`, `footer` | `style.css` のみ読み込み。 |
| `Instructions.html`（ルート直下） | 使い方マニュアル（目次付き）。 | `logo`, `menubar`, `footer` | `style.css` のみ。他ページから `Instructions.html#wereword` のようにアンカー付きで参照される。 |
| `form.html` | 「特殊村作成」フォーム。参加者数の増減、メッセージ入力、API送信。 | `header`, `logo`, `footer`（`menubar` は使わず `header.hbs` 内の別メニューを使用） | Tailwindを部分導入した唯一のページ。`src/pages/form.ts` + `src/form-logic.ts` に依存。 |
| `opinion.html` | Googleフォームの埋め込み（意見募集）。 | `logo`, `menubar`, `footer` | 中身はほぼ `iframe` のみ。 |
| `line.html` | ブラウザ版チャットUI（LINE Bot疑似体験）。 | パーシャル不使用（独自の `<header>` を直書き） | 共通ヘッダー/フッターの外にある唯一の主要ページ。外部CDN（normalize.css, Google Fonts, particles.js）に依存。`src/pages/line.ts` + `src/chat/*` に依存。 |
| `article/article_001.html`〜`article_004.html` | コラム記事4本（座談会レポート、お題論など）。 | `header`, `logo`, `menubar`, `footer` | 静的な読み物ページ。`lineStyle.css` で座談会の吹き出し装飾。 |
| `other/powerpointkaraoke.html` | パワーポイントカラオケのスライド演出ページ。 | `footer` のみ（`logo`/`menubar`/`header` 不使用） | `src/pages/karaoke.ts` によるスライド送り制御。`style.css` の `.fadeInAnime` キーフレームに依存。 |

**partials の使われ方（実態）**
- `logo.hbs`: ロゴ画像＋LINE友だち追加バナー。`index`, `rule`, `Instructions`, `form`, `opinion`, `article_*` で使用。
- `menubar.hbs`: 上部の固定メニュー（ホーム/ルール/使い方/特殊村作成/ご意見番）。`form.html` 以外の大半のページで使用。
- `header.hbs`: サイド（ハンバーガー）ナビゲーション。`form.html` と `article_001〜004` のみで使用。**`index.html` など主要ページには入っていない**＝ナビゲーション実装がページ種別によって不統一。
- `footer.hbs`: 全ページ共通フッター。`line.html` を除く全ページで使用。
- パーシャル内のリンクパスは `logo.hbs`/`menubar.hbs`/`header.hbs` が `/index.html` のようなルート絶対パスなのに対し、各HTML内の画像パスは `./contents/img/...`（相対）や `../contents/img/...`（記事ページ）と混在している。刷新時にディレクトリ構成を変える場合はこの相対/絶対の混在に注意が必要。

## ビルド構成

`package.json` のスクリプト:
- `dev`: `vite`（開発サーバー）
- `build`: `vite build`（`dist/` に静的出力）
- `preview`: `vite preview`
- `test`: `vitest run`

`vite.config.ts` の要点:
- `root` はプロジェクトルート。
- プラグインは `@tailwindcss/vite`（Tailwind v4）と `vite-plugin-handlebars`（`partialDirectory: ./partials`）の2つのみ。
- `build.rollupOptions.input` に10ページ（index, rule, Instructions, form, line, opinion, article_001〜004, other/powerpointkaraoke）を明示的に列挙するマルチページアプリ（MPA）構成。**新規ページを追加する場合は必ずこの `input` に追記が必要**（自動検出ではない）。
- `public/` 配下（`contents/`, `_redirects`）は Vite の規約どおりそのまま `dist/` 直下にコピーされ、ファイル名ハッシュ化されない（外部からの直リンクURLを壊さないための意図的な設計、`docs/architecture.md` にも明記あり）。

依存関係（`devDependencies`）: Vite 8, TypeScript 7, Tailwind CSS 4, `vite-plugin-handlebars` 2, Vitest 4 + jsdom（テスト環境）。`node engines` は `^22.22.2 || >=24.15.0` を要求。

`tsconfig.json` は `noEmit: true` の型チェック専用設定（`src` 配下と設定ファイルのみ対象）。`vitest.config.ts` は jsdom 環境・globals 有効のシンプルな設定。

## 刷新時に壊してはいけないもの

1. **`public/_redirects`（Netlify のリダイレクトルール）**
   ```
   /webcontent/index.html /
   /webcontent/* /:splat
   /opnion.html /opinion.html 301
   ```
   旧サイト構造（`/webcontent/*` 配下にあった過去のURL体系）からの流入・ブックマーク・被リンクを救済するための互換リダイレクト。`docs/AGENTS.md`/`docs/operations.md` でも明示的に「維持すること」と指示されている。ビルド後 `dist/_redirects` にそのままコピーされることを確認済み（`public/_redirects` と内容一致）。

2. **公開URLパス構成**（`docs/architecture.md` に一覧あり）
   `/index.html`, `/rule.html`, `/Instructions.html`, `/form.html`, `/line.html`, `/opinion.html`, `/article/article_001〜004.html`, `/other/powerpointkaraoke.html`、および `/contents/img/`, `/contents/css/`, `/contents/font/`, `/contents/json/` 配下のアセットパス。これらは外部直リンク（SNS共有、旧記事、LINE等）の対象になっているため、リネーム・削除・パス変更をする場合は必ずリダイレクトを追加する必要がある。

3. **OGP / メタタグ（ページごとに個別設定されており共通化されていない）**
   - `og:title`, `og:image`, `og:description` はページごとに異なる値が直書きされている（例: `index.html`→`ogp.png`、`article_004.html`→`article04_OGP.png`、`other/powerpointkaraoke.html`→`karaokeOGP.png`、`form.html`/`line.html`→`usagiOGP.png`）。テンプレート化・共通パーシャル化する際は、各ページ固有の値を変数として引き継ぐ設計が必須。
   - `google-site-verification` タグは **`index.html` にしか存在しない**（`YFH2qlfN8g5PP6_VJcy1TO3_CmC5acQfwPLmAZOOIhM`）。Search Console の所有権確認用のため、index.html を刷新する際にこのメタタグを消さないこと。他ページに同タグはないため、全ページ共通ヘッダーに集約する場合はここに含めても問題ない。
   - `twitter:card`, `twitter:site`（`@2d7rqU5gFQ6VpGo`）も `index.html` にのみ存在。

4. **favicon**（`./contents/img/favicon.ico`）は全ページで参照されている（`favicon2.ico` も画像フォルダに存在するが未使用と見られる＝要確認の上での削除候補）。

5. **`netlify.toml`**
   ```
   [build]
     command = "npm run build"
     publish = "dist"
   [build.environment]
     NODE_VERSION = "22.22.2"
   ```
   ビルドコマンドと公開ディレクトリ、Node バージョン固定。刷新後もビルド成果物が `dist/` に出力される限り変更不要。ビルドツールをVite以外に変える場合はここも要更新。

6. **外部サービス連携の実装詳細**
   - `src/config.ts` の `API_BASE`（環境変数 `VITE_API_BASE` 未設定時は本番バックエンド `https://insidergamehelper.herokuapp.com` を使用）
   - `line.html` の `userId` Cookie（キー名 `userId`、有効期間365日）は バックエンドAPIとの継続セッション識別に使われており、キー名変更はバックエンド側の契約を壊す。
   - LINE友だち追加リンク（`https://line.me/R/ti/p/%40966mpnqz`）は `logo.hbs` と `index.html` に直書き。

## JS/TSとDOM構造の依存関係

TypeScript側は既にモジュール分割・テスト（Vitest）が整備されているが、**DOM操作は全てCSSクラス名／IDのセレクタに強く依存**しており、HTML構造やクラス名を変更すると静かに壊れる箇所が多い。

- **`src/pages/common.ts`**（index/rule/Instructions/opinion/article群で読み込み）
  - `a[href^="#"]` によるスムーススクロール（アンカーリンクの構造に依存）
  - `#page_top` / `#page_top2` のページトップボタン制御（現状HTML内にこのIDを持つ要素が見当たらず、実質デッドコードの可能性— 要確認）
  - `.navi-trigger` / `#container` / `#navi` / `.navigation-wrapper`（`partials/header.hbs` のサイドナビ構造に完全依存。`header.hbs` を使わない index.html 等では常に早期リターンして何もしない）
  - `.animationFadeIn`（スクロール連動フェードイン、`style.css` の `@keyframes fadeInDown` とセットで機能）
  - `document.documentElement.dataset.commonInitialized` で二重初期化ガード

- **`src/pages/form.ts`** + **`src/form-logic.ts`**（form.html 専用）
  - `.btnspinner`（`data-cal`, `data-target` 属性でカウンター対象を指定）、`.counter1`（参加者数の input）、`.group` / `.userdiv`（参加者カードをテンプレートとして `cloneNode` で複製する実装）、`[name="message"]`（textarea）、`.button`（送信ボタン）、`.success-alert` / `.danger-alert` / `#villagenum`（結果表示）
  - 参加者カードの追加ロジックは `.group` 直下の `.userdiv` を1件目のテンプレートとして clone する実装のため、**`.userdiv` の内部DOM構造（`label`要素の位置、`textarea[name="message"]`）を変更すると `participantLabel()` の反映先やメッセージ収集が壊れる**。
  - `MIN_PARTICIPANTS=2` / `MAX_PARTICIPANTS=20` は `form-logic.ts` にロジックとして分離済み（HTML非依存）。

- **`src/pages/line.ts`** + **`src/chat/logic.ts`, `src/chat/api.ts`**（line.html 専用）
  - `.messages-content`（メッセージ追加先）、`.messages`（スクロール制御対象）、`.message-input`（textarea）、`.message-submit`（送信ボタン）に依存。
  - アバター画像パスを `/contents/img/icon.png` と絶対パスでハードコード生成しているため、`contents/img` の配置を変えると壊れる。
  - Cookie名 `userId`（バックエンド契約に関わる、上記参照）。

- **`src/pages/karaoke.ts`**（other/powerpointkaraoke.html 専用）
  - `.forward` / `.next`（送りボタン）、`#num`（現在ページ番号表示）、`.imageView`（スライド要素、`id="0"`〜`id="4"` の数値IDで現在表示中スライドを判定）、`.fadeInAnime`（アニメーションクラス）に依存。`LAST_SLIDE = 4` はスライド数（5枚: id 0〜4）とHTML側の枚数が一致している前提でハードコードされている。

**総評**: TS側のロジック自体（`form-logic.ts`, `chat/logic.ts`）は純粋関数化されテストもあり移植しやすいが、DOM連携部分（`pages/*.ts`）はセレクタが多数のCSSクラス名・要素構造に密結合しているため、**HTMLのクラス名・DOM階層を刷新する場合は `pages/*.ts` 側の書き換えが必須**（テンプレートだけ差し替えて済む設計にはなっていない）。

## 既存アニメーション実装

JSアニメーションライブラリ（GSAP等）は一切使用されておらず、すべて **「JSでbody/要素にクラスを付け外しし、CSS `transition`/`@keyframes` で見た目を変える」** という素朴な手法で統一されている。

1. **トップページのタイトル文字アニメーション（index.html）**
   - `index.html` にインラインスクリプトで `window.addEventListener("load", () => document.body.classList.add("loaded"))` のみを直書き（`src/pages/common.ts` 側にはこの処理はない＝重複実装／管理場所が分散している）。
   - `previewStyle.css` 側で `body:not(.loaded)` と `body.loaded` それぞれに異なるスタイル（初期状態と読み込み後の状態）を定義し、`transition` で見た目を変化させる「CSSベースの状態遷移アニメーション」。1文字ずつ／行ごとに `-l1`〜`-l5`（各行）、`.kng`（一部の文字を強調）というクラスをHTML側で手動付与し、CSS側で `transition-delay` 相当の調整をして時間差フェードインを実現している（＝アニメーションの順序・タイミングはHTMLのクラス付与順とCSSの個別セレクタの組み合わせで決まっており、共通コンポーネント化されていない）。
   - 同時に `.pan`（うさぎの絵）、`.flower`、`.drop`（雨滴、8個個別に `nth-child` でタイミング指定）も同じ `body.loaded` 切り替えで動く。

2. **スクロール連動フェードイン（`common.ts` の `initFadeInAnimations`）**
   - `scroll` イベントで `.animationFadeIn` 要素の位置を都度計算し、閾値を超えたら `.fadeInDown` クラスを追加（`style.css` の `@keyframes fadeInDown` を発火）。IntersectionObserver 等は未使用で、スクロールイベント内で `getBoundingClientRect()` を毎回呼ぶ素朴な実装（パフォーマンス最適化の余地あり）。

3. **サイドナビの開閉（`common.ts` の `initLateralNavigation`）**
   - `#container` に `navigation-main` クラス、`body` に `navigation-is-open` クラスをトグルし、`transitionend` イベントでアニメーション完了を検知して後始末する実装。`.csstransitions` クラスの有無で分岐処理があり（Modernizr由来と思われる古い機能検出パターンの名残）、現状DOMに `.csstransitions` が付与されている形跡は確認できず、実質的にデッドコードの可能性がある。

4. **パワーポイントカラオケのスライド送り（`karaoke.ts` + `style.css` の `fadeInAnime`/`fadeInAnimeright`）**
   - スライド送り/戻しのたびに `element.style.animationName` を明示的に再設定して再生をトリガーする実装（CSSアニメーションはクラス付与だけでは同じ名前だと再生されないため、JSで一度クリアしてから設定し直す手法を取っていると推測される）。

5. **line.html の背景演出**
   - 外部CDNの `particles.js@2.0.0` を読み込み、`public/contents/js/particles.js`（初期化用グルーコード）と `public/contents/json/particlesjs-config-line.json`（パーティクル設定）で `#particles-js` に背景アニメーションを描画。これは自前実装ではなく外部ライブラリ依存。

## 刷新にあたっての推奨方針（残す/捨てる）

### そのまま捨ててよいもの（実装詳細に強く依存しない、作り直し前提でOK）
- `public/contents/css/style.css`, `previewStyle.css`, `blog-style.css`, `headerStyle.css`, `line.css`, `lineStyle.css` の中身そのもの（構造化されておらず、Tailwind等への一本化を妨げている）。ページ間で命名衝突（`line.css`/`lineStyle.css`）があり整理価値も低い。
- `index.html` のヒーロー文字アニメーション（`.absonsive`/`.kng`/`-l1`〜`-l5`/`.pan`/`.flower`/`.drop`）の実装方法自体（クラス手動付与＋CSS個別セレクタ方式）。見た目のコンセプト（段階的フェードイン）は残しつつ、実装は今どきの手法（CSS `@starting-style`、Framer Motion、あるいは単純な `IntersectionObserver` ベース）に置き換えて問題ない。
- `common.ts` の `initLateralNavigation` にある `.csstransitions` 分岐（Modernizr的な古い機能検出の名残とみられ、現状使われていない可能性が高い）。
- `common.ts` の `#page_top`/`#page_top2` 制御（対応するHTML要素が見当たらず、デッドコードの可能性。刷新時に要確認の上削除候補）。
- `partials/header.hbs` によるサイドナビ（`form.html` と記事ページのみに存在し、他の主要ページには無いという不統一な状態）。ナビゲーションUIを刷新する際は全ページで統一する前提で作り直すべき。
- `favicon2.ico`（未参照と見られる）などの未使用アセット（削除前に他ページ・外部からの参照有無を再確認すること）。
- `form.html` に見られる「レガシーCSS + Tailwindユーティリティの混在」状態。Tailwindへの一本化を進める際の中間状態であり、刷新完了時には解消されるべきもの。

### 慎重に移行が必要なもの（内容そのものを維持・引き継ぐ必要がある）
- **`public/_redirects`**（`/webcontent/*` の互換リダイレクト、`/opnion.html`→`/opinion.html` の301）。新デザインでもこのファイルはそのまま `dist/` に残す（Vite の `public/` 経由でコピーされる仕組み自体は変えてよいが、中身は削除しない）。
- **各ページのOGP値**（`og:title`/`og:image`/`og:description`）。ページごとに異なる画像・文言が設定されているため、共通テンプレート化する場合も「ページ固有値を差し込める設計」にする。
- **`google-site-verification` メタタグ**（`index.html` のみ）。Search Consoleの所有権確認が外れるとSEO計測に影響するため、index.htmlの刷新時に消さないよう明示的にチェックリスト化する。
- **favicon（`favicon.ico`）と公開URLパス構成一式**（`docs/architecture.md` に記載の10ページ＋`contents/`配下のパス）。外部直リンク・過去のSNS投稿・LINEリッチメニュー等からの参照を壊さないため、パスやファイル名を変える場合は必ず `_redirects` にルールを追加する。
- **`netlify.toml` のビルド設定**（コマンド・publishディレクトリ・Nodeバージョン）。ビルドツールを変えない限りはそのまま維持。
- **`src/config.ts` の `API_BASE` とその環境変数上書きの仕組み、`line.html` の `userId` Cookie名・有効期間**。バックエンドAPIとの契約に関わるため、フロントのUI刷新と切り離して慎重に扱う（`docs/api-specification.md` を正とする）。
- **`src/form-logic.ts` / `src/chat/logic.ts` / `src/chat/api.ts` のロジック本体**（純粋関数・API通信部分）は既にテスト付きでHTML非依存のため、UIを刷新してもロジックはそのまま再利用可能。ただし呼び出し元の `pages/form.ts` / `pages/line.ts` はDOMセレクタに強く依存しているため、新しいHTML構造に合わせて書き換えが必要（「ロジックは残す・DOM連携コードは書き直す」という切り分けが妥当）。
