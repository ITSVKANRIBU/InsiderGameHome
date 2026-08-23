# デザイン刷新 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 全10ページを「かわいい秘密結社」デザイン（パステル基調＋ダーク×ネオン部分投入）に刷新し、CSSをTailwind v4に一本化、three.js＋GSAPのモーションを実装する。

**Architecture:** Vite MPA＋Handlebarsパーシャルの現行構成を維持したまま、①Tailwind `@theme` トークン基盤 → ②共通パーシャル → ③各ページ → ④モーション → ⑤レガシー削除の順で置き換える。TSロジック層（form-logic/chat）は無変更、DOM連携の既存セレクタ契約（`.userdiv`, `.messages-content` 等）は新HTMLでもクラス名を維持して `pages/*.ts` の書き換えを最小化する。

**Tech Stack:** Vite 8 / TypeScript / Tailwind CSS v4 (@tailwindcss/vite) / vite-plugin-handlebars / GSAP core+ScrollTrigger / three.js / Vitest+jsdom

**Spec:** `docs/superpowers/specs/2026-08-23-design-refresh-design.md`（画像アセットは `docs/superpowers/specs/2026-08-23-asset-generation-guide.md` に従い生成済み・コミット済み）

**Design System:** `.claude/skills/insider-game-tool-design/`（トークン定義の正。`tokens/colors.css` `typography.css` `shape.css` `motion.css` `base.css`。数値はここから転記し、Task 1 で Tailwind の `@theme` に実装する。デザイン規約の詳細は同スキルの `readme.md`）

## Global Constraints

- **変更禁止ファイル**: `src/form-logic.ts` / `src/chat/logic.ts` / `src/chat/api.ts` / `src/config.ts` / `public/_redirects` / `netlify.toml`
- **公開URLパス**: 全ページ現行パスを維持（`/form.html` `/opinion.html` は必須、他も変更しない）
- **index.html に必ず残す**: `<meta name="google-site-verification" content="YFH2qlfN8g5PP6_VJcy1TO3_CmC5acQfwPLmAZOOIhM" />`
- **LINE友だち追加URL**: `https://line.me/R/ti/p/%40966mpnqz`（一字も変えない）
- **CTA文言**: 「友だち追加してはじめる」
- **カラートークン**（HEX厳守）: base `#F3EEF6` / primary `#F7C9DE` / secondary `#C9DEF7` / accent `#5E3A87` / ink `#2B2438` / cta `#06C755` / dark-base `#17131F` / dark-accent `#FF3EA5` / dark-sub `#5EE7FF` / dark-text `#FFC9E8` / dark-line `#3A2E4D`
- **生の値をCSSに直接書かない**: 角丸・影・イージング・発光は設計システムのトークン（`--radius-card`, `--shadow-card`, `--ease-pop`, `--glow-neon` 等）を `var()` で参照する。Tailwind 標準スケールで足りるもの（余白 `--space-*`、フォントサイズ `--text-*`）は Tailwind の組み込みユーティリティを使い、`@theme` に重複宣言しない
- **Task 6 以降のCSSスニペットは設計システム導入前に書かれたもの**で、角丸・影・発光が生の値のまま残っている。実装時は Task 1 で定義したトークンの `var()` 参照に置き換える（値は同一なので見た目は変わらない）。対応表: `1.5rem`→`var(--radius-card)` / `1.25rem`→`var(--radius-bubble)` / `1rem`(画像・FAQ)→`var(--radius-img)` / `0.75rem`(入力)→`var(--radius-input)` / `9999px`→`var(--radius-pill)` / `0.25rem`(吹き出しの角)→`var(--radius-bubble-tail)` / `0 4px 16px rgb(94 58 135 / 0.08)`→`var(--shadow-card)` / `0 12px 28px rgb(94 58 135 / 0.16)`→`var(--shadow-card-hover)` / `0 2px 8px rgb(94 58 135 / 0.1)`→`var(--shadow-pill)` / `0 6px 20px rgb(6 199 85 / 0.35)`→`var(--shadow-cta)` / `0 -4px 20px rgb(94 58 135 / 0.15)`→`var(--shadow-nav)` / `0 0 16px rgb(255 62 165 / 0.45)`→`var(--glow-neon)` / `drop-shadow(0 0 18px rgb(255 62 165 / 0.25))`→`var(--glow-role)` / `#fff`(カード背景)→`var(--surface-card)`
- **フォント**: 見出し Zen Maru Gothic (700/900)、本文 M PLUS Rounded 1c (400/700)、数字 Baloo 2 (700)。Google Fonts、これ以外のウェイトを読み込まない
- **アニメーション**: `transform`/`opacity` のみ。すべての演出に `prefers-reduced-motion: reduce` ガード必須（three.js/GSAPは初期化自体をスキップ）
- **コントラスト**: 本文4.5:1以上。パステル（primary/secondary）を文字色に使わない
- **タップ領域**: 44px以上
- **コミット**: タスクごとにコミット。**push禁止**（master push＝本番デプロイ）
- 各コミット末尾: `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`
- テスト実行: `npm test`（Vitest）。既存テスト（form-logic/chat/config）は全タスクを通じて常にパスすること
- 型チェック: `npx tsc --noEmit`

---

### Task 1: 依存追加と Tailwind テーマ基盤

**Files:**
- Modify: `package.json`（gsap, three を devDependencies に追加）
- Modify: `src/styles/tailwind.css`（全面書き換え）

**Interfaces:**
- Consumes: 生成済み画像 `public/contents/img/*.webp`
- Produces: 全ページが読み込むCSSエントリ。後続タスクが使うクラス: `.btn-cta`, `.card`, `.section-dark`, `.reveal`/`.revealed`, `.speech`/`.speech-maru`/`.speech-fudo`, `.color1`, `.keiko_yellow`, `.balloon2-top`, `.manual`, `.torokubtn`, `.mkj`, `.newicon`, `.counterspan`, `.fadeInAnime`, `@keyframes fadeInAnime/fadeInAnimeright`, フォントユーティリティ `font-heading`/`font-body`/`font-numeric`, カラーユーティリティ `bg-base`/`text-ink`/`text-accent`/`bg-dark-base` 等

- [ ] **Step 1: 依存をインストール**

```bash
npm install --save-dev gsap three @types/three
```

- [ ] **Step 2: `src/styles/tailwind.css` を全面書き換え**

```css
@import "tailwindcss";

@source "../../index.html";
@source "../../rule.html";
@source "../../Instructions.html";
@source "../../form.html";
@source "../../line.html";
@source "../../opinion.html";
@source "../../article";
@source "../../other";
@source "../../partials";
@source "../../src";

/* 値はすべて .claude/skills/insider-game-tool-design/tokens/*.css（設計システムの正）から転記。
   Tailwind のユーティリティを生やしたいものは @theme、それ以外は :root に置く。
   余白（--space-*）とフォントサイズ（--text-*）は Tailwind 標準スケールと同値なので宣言しない。 */
@theme {
  /* colors.css — ライト面 */
  --color-base: #f3eef6;
  --color-primary: #f7c9de;
  --color-secondary: #c9def7;
  --color-accent: #5e3a87;
  --color-ink: #2b2438;
  --color-cta: #06c755;
  /* colors.css — ダーク面 */
  --color-dark-base: #17131f;
  --color-dark-accent: #ff3ea5;
  --color-dark-sub: #5ee7ff;
  --color-dark-text: #ffc9e8;
  --color-dark-line: #3a2e4d;
  /* typography.css */
  --font-heading: "Zen Maru Gothic", "M PLUS Rounded 1c", sans-serif;
  --font-body: "M PLUS Rounded 1c", "Zen Maru Gothic", sans-serif;
  --font-numeric: "Baloo 2", "M PLUS Rounded 1c", sans-serif;
  --leading-body: 1.7;
  --leading-tight: 1.25;
  /* shape.css — 角丸（rounded-card / rounded-bubble / … が生える） */
  --radius-card: 1.5rem;
  --radius-bubble: 1.25rem;
  --radius-img: 1rem;
  --radius-input: 0.75rem;
  --radius-pill: 9999px;
  --radius-bubble-tail: 0.25rem;
  /* shape.css — 影（shadow-card / shadow-cta / … が生える） */
  --shadow-card: 0 4px 16px rgb(94 58 135 / 0.08);
  --shadow-card-hover: 0 12px 28px rgb(94 58 135 / 0.16);
  --shadow-pill: 0 2px 8px rgb(94 58 135 / 0.1);
  --shadow-cta: 0 6px 20px rgb(6 199 85 / 0.35);
  --shadow-nav: 0 -4px 20px rgb(94 58 135 / 0.15);
  /* motion.css — イージング（ease-soft / ease-pop が生える） */
  --ease-soft: ease;
  --ease-pop: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ユーティリティにしないトークン（var() 参照専用） */
:root {
  /* colors.css — セマンティックエイリアス */
  --surface-page: var(--color-base);
  --surface-card: #ffffff;
  --surface-dark: var(--color-dark-base);
  --surface-dark-card: var(--color-dark-line);
  --text-body: var(--color-ink);
  --text-heading: var(--color-accent);
  --text-link: var(--color-accent);
  --text-on-dark: var(--color-dark-text);
  --text-heading-dark: var(--color-dark-accent);
  --text-link-dark: var(--color-dark-sub);
  --text-on-cta: #ffffff;
  /* shape.css — 発光・ヒットエリア */
  --glow-neon: 0 0 16px rgb(255 62 165 / 0.45);
  --glow-role: drop-shadow(0 0 18px rgb(255 62 165 / 0.25));
  --tap-min: 2.75rem;
  /* motion.css — デュレーション */
  --dur-press: 0.15s;
  --dur-hover: 0.25s;
  --dur-reveal: 0.6s;
}

@layer base {
  body {
    background-color: var(--surface-page);
    color: var(--text-body);
    font-family: var(--font-body);
    line-height: var(--leading-body);
    padding-bottom: 5.5rem; /* ボトムナビ分の逃げ */
  }
  h1, h2, h3, h4 {
    font-family: var(--font-heading);
    font-weight: 700;
    color: var(--text-heading);
    line-height: var(--leading-tight);
  }
  /* 全面グレイン（ベタ塗り回避） */
  body::after {
    content: "";
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 60;
    opacity: 0.04;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
  }
}

@layer components {
  /* --- 共通コンポーネント --- */
  .btn-cta {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 3rem;
    padding: 0.75rem 2rem;
    border-radius: var(--radius-pill);
    background-color: var(--color-cta);
    color: var(--text-on-cta);
    font-family: var(--font-heading);
    font-weight: 700;
    text-decoration: none;
    box-shadow: var(--shadow-cta);
    position: relative;
    overflow: hidden;
    transition: transform var(--dur-press) var(--ease-soft);
  }
  .btn-cta:active { transform: scale(0.94); }
  /* シャインエフェクト（CTA唯一の常時演出） */
  .btn-cta::before {
    content: "";
    position: absolute;
    top: 0; bottom: 0;
    width: 40%;
    background: linear-gradient(105deg, transparent, rgb(255 255 255 / 0.5), transparent);
    animation: cta-shine 3.2s ease-in-out infinite;
  }
  @keyframes cta-shine {
    0% { left: -60%; }
    40%, 100% { left: 120%; }
  }
  .card {
    border-radius: var(--radius-card);
    background-color: var(--surface-card);
    padding: 1.5rem;
    box-shadow: var(--shadow-card);
    transition: transform var(--dur-hover) var(--ease-soft), box-shadow var(--dur-hover) var(--ease-soft);
  }
  @media (hover: hover) {
    .card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-card-hover);
    }
    .btn-cta:hover { transform: scale(1.03); }
  }
  .section-dark {
    background-color: var(--surface-dark);
    color: var(--text-on-dark);
  }
  .section-dark h2, .section-dark h3 {
    color: var(--text-heading-dark);
    text-shadow: var(--glow-neon);
  }

  /* --- スクロールリビール --- */
  .reveal {
    opacity: 0;
    transform: translateY(16px);
    transition: opacity var(--dur-reveal) var(--ease-soft), transform var(--dur-reveal) var(--ease-soft);
  }
  .reveal.revealed { opacity: 1; transform: none; }

  /* --- マスコット吹き出し（ルール/記事の会話UI） --- */
  .speech {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    margin-block: 1rem;
  }
  .speech > img { width: 3.5rem; height: 3.5rem; flex: none; }
  .speech > p {
    border-radius: var(--radius-bubble);
    padding: 0.75rem 1rem;
    line-height: var(--leading-body);
  }
  .speech-maru > p { background-color: var(--color-primary); color: var(--text-body); border-top-left-radius: var(--radius-bubble-tail); }
  .speech-fudo { flex-direction: row-reverse; }
  .speech-fudo > p { background-color: var(--surface-dark-card); color: var(--text-on-dark); border-top-right-radius: var(--radius-bubble-tail); }

  /* --- 旧クラス互換（Instructions/記事のHTML改修を最小化） --- */
  .color1 { color: var(--color-accent); }
  .keiko_yellow { background: linear-gradient(transparent 60%, var(--color-primary) 60%); }
  .balloon2-top {
    position: relative;
    margin: 1rem 0;
    padding: 1rem 1.25rem;
    border-radius: var(--radius-bubble);
    background-color: var(--surface-card);
    box-shadow: var(--shadow-card);
  }
  .manual { max-width: 100%; border-radius: var(--radius-img); box-shadow: var(--shadow-card); }
  .torokubtn { max-width: 220px; }
  .mkj { list-style: none; padding: 0; display: grid; gap: 0.5rem; }
  .mkj a {
    display: block;
    min-height: var(--tap-min);
    padding: 0.6rem 1rem;
    border-radius: var(--radius-pill);
    background-color: var(--surface-card);
    color: var(--text-link);
    font-weight: 700;
    text-decoration: none;
    box-shadow: var(--shadow-pill);
  }
  .newicon {
    display: inline-block;
    margin-left: 0.5rem;
    padding: 0.1rem 0.6rem;
    border-radius: var(--radius-pill);
    background-color: var(--color-dark-accent);
    color: var(--text-on-cta);
    font-size: 0.7rem;
  }
  .counterspan {
    display: inline-block;
    padding: 0.4rem 1rem;
    font-family: var(--font-numeric);
    background-color: var(--surface-card);
    border-radius: var(--radius-pill);
  }

  /* --- カラオケのスライド送り（karaoke.ts が animationName を切り替える契約） --- */
  .fadeInAnime { animation: fadeInAnime 0.8s ease both; }
}

@keyframes fadeInAnime {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: none; }
}
@keyframes fadeInAnimeright {
  from { opacity: 0; transform: translateX(24px); }
  to { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .reveal { opacity: 1; transform: none; transition: none; }
  .btn-cta::before { animation: none; }
  .fadeInAnime { animation: none; }
  .card, .btn-cta { transition: none; }
}
```

- [ ] **Step 3: ビルドと既存テストを確認**

Run: `npm run build && npm test && npx tsc --noEmit`
Expected: すべて成功（この時点で見た目は崩れてよい。旧CSSはまだ残っている）

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/styles/tailwind.css
git commit -m "feat: add design tokens and component layer on Tailwind v4"
```

---

### Task 2: Handlebars ページメタと共通パーシャル

**Files:**
- Modify: `vite.config.ts`（handlebars `context` 追加）
- Create: `partials/head-meta.hbs`
- Create: `partials/site-header.hbs`
- Create: `partials/bottom-nav.hbs`
- Modify: `partials/footer.hbs`

**Interfaces:**
- Consumes: Task 1 のクラス群
- Produces: 各ページが `{{> head-meta}}` `{{> site-header}}` `{{> bottom-nav}}` `{{> footer}}` を読み込む。head-meta はページ変数 `{{title}}` `{{description}}` を使う（vite.config の `PAGE_META` が供給）。bottom-nav のルート要素は `id="bottom-nav"`（Task 3 の `initBottomNav` が参照）

- [ ] **Step 1: `vite.config.ts` にページメタの context を追加**

`handlebars({...})` を以下に置き換える（`input` はそのまま）:

```ts
const PAGE_META: Record<string, { title: string; description: string }> = {
  "/index.html": { title: "インサイダーゲームツール", description: "LINEだけで遊べる正体隠匿ゲーム。インサイダーゲーム進行サポートBOTを無料公開しています。" },
  "/rule.html": { title: "ルール | インサイダーゲームツール", description: "インサイダーゲームのルールと役職（市民・マスター・インサイダー）をステップ形式で解説します。" },
  "/Instructions.html": { title: "使い方 | インサイダーゲームツール", description: "LINE BOTの使い方マニュアル。村の作り方・参加方法・特殊機能の紹介。" },
  "/form.html": { title: "特殊村作成 | インサイダーゲームツール", description: "特殊な配役をしたい場合はこちらから" },
  "/line.html": { title: "ブラウザ版 | インサイダーゲームツール", description: "LINEを使用しない方はこちらから" },
  "/opinion.html": { title: "よくある質問・ご意見 | インサイダーゲームツール", description: "よくある質問と、ご意見・ご要望の送信フォーム。" },
  "/article/article_001.html": { title: "300人お友達記念座談会 | インサイダーゲームツール", description: "日頃のインサイダーゲームにおける疑問や意見を話し合いました。" },
  "/article/article_002.html": { title: "コラム「適切なお題とは」 | インサイダーゲームツール", description: "インサイダーゲームの適切なお題について思うところを書きました。" },
  "/article/article_003.html": { title: "コラム「お題の美学」 | インサイダーゲームツール", description: "お題クリエイターのお題の美学をまとめました。" },
  "/article/article_004.html": { title: "コラム「絶対お題出す教」 | インサイダーゲームツール", description: "絶対お題出す教の魅力を語りました。" },
  "/other/powerpointkaraoke.html": { title: "パワポカラオケ", description: "パワポカラオケをする場はこちらから" },
};

// plugins 内:
handlebars({
  partialDirectory: fromRoot("./partials"),
  compileOptions: { preventIndent: true },
  context: (pagePath: string) => PAGE_META[pagePath] ?? PAGE_META["/index.html"],
}),
```

- [ ] **Step 2: `partials/head-meta.hbs` を作成**

```hbs
<meta charset="UTF-8" />
<title>{{title}}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="description" content="{{description}}" />
<meta name="keywords" content="インサイダーゲーム,人狼,インサイダーゲームツール,正体隠匿,ボードゲーム,ラインボット,インサイダー,LINEBOT" />
<link rel="icon" type="image/png" href="/contents/img/favicon-32.png" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@700;900&family=M+PLUS+Rounded+1c:wght@400;700&family=Baloo+2:wght@700&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/src/styles/tailwind.css" />
<meta property="og:site_name" content="インサイダーゲームツール" />
<meta property="og:title" content="{{title}}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="https://insidergametool.netlify.app" />
<meta property="og:image" content="https://insidergametool.netlify.app/contents/img/ogp.png" />
<meta property="og:description" content="{{description}}" />
<meta property="og:locale" content="ja_JP" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:site" content="@2d7rqU5gFQ6VpGo" />
```

（favicon-32.png と ogp.png は Task 10 で生成。それまで404でもビルドは通る）

- [ ] **Step 3: `partials/site-header.hbs` を作成**

```hbs
<header class="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
  <a href="/index.html" class="flex items-center gap-2 no-underline">
    <img src="/contents/img/maru_base.webp" alt="" width="40" height="40" />
    <span class="font-heading text-lg font-black text-accent">インサイダーゲームツール</span>
  </a>
  <a href="https://line.me/R/ti/p/%40966mpnqz" class="btn-cta hidden !min-h-10 !px-4 !text-sm md:inline-flex">友だち追加してはじめる</a>
</header>
```

- [ ] **Step 4: `partials/bottom-nav.hbs` を作成**

スペックの「ボトム固定ナビ3項目」と「フローティングCTA（下スクロールで隠れ上スクロールで再表示）」は、**中央をCTAにした1本のバー**として実装する（2本重ねると画面占有が過大なため。隠れる/再表示の挙動はバー全体に適用）。

```hbs
<nav id="bottom-nav" class="fixed inset-x-0 bottom-0 z-50 transition-transform duration-300" aria-label="メインナビゲーション">
  <div class="mx-auto flex max-w-md items-end justify-around gap-2 rounded-t-3xl border-t border-primary bg-white/90 px-3 pb-2 pt-1 shadow-[0_-4px_20px_rgba(94,58,135,0.15)] backdrop-blur">
    <a href="/rule.html" class="flex min-h-11 min-w-16 flex-col items-center justify-center gap-0.5 text-xs font-bold text-accent no-underline">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
      ルール
    </a>
    <a href="https://line.me/R/ti/p/%40966mpnqz" class="btn-cta -mt-5 !min-h-12 !px-5 !text-sm">友だち追加してはじめる</a>
    <a href="/opinion.html" class="flex min-h-11 min-w-16 flex-col items-center justify-center gap-0.5 text-xs font-bold text-accent no-underline">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
      FAQ
    </a>
  </div>
</nav>
```

- [ ] **Step 5: `partials/footer.hbs` を書き換え**

```hbs
<footer class="section-dark mt-16 px-4 pb-8 pt-10 text-center text-sm">
  <img src="/contents/img/fudo_base.webp" alt="" width="64" height="64" class="mx-auto mb-3" />
  <nav class="mb-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
    <a class="text-dark-text underline" href="/index.html">ホーム</a>
    <a class="text-dark-text underline" href="/rule.html">ルール</a>
    <a class="text-dark-text underline" href="/Instructions.html">使い方</a>
    <a class="text-dark-text underline" href="/form.html">特殊村作成</a>
    <a class="text-dark-text underline" href="/line.html">ブラウザ版</a>
    <a class="text-dark-text underline" href="/opinion.html">FAQ・ご意見</a>
  </nav>
  <small>Copyright&copy; <a class="text-dark-text" href="/index.html">InsiderGameTool</a> All Rights Reserved.</small>
</footer>
```

- [ ] **Step 6: ビルド確認と Commit**

Run: `npm run build && npx tsc --noEmit`
Expected: 成功（新パーシャルはまだどのページからも参照されていない）

```bash
git add vite.config.ts partials/head-meta.hbs partials/site-header.hbs partials/bottom-nav.hbs partials/footer.hbs
git commit -m "feat: add shared partials (head-meta/site-header/bottom-nav) and per-page meta context"
```

※ footer.hbs は全ページ参照中のため、この時点で旧ページの見た目が変わるが許容する（以降のタスクで各ページを追従させる）。

---

### Task 3: UIモジュールと common.ts の刷新

**Files:**
- Create: `src/ui/bottom-nav.ts`
- Test: `src/ui/bottom-nav.test.ts`
- Create: `src/ui/scroll-reveal.ts`
- Test: `src/ui/scroll-reveal.test.ts`
- Modify: `src/pages/common.ts`（全面書き換え）

**Interfaces:**
- Consumes: `#bottom-nav`（Task 2）、`.reveal`/`.revealed`（Task 1）
- Produces: `initCommonPage(): void`（既存と同名・自動初期化も既存同様）。`nextBarState(prevY: number, currY: number, state: BarState): BarState`、`initBottomNav(): void`、`initScrollReveal(): void`

- [ ] **Step 1: bottom-nav の失敗するテストを書く**

`src/ui/bottom-nav.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { nextBarState } from "./bottom-nav";

describe("nextBarState", () => {
  it("ページ上部では常に表示", () => {
    expect(nextBarState(200, 50, "hidden")).toBe("visible");
  });
  it("下スクロールで隠れる", () => {
    expect(nextBarState(100, 160, "visible")).toBe("hidden");
  });
  it("上スクロールで再表示する", () => {
    expect(nextBarState(400, 340, "hidden")).toBe("visible");
  });
  it("微小な揺れ（±4px以内）では状態を変えない", () => {
    expect(nextBarState(300, 302, "visible")).toBe("visible");
    expect(nextBarState(300, 298, "hidden")).toBe("hidden");
  });
});
```

- [ ] **Step 2: テストが落ちることを確認**

Run: `npx vitest run src/ui/bottom-nav.test.ts`
Expected: FAIL（`bottom-nav.ts` が存在しない）

- [ ] **Step 3: `src/ui/bottom-nav.ts` を実装**

```ts
export type BarState = "visible" | "hidden";

const TOP_THRESHOLD = 80;
const JITTER = 4;

export function nextBarState(prevY: number, currY: number, state: BarState): BarState {
  if (currY < TOP_THRESHOLD) {
    return "visible";
  }
  if (currY > prevY + JITTER) {
    return "hidden";
  }
  if (currY < prevY - JITTER) {
    return "visible";
  }
  return state;
}

export function initBottomNav(): void {
  const nav = document.querySelector<HTMLElement>("#bottom-nav");
  if (!nav) {
    return;
  }

  let prevY = window.scrollY;
  let state: BarState = "visible";

  window.addEventListener(
    "scroll",
    () => {
      const currY = window.scrollY;
      const next = nextBarState(prevY, currY, state);
      if (next !== state) {
        state = next;
        nav.classList.toggle("translate-y-full", state === "hidden");
      }
      prevY = currY;
    },
    { passive: true },
  );
}
```

- [ ] **Step 4: テストが通ることを確認**

Run: `npx vitest run src/ui/bottom-nav.test.ts`
Expected: PASS（4件）

- [ ] **Step 5: scroll-reveal の失敗するテストを書く**

`src/ui/scroll-reveal.test.ts`（jsdom には IntersectionObserver がないためスタブする）:

```ts
import { afterEach, describe, expect, it, vi } from "vitest";
import { initScrollReveal } from "./scroll-reveal";

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("initScrollReveal", () => {
  it("IntersectionObserver 非対応環境では即座に全要素を表示する", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    document.body.innerHTML = '<div class="reveal"></div><div class="reveal"></div>';
    initScrollReveal();
    expect(document.querySelectorAll(".reveal.revealed")).toHaveLength(2);
  });

  it("交差した要素に revealed を付与する", () => {
    let callback: (entries: { isIntersecting: boolean; target: Element }[]) => void = () => {};
    const observe = vi.fn();
    const unobserve = vi.fn();
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        constructor(cb: typeof callback) {
          callback = cb;
        }
        observe = observe;
        unobserve = unobserve;
      },
    );
    document.body.innerHTML = '<div class="reveal" id="a"></div>';
    initScrollReveal();
    const target = document.querySelector("#a")!;
    expect(observe).toHaveBeenCalledOnce();
    callback([{ isIntersecting: true, target }]);
    expect(target.classList.contains("revealed")).toBe(true);
    expect(unobserve).toHaveBeenCalledWith(target);
  });
});
```

- [ ] **Step 6: テストが落ちることを確認**

Run: `npx vitest run src/ui/scroll-reveal.test.ts`
Expected: FAIL（`scroll-reveal.ts` が存在しない）

- [ ] **Step 7: `src/ui/scroll-reveal.ts` を実装**

```ts
export function initScrollReveal(): void {
  const targets = [...document.querySelectorAll<HTMLElement>(".reveal")];
  if (targets.length === 0) {
    return;
  }

  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  if (reduced || typeof IntersectionObserver === "undefined") {
    targets.forEach((target) => target.classList.add("revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  targets.forEach((target) => observer.observe(target));
}
```

- [ ] **Step 8: テストが通ることを確認**

Run: `npx vitest run src/ui/scroll-reveal.test.ts`
Expected: PASS（2件）

- [ ] **Step 9: `src/pages/common.ts` を全面書き換え**

旧実装のうち `initSmoothScroll` のみ残し、`initPageTop`（対応DOMなしのデッドコード）・`initLateralNavigation`（サイドナビ廃止）・`initFadeInAnimations`（scrollイベント直計算）を削除:

```ts
import { initBottomNav } from "../ui/bottom-nav";
import { initScrollReveal } from "../ui/scroll-reveal";

function initSmoothScroll(): void {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const href = anchor.getAttribute("href") ?? "";
      const target =
        href === "#" || href === ""
          ? document.documentElement
          : document.querySelector(href);

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

export function initCommonPage(): void {
  if (document.documentElement.dataset.commonInitialized === "true") {
    return;
  }

  document.documentElement.dataset.commonInitialized = "true";
  initSmoothScroll();
  initScrollReveal();
  initBottomNav();
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCommonPage, { once: true });
  } else {
    initCommonPage();
  }
}
```

- [ ] **Step 10: 全テスト・型チェック・Commit**

Run: `npm test && npx tsc --noEmit`
Expected: 既存テスト含め全パス

```bash
git add src/ui src/pages/common.ts
git commit -m "feat: add bottom-nav/scroll-reveal modules and slim down common page init"
```

---

### Task 4: index.html 刷新（静的構造）

**Files:**
- Modify: `index.html`（全面書き換え）

**Interfaces:**
- Consumes: 全パーシャル、Task 1 クラス群、画像 `maru_base.webp` `fudo_whisper.webp` `hero_fallback.webp` `step1_add.webp` `step2_village.webp` `step3_play.webp` `role_*.webp` `article0*_OGP` `zadankaiOGP.jpg`
- Produces: Task 5 が参照するDOM: `#hero-canvas`（canvas）、`#hero-fallback`（img）、`.hero-mascot`、`.hero-char`（コピー1文字ずつ）、`.hero-sub`、`.hero-cta-area`、`[data-parallax]`

- [ ] **Step 1: `index.html` を以下の構造で全面書き換え**

構成: ヒーロー → トーク疑似体験 → 魅力Bento → 遊び方3ステップ → 世界観（ダーク面）→ 記事 → 最終CTA。旧「更新情報・お知らせ」「サイト説明」セクションは廃止（スペック§5の構成に含まれないため。記事への導線は記事セクションが担う）。

```html
<!DOCTYPE html>
<html lang="ja">
  <head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# article: http://ogp.me/ns/article#">
    {{> head-meta}}
    <meta name="google-site-verification" content="YFH2qlfN8g5PP6_VJcy1TO3_CmC5acQfwPLmAZOOIhM" />
    <script type="module" src="/src/pages/index.ts"></script>
  </head>
  <body>
    {{> site-header}}
    <main>
      <!-- ヒーロー -->
      <section id="hero" class="relative overflow-hidden">
        <canvas id="hero-canvas" class="absolute inset-0 h-full w-full" aria-hidden="true"></canvas>
        <img id="hero-fallback" src="/contents/img/hero_fallback.webp" alt="" class="absolute inset-0 hidden h-full w-full object-cover" />
        <div class="relative z-10 mx-auto flex min-h-[85svh] max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
          <img src="/contents/img/maru_base.webp" alt="マスコットのまる" width="160" height="160" class="hero-mascot" fetchpriority="high" />
          <h1 class="font-heading text-4xl font-black leading-tight md:text-6xl">
            <span class="hero-char">答</span><span class="hero-char">え</span><span class="hero-char">を</span><span class="hero-char">知</span><span class="hero-char">っ</span><span class="hero-char">て</span><span class="hero-char">る</span><span class="hero-char">の</span><span class="hero-char">は</span><span class="hero-char">、</span><br class="md:hidden" /><span class="hero-char">だ</span><span class="hero-char">れ</span><span class="hero-char">？</span>
          </h1>
          <p class="hero-sub text-lg font-bold">LINEだけで遊べる正体隠匿ゲーム。<br />インサイダーゲーム進行サポートBOT</p>
          <div class="hero-cta-area flex flex-col items-center gap-2">
            <a href="https://line.me/R/ti/p/%40966mpnqz" class="btn-cta text-lg">友だち追加してはじめる</a>
            <p class="text-sm font-bold text-accent">無料・アプリ不要・<span class="font-numeric">2〜20</span>人で遊べる</p>
          </div>
        </div>
      </section>

      <!-- トーク疑似体験 -->
      <section class="mx-auto max-w-xl px-4 py-16">
        <h2 class="reveal mb-6 text-center text-2xl">友だち追加したら、こうなる</h2>
        <div class="reveal card space-y-3 !bg-secondary/40" data-parallax="0.15">
          <div class="speech speech-maru"><img src="/contents/img/maru_base.webp" alt="" /><p>こんにちは！ 参加したい村の番号を入力してください。</p></div>
          <p class="ml-auto w-fit rounded-2xl rounded-tr-sm bg-cta px-4 py-2 text-white">1234</p>
          <div class="speech speech-maru"><img src="/contents/img/maru_base.webp" alt="" /><p>あなたは <strong>庶民</strong> です。質問でお題を当てよう！</p></div>
          <div class="speech speech-fudo"><img src="/contents/img/fudo_whisper.webp" alt="" /><p>（きみがインサイダーなら、お題もこっそり届くよ…）</p></div>
        </div>
      </section>

      <!-- 魅力Bento -->
      <section class="mx-auto max-w-4xl px-4 py-8">
        <h2 class="reveal mb-6 text-center text-2xl">かんたん、すぐ遊べる</h2>
        <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div class="reveal card col-span-2 text-center"><p class="font-numeric text-4xl text-accent">2〜20<span class="text-lg">人</span></p><p class="mt-1 text-sm font-bold">大人数でも遊べる</p></div>
          <div class="reveal card text-center"><p class="font-numeric text-4xl text-accent">10<span class="text-lg">分</span></p><p class="mt-1 text-sm font-bold">1ゲームの目安</p></div>
          <div class="reveal card text-center"><p class="font-numeric text-4xl text-accent">¥0</p><p class="mt-1 text-sm font-bold">完全無料</p></div>
          <div class="reveal card col-span-2 text-center"><p class="text-xl font-bold text-accent">準備はLINEだけ</p><p class="mt-1 text-sm">カードもアプリも不要。飲み会の席ですぐ始められる</p></div>
          <div class="reveal card col-span-2 text-center"><p class="text-xl font-bold text-accent">離れた友だちとも</p><p class="mt-1 text-sm">参加者同士が友だちである必要はありません</p></div>
        </div>
      </section>

      <!-- 遊び方3ステップ -->
      <section class="mx-auto max-w-4xl px-4 py-16">
        <h2 class="reveal mb-8 text-center text-2xl">遊び方は3ステップ</h2>
        <ol class="grid gap-6 md:grid-cols-3">
          <li class="reveal card text-center"><img src="/contents/img/step1_add.webp" alt="" class="mx-auto mb-3 w-40" /><p class="font-numeric text-accent">STEP 1</p><h3 class="text-lg">友だち追加</h3><p class="mt-1 text-sm">参加者全員がBOTを友だち追加します</p></li>
          <li class="reveal card text-center"><img src="/contents/img/step2_village.webp" alt="" class="mx-auto mb-3 w-40" /><p class="font-numeric text-accent">STEP 2</p><h3 class="text-lg">村を作る</h3><p class="mt-1 text-sm">1人が村を作成し、村番号をみんなに伝えます</p></li>
          <li class="reveal card text-center"><img src="/contents/img/step3_play.webp" alt="" class="mx-auto mb-3 w-40" /><p class="font-numeric text-accent">STEP 3</p><h3 class="text-lg">ゲーム開始</h3><p class="mt-1 text-sm">村番号を入力すると役職が届きます。さあ、推理開始！</p></li>
        </ol>
        <p class="reveal mt-6 text-center"><a href="/Instructions.html" class="font-bold text-accent underline">くわしい使い方を見る</a></p>
      </section>

      <!-- 世界観（ダーク面） -->
      <section class="section-dark px-4 py-20">
        <div class="mx-auto max-w-3xl text-center">
          <img src="/contents/img/fudo_base.webp" alt="インサイダーのふーど" width="140" height="140" class="reveal mx-auto mb-6" data-parallax="0.3" />
          <h2 class="reveal text-2xl md:text-3xl">この中に、ひとりだけ<br />答えを知っているやつがいる。</h2>
          <p class="reveal mt-4">お題を当てたら終わりじゃない。<br />「誰がインサイダーだったのか」——本当のゲームはそこから始まる。</p>
          <div class="reveal mt-8 grid grid-cols-3 gap-3">
            <img src="/contents/img/role_citizen.webp" alt="役職カード：庶民" />
            <img src="/contents/img/role_master.webp" alt="役職カード：マスター" />
            <img src="/contents/img/role_insider.webp" alt="役職カード：インサイダー" />
          </div>
          <p class="reveal mt-6"><a href="/rule.html" class="font-bold text-dark-sub underline">ルールと役職をくわしく見る</a></p>
        </div>
      </section>

      <!-- 記事 -->
      <section class="mx-auto max-w-4xl px-4 py-16">
        <h2 class="reveal mb-6 text-center text-2xl">読みもの</h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <a href="/article/article_004.html" class="reveal card block no-underline"><img src="/contents/img/article04_OGP.png" alt="" class="mb-3 rounded-xl" /><h3 class="text-base">コラム「絶対お題出す教」</h3><p class="mt-1 text-sm text-ink">絶対お題出す教の魅力を語りました</p></a>
          <a href="/article/article_003.html" class="reveal card block no-underline"><img src="/contents/img/article03_OGP.jpg" alt="" class="mb-3 rounded-xl" /><h3 class="text-base">コラム「お題の美学」</h3><p class="mt-1 text-sm text-ink">お題クリエイターのお題の美学をまとめました</p></a>
          <a href="/article/article_002.html" class="reveal card block no-underline"><img src="/contents/img/article02_OGP.jpg" alt="" class="mb-3 rounded-xl" /><h3 class="text-base">コラム「適切なお題とは」</h3><p class="mt-1 text-sm text-ink">インサイダーゲームの適切なお題について書きました</p></a>
          <a href="/article/article_001.html" class="reveal card block no-underline"><img src="/contents/img/zadankaiOGP.jpg" alt="" class="mb-3 rounded-xl" /><h3 class="text-base">300人お友達記念座談会！</h3><p class="mt-1 text-sm text-ink">日頃のインサイダーゲームにおける疑問や意見を話し合いました</p></a>
        </div>
        <p class="reveal mt-4 text-center text-sm"><a href="/other/powerpointkaraoke.html" class="text-accent underline">おまけ: パワポカラオケ</a> ／ <a href="/line.html" class="text-accent underline">ブラウザ版はこちら</a></p>
      </section>

      <!-- 最終CTA -->
      <section class="px-4 pb-20 pt-8 text-center">
        <img src="/contents/img/maru_joy.webp" alt="" width="120" height="120" class="reveal mx-auto mb-4" />
        <h2 class="reveal mb-6 text-2xl">さあ、仲間をあつめよう</h2>
        <a href="https://line.me/R/ti/p/%40966mpnqz" class="reveal btn-cta text-lg">友だち追加してはじめる</a>
      </section>
    </main>
    {{> bottom-nav}}
    {{> footer}}
  </body>
</html>
```

- [ ] **Step 2: エントリ `src/pages/index.ts` を暫定作成（モーションは Task 5）**

```ts
import { initCommonPage } from "./common";

initCommonPage();
```

- [ ] **Step 3: dev サーバーで表示確認**

Run: `npm run build && npx tsc --noEmit`
Expected: 成功。`npm run dev` でトップを開き、ヒーロー（静的）・Bento・3ステップ・ダーク面・記事・ボトムナビが新デザインで表示され、下スクロールでナビが隠れ上スクロールで再表示されること

- [ ] **Step 4: Commit**

```bash
git add index.html src/pages/index.ts
git commit -m "feat: rebuild top page with hero/bento/steps/dark sections"
```

---

### Task 5: index モーション（GSAP + three.js ヒーロー）

**Files:**
- Create: `src/hero/three-hero.ts`
- Modify: `src/pages/index.ts`

**Interfaces:**
- Consumes: `#hero-canvas` `#hero-fallback` `.hero-mascot` `.hero-char` `.hero-sub` `.hero-cta-area` `[data-parallax]`（Task 4）
- Produces: `startThreeHero(canvas: HTMLCanvasElement): () => void`（戻り値は停止関数）

- [ ] **Step 1: `src/hero/three-hero.ts` を実装**

パステル小物スプライトが浮遊し、ポインタ（PC）とスクロールで視差が付く3Dシーン。DPRキャップ・画面外停止・破棄関数を備える:

```ts
import * as THREE from "three";

const SPRITE_URLS = [
  "/contents/img/obj_mask.webp",
  "/contents/img/obj_magnifier.webp",
  "/contents/img/obj_card.webp",
  "/contents/img/obj_keyhole.webp",
];

type FloatingItem = {
  sprite: THREE.Sprite;
  baseX: number;
  baseY: number;
  depth: number;
  speed: number;
  phase: number;
};

export function startThreeHero(canvas: HTMLCanvasElement): () => void {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 8;

  const loader = new THREE.TextureLoader();
  const items: FloatingItem[] = [];

  SPRITE_URLS.forEach((url, spriteIndex) => {
    const texture = loader.load(url);
    texture.colorSpace = THREE.SRGBColorSpace;
    for (let i = 0; i < 3; i += 1) {
      const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
      const sprite = new THREE.Sprite(material);
      const depth = -1.5 - ((spriteIndex * 3 + i) % 5);
      const baseX = (Math.random() - 0.5) * 12;
      const baseY = (Math.random() - 0.5) * 7;
      sprite.position.set(baseX, baseY, depth);
      const scale = 1 + Math.random();
      sprite.scale.set(scale, scale, 1);
      scene.add(sprite);
      items.push({
        sprite,
        baseX,
        baseY,
        depth,
        speed: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
      });
    }
  });

  let pointerX = 0;
  let pointerY = 0;
  const onPointerMove = (event: PointerEvent): void => {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 2;
  };
  window.addEventListener("pointermove", onPointerMove, { passive: true });

  const resize = (): void => {
    const { clientWidth, clientHeight } = canvas;
    renderer.setSize(clientWidth, clientHeight, false);
    camera.aspect = clientWidth / Math.max(clientHeight, 1);
    camera.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  let visible = true;
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0]?.isIntersecting ?? true;
  });
  observer.observe(canvas);

  let running = true;
  const clock = new THREE.Clock();

  const tick = (): void => {
    if (!running) {
      return;
    }
    requestAnimationFrame(tick);
    if (!visible) {
      return;
    }

    const elapsed = clock.getElapsedTime();
    const scrollOffset = window.scrollY * 0.003;

    items.forEach((item) => {
      // ふわふわ浮遊 + 深度に応じたポインタ/スクロール視差
      const parallax = 1 / Math.abs(item.depth);
      item.sprite.position.x =
        item.baseX + Math.sin(elapsed * item.speed + item.phase) * 0.4 - pointerX * 6 * parallax;
      item.sprite.position.y =
        item.baseY + Math.cos(elapsed * item.speed + item.phase) * 0.3 + pointerY * 3 * parallax + scrollOffset / parallax;
    });

    renderer.render(scene, camera);
  };
  tick();

  return () => {
    running = false;
    observer.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("resize", resize);
    renderer.dispose();
  };
}
```

- [ ] **Step 2: `src/pages/index.ts` にモーション初期化を実装**

reduced-motion時はGSAP/threeとも初期化せず、フォールバック静止画を表示。WebGL非対応も同様:

```ts
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initCommonPage } from "./common";

initCommonPage();

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function supportsWebGL(): boolean {
  try {
    const probe = document.createElement("canvas");
    return probe.getContext("webgl2") !== null || probe.getContext("webgl") !== null;
  } catch {
    return false;
  }
}

function showHeroFallback(): void {
  document.querySelector<HTMLElement>("#hero-canvas")?.remove();
  document.querySelector<HTMLElement>("#hero-fallback")?.classList.remove("hidden");
}

function initHeroTimeline(): void {
  gsap.set(".hero-mascot", { scale: 0 });
  gsap.set(".hero-char", { opacity: 0, y: 24 });
  gsap.set(".hero-sub, .hero-cta-area", { opacity: 0, y: 16 });

  gsap
    .timeline({ defaults: { ease: "power3.out" } })
    .to(".hero-mascot", { scale: 1, duration: 0.6, ease: "back.out(2.5)" })
    .to(".hero-char", { opacity: 1, y: 0, duration: 0.35, stagger: 0.05 }, "-=0.2")
    .to(".hero-sub, .hero-cta-area", { opacity: 1, y: 0, duration: 0.5 }, "-=0.1");
}

function initSectionParallax(): void {
  gsap.registerPlugin(ScrollTrigger);
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
    const depth = Number(element.dataset.parallax ?? "0.2");
    gsap.to(element, {
      y: () => -120 * depth,
      ease: "none",
      scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
}

function initHeroThree(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#hero-canvas");
  if (!canvas || !supportsWebGL()) {
    showHeroFallback();
    return;
  }
  void import("../hero/three-hero").then(({ startThreeHero }) => {
    startThreeHero(canvas);
  });
}

if (reducedMotion) {
  showHeroFallback();
} else {
  initHeroTimeline();
  initSectionParallax();
  initHeroThree();
}
```

- [ ] **Step 3: 動作確認**

Run: `npm run build && npx tsc --noEmit && npm test`
Expected: 成功。`npm run dev` で①マスコットがぽよんと登場→コピーが1文字ずつリビール、②小物がふわふわ浮遊しポインタ移動で視差、③OSの「視差効果を減らす」を有効にすると静止画フォールバックになること（DevTools の Rendering → Emulate CSS prefers-reduced-motion で確認）

- [ ] **Step 4: Commit**

```bash
git add src/hero src/pages/index.ts
git commit -m "feat: add GSAP hero timeline and lazy three.js floating scene"
```

---

### Task 6: rule.html 刷新 + rule.ts

**Files:**
- Modify: `rule.html`（全面書き換え）
- Create: `src/pages/rule.ts`

**Interfaces:**
- Consumes: パーシャル群、`role_*.webp` `maru_*.webp` `fudo_*.webp`、GSAP
- Produces: `#step-nav` 内の `.step-dot[data-step]`、`section[data-step]`（rule.ts が進捗ハイライトに使用）

- [ ] **Step 1: `rule.html` を全面書き換え**

ステップUI（①概要→②役職〔ダーク面〕→③進行→④勝敗）。役職の勝利条件テキストは旧 `rule.html:43-51` の文言を一字一句維持。外部漫画リンク（`https://twitter.com/kodake_555/status/1138774359282147328`）も維持:

```html
<!DOCTYPE html>
<html lang="ja">
  <head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# article: http://ogp.me/ns/article#">
    {{> head-meta}}
    <script type="module" src="/src/pages/rule.ts"></script>
  </head>
  <body>
    {{> site-header}}
    <!-- 進捗インジケーター -->
    <nav id="step-nav" class="sticky top-0 z-40 bg-base/90 px-4 py-2 backdrop-blur" aria-label="ルール解説の進捗">
      <ol class="mx-auto flex max-w-md justify-between font-numeric text-sm">
        <li><a href="#step1" class="step-dot" data-step="1">1. 概要</a></li>
        <li><a href="#step2" class="step-dot" data-step="2">2. 役職</a></li>
        <li><a href="#step3" class="step-dot" data-step="3">3. 進行</a></li>
        <li><a href="#step4" class="step-dot" data-step="4">4. 勝敗</a></li>
      </ol>
    </nav>
    <main>
      <section id="step1" data-step="1" class="mx-auto max-w-2xl px-4 py-12">
        <h2 class="mb-6 text-2xl">1. インサイダーゲームってなに？</h2>
        <div class="speech speech-maru reveal"><img src="/contents/img/maru_base.webp" alt="まる" /><p>お題当てクイズ＋犯人さがし！ みんなで質問してお題を当てるんだけど……</p></div>
        <div class="speech speech-fudo reveal"><img src="/contents/img/fudo_whisper.webp" alt="ふーど" /><p>参加者の中にひとりだけ、<strong>最初から答えを知ってる「インサイダー」</strong>が混ざってるんだ。</p></div>
        <div class="speech speech-maru reveal"><img src="/contents/img/maru_surprise.webp" alt="まる" /><p>お題が当たったら、こんどは「誰がインサイダーだったか」を投票で当てるよ！</p></div>
        <div class="card reveal mt-6 text-center">
          <p class="mb-2 font-bold">とてもかわいらしいルール説明の漫画が公開されています。<span class="color1"><strong>丸投げします！</strong></span></p>
          <a href="https://twitter.com/kodake_555/status/1138774359282147328"><img class="manual mx-auto" src="/contents/img/manga.jpg" alt="ルール説明漫画" /></a>
        </div>
      </section>

      <section id="step2" data-step="2" class="section-dark px-4 py-16">
        <div class="mx-auto max-w-3xl">
          <h2 class="mb-8 text-center text-2xl">2. 役職しょうかい</h2>
          <div class="grid gap-6 md:grid-cols-3">
            <figure class="role-card reveal text-center"><img src="/contents/img/role_citizen.webp" alt="庶民（村人）" /><figcaption class="mt-3 text-sm">庶民（村人）<br />勝利条件：誰かが制限時間内にお題を当てる。かつ、インサイダーを決める投票でインサイダーに最多投票が入る。</figcaption></figure>
            <figure class="role-card reveal text-center"><img src="/contents/img/role_master.webp" alt="マスター（GM）" /><figcaption class="mt-3 text-sm">マスター（GM）<br />勝利条件：誰かが制限時間内にお題を当てる。かつ、インサイダーを決める投票でインサイダーに最多投票が入る。</figcaption></figure>
            <figure class="role-card reveal text-center"><img src="/contents/img/role_insider.webp" alt="インサイダー" /><figcaption class="mt-3 text-sm">インサイダー<br />勝利条件：誰かが制限時間内にお題を当てる。かつ、自分が最多投票にならない。</figcaption></figure>
          </div>
        </div>
      </section>

      <section id="step3" data-step="3" class="mx-auto max-w-2xl px-4 py-12">
        <h2 class="mb-6 text-2xl">3. ゲームの進行</h2>
        <ol class="grid gap-4">
          <li class="card reveal"><h3 class="text-base">① 村を作る</h3><p class="mt-1 text-sm">参加者の1人がBOTで村を作成し、表示された村番号をみんなに伝えます。</p></li>
          <li class="card reveal"><h3 class="text-base">② 役職を確認</h3><p class="mt-1 text-sm">各自が村番号（数字4桁）をBOTへ入力すると、自分の役職が届きます。インサイダーにはお題も届きます。</p></li>
          <li class="card reveal"><h3 class="text-base">③ 質問タイム</h3><p class="mt-1 text-sm">マスターに「はい／いいえ」で答えられる質問をして、制限時間内にお題を当てます。</p></li>
          <li class="card reveal"><h3 class="text-base">④ 犯人さがし</h3><p class="mt-1 text-sm">お題が当たったら討論スタート。「答えを知っていたのは誰か？」を推理して投票します。</p></li>
        </ol>
      </section>

      <section id="step4" data-step="4" class="mx-auto max-w-2xl px-4 pb-16">
        <h2 class="mb-6 text-2xl">4. 勝敗のきまりかた</h2>
        <div class="speech speech-maru reveal"><img src="/contents/img/maru_think.webp" alt="まる" /><p>お題を当てて、さらに投票でインサイダーをみつけたら<strong>庶民とマスターの勝ち</strong>！</p></div>
        <div class="speech speech-fudo reveal"><img src="/contents/img/fudo_base.webp" alt="ふーど" /><p>お題が当たっても、ぼくが投票をすり抜けたら<strong>インサイダーのひとり勝ち</strong>さ。</p></div>
        <div class="speech speech-maru reveal"><img src="/contents/img/maru_base.webp" alt="まる" /><p>制限時間内にお題を当てられなかったら、<strong>全員負け</strong>だよ！ がんばろう！</p></div>
        <div class="reveal mt-8 text-center"><a href="https://line.me/R/ti/p/%40966mpnqz" class="btn-cta">友だち追加してはじめる</a></div>
      </section>
    </main>
    {{> bottom-nav}}
    {{> footer}}
  </body>
</html>
```

- [ ] **Step 2: `.step-dot` と `.role-card` のスタイルを `src/styles/tailwind.css` の `@layer components` に追加**

```css
  .step-dot {
    display: inline-block;
    min-height: 2.75rem;
    padding: 0.6rem 0.75rem;
    border-radius: 9999px;
    color: var(--color-accent);
    font-weight: 700;
    text-decoration: none;
  }
  .step-dot.is-active { background-color: var(--color-primary); }
  .role-card img { border-radius: 1rem; }
  .role-card { filter: drop-shadow(0 0 18px rgb(255 62 165 / 0.25)); }
```

- [ ] **Step 3: `src/pages/rule.ts` を作成**

進捗ハイライト（IntersectionObserver）＋ダーク面の役職カード演出（GSAP ScrollTrigger、reduced-motionガード付き）:

```ts
import { initCommonPage } from "./common";

initCommonPage();

function initStepProgress(): void {
  const dots = [...document.querySelectorAll<HTMLElement>(".step-dot")];
  const sections = [...document.querySelectorAll<HTMLElement>("section[data-step]")];
  if (dots.length === 0 || sections.length === 0 || typeof IntersectionObserver === "undefined") {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }
        const step = (entry.target as HTMLElement).dataset.step;
        dots.forEach((dot) => dot.classList.toggle("is-active", dot.dataset.step === step));
      });
    },
    { rootMargin: "-40% 0px -50% 0px" },
  );
  sections.forEach((section) => observer.observe(section));
}

async function initRoleCardMotion(): Promise<void> {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }
  const { default: gsap } = await import("gsap");
  const { ScrollTrigger } = await import("gsap/ScrollTrigger");
  gsap.registerPlugin(ScrollTrigger);
  gsap.from(".role-card", {
    opacity: 0,
    y: 40,
    scale: 0.9,
    duration: 0.6,
    stagger: 0.15,
    ease: "back.out(1.7)",
    scrollTrigger: { trigger: "#step2", start: "top 60%" },
  });
}

initStepProgress();
void initRoleCardMotion();
```

- [ ] **Step 4: 動作確認と Commit**

Run: `npm run build && npx tsc --noEmit && npm test`
Expected: 成功。dev サーバーで、スクロールに応じて進捗ピルが切り替わり、役職セクションでカードが弾んで登場すること

```bash
git add rule.html src/pages/rule.ts src/styles/tailwind.css
git commit -m "feat: rebuild rule page as step UI with dark role section"
```

---

### Task 7: Instructions.html / opinion.html 刷新

**Files:**
- Modify: `Instructions.html`
- Modify: `opinion.html`

**Interfaces:**
- Consumes: パーシャル群、旧クラス互換スタイル（Task 1: `.color1` `.balloon2-top` `.manual` `.torokubtn` `.mkj` `.keiko_yellow` `.newicon`）
- Produces: 外部から参照されるアンカーID `#wereword` `#gyakumura`（index の旧リンクや外部リンクが使用）と `#01`〜`#06` を維持

- [ ] **Step 1: `Instructions.html` の骨組みを差し替え**

head を `{{> head-meta}}` + `<script type="module" src="/src/pages/common.ts"></script>` に、body を `{{> site-header}}`〜`{{> bottom-nav}}` `{{> footer}}` 構造に変更。`<div id="container">` と `#page_top`/`#page_top2` は削除。本文（旧 `Instructions.html:45-260` の全 `<section>`）は**そのまま移植**し、各 `<section>` に `class="card reveal mx-auto my-6 max-w-2xl"` を付与する。目次セクション（`#mkj`）は先頭に置き、`class="mx-auto my-6 max-w-2xl"`（cardなし）とする。旧 `<span class="color1">` 等のクラスは互換スタイルがあるため変更不要。友だち追加ボタン画像 `toroku.png` のリンクは `<a href="..." class="btn-cta">友だち追加してはじめる</a>` に置き換える（2箇所: 前提セクションと特殊村セクションの `go.png` は `<a href="/form.html" class="btn-cta !bg-accent">特殊村を作成する</a>` に置き換え）。

- [ ] **Step 2: `opinion.html` を全面書き換え（FAQ＋フォーム）**

```html
<!DOCTYPE html>
<html lang="ja">
  <head prefix="og: http://ogp.me/ns# fb: http://ogp.me/ns/fb# article: http://ogp.me/ns/article#">
    {{> head-meta}}
    <script type="module" src="/src/pages/common.ts"></script>
  </head>
  <body>
    {{> site-header}}
    <main class="mx-auto max-w-2xl px-4 py-8">
      <h1 class="mb-8 text-center text-2xl">よくある質問</h1>

      <h2 class="mb-3 text-lg">ゲームについて</h2>
      <details class="faq reveal"><summary>何人から遊べますか？</summary><p>2〜20人で遊べます。おすすめは4〜8人です。</p></details>
      <details class="faq reveal"><summary>1ゲームどれくらいかかりますか？</summary><p>質問タイムと討論をあわせて、1ゲーム10分程度が目安です。</p></details>
      <details class="faq reveal"><summary>お金はかかりますか？</summary><p>完全無料です。LINEで友だち追加するだけで遊べます。</p></details>

      <h2 class="mb-3 mt-8 text-lg">BOTの使い方</h2>
      <details class="faq reveal"><summary>参加者同士が友だちである必要はありますか？</summary><p>ありません。参加者全員がBOTを友だち追加していればOKです。参加者のLINEアカウントが他の参加者に知られることもありません。</p></details>
      <details class="faq reveal"><summary>LINEを使っていない人がいます</summary><p><a href="/line.html">ブラウザ版</a>から参加できます。</p></details>
      <details class="faq reveal"><summary>特殊村ってなんですか？</summary><p>自分で設定したメッセージをランダムに配れる機能です。ワードウルフなどの別ゲームにも使えます。<a href="/form.html">特殊村作成</a>から村を作れます（BOTに「@特殊」と入力しても起動します）。</p></details>

      <h2 class="mb-3 mt-8 text-lg">トラブル・その他</h2>
      <details class="faq reveal"><summary>不具合を見つけた・要望がある</summary><p>下のフォームから送ってください。ぜんぶ読んでいます！</p></details>

      <section class="mt-10">
        <h2 class="mb-3 text-lg">ご意見・ご要望フォーム</h2>
        <p class="mb-3 text-sm">うまく表示されない方は<a class="text-accent underline" href="https://docs.google.com/forms/d/e/1FAIpQLSf5pH-nC86Lb9L18dx9fBJv1ZUu-qdftS_PBkBRA5imjjFVgA/viewform">こちら</a>から</p>
        <iframe title="ご意見フォーム" class="w-full rounded-2xl bg-white" src="https://docs.google.com/forms/d/e/1FAIpQLSf5pH-nC86Lb9L18dx9fBJv1ZUu-qdftS_PBkBRA5imjjFVgA/viewform?embedded=true" height="800">読み込んでいます…</iframe>
      </section>
    </main>
    {{> bottom-nav}}
    {{> footer}}
  </body>
</html>
```

- [ ] **Step 3: `.faq` スタイルを `src/styles/tailwind.css` の `@layer components` に追加**

```css
  .faq {
    margin-bottom: 0.5rem;
    border-radius: 1rem;
    background-color: #fff;
    box-shadow: 0 2px 8px rgb(94 58 135 / 0.08);
  }
  .faq > summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 2.75rem;
    padding: 0.75rem 1rem;
    font-weight: 700;
    color: var(--color-accent);
    cursor: pointer;
    list-style: none;
  }
  .faq > summary::after { content: "＋"; font-family: var(--font-numeric); }
  .faq[open] > summary::after { content: "－"; }
  .faq[open] > summary { background-color: var(--color-primary); border-radius: 1rem 1rem 0 0; }
  .faq > p { padding: 0.75rem 1rem 1rem; }
```

- [ ] **Step 4: 動作確認と Commit**

Run: `npm run build && npx tsc --noEmit`
Expected: 成功。devサーバーで `#wereword` `#gyakumura` へのアンカージャンプが機能し、FAQが開閉し開閉状態が＋/－と色反転で示されること

```bash
git add Instructions.html opinion.html src/styles/tailwind.css
git commit -m "feat: restyle instructions as cards and rebuild opinion page as categorized FAQ"
```

---

### Task 8: form.html / line.html 刷新

**Files:**
- Modify: `form.html`
- Modify: `line.html`
- Modify: `src/pages/line.ts`（アバター画像パスのみ変更）
- Modify: `src/styles/tailwind.css`（チャットUIコンポーネント追加）

**Interfaces:**
- Consumes: `src/pages/form.ts` のセレクタ契約: `.btnspinner[data-cal][data-target]` `.counter1` `.group` `.userdiv`（1件目がクローン雛形、内部に `label` と `textarea[name="message"]`）`.button` `.success-alert` `.danger-alert` `#villagenum`。`src/pages/line.ts` のセレクタ契約: `.messages-content` `.messages` `.message-input` `.message-submit`。**これらのクラス名・構造は新HTMLでも維持する（form.ts は無変更）**
- Produces: なし（最終消費者）

- [ ] **Step 1: `form.html` を書き換え**

head は `{{> head-meta}}`＋`<script type="module" src="/src/pages/form.ts"></script>`。body は `{{> site-header}}`／`{{> bottom-nav}}`／`{{> footer}}` 構造にし、`{{> header}}`（サイドナビ）参照を削除。中身の機能DOMは以下の形（`.userdiv` は5個複製、`usagi.png`→`maru_base.webp`）:

```html
<main class="mx-auto max-w-xl px-4 py-8">
  <h1 class="mb-2 text-center text-2xl">特殊村作成</h1>
  <p class="mb-6 text-center text-sm">自分で設定したメッセージをランダムに配ります</p>
  <div class="spinner_area card mb-4 flex items-center justify-center gap-2">
    <input type="number" value="5" class="counter1 w-16 rounded-lg border border-secondary bg-white px-2 py-1 text-right font-numeric" data-max="20" data-min="2" disabled />
    <label class="font-bold">人の村です</label>
    <input type="button" value="＋" class="btnspinner min-h-11 min-w-11 rounded-full bg-primary font-bold text-accent" data-cal="1" data-target=".counter1" />
    <input type="button" value="－" class="btnspinner min-h-11 min-w-11 rounded-full bg-secondary font-bold text-accent" data-cal="-1" data-target=".counter1" />
  </div>
  <div class="group grid gap-3">
    <div class="userdiv card flex items-start gap-3">
      <img src="/contents/img/maru_base.webp" alt="" class="w-12 flex-none" />
      <div class="w-full">
        <label class="font-bold text-accent">参加者1</label>
        <div class="messageInput mt-1">
          <textarea class="block w-full rounded-xl border border-secondary bg-white px-3 py-2" name="message" placeholder="送りたいメッセージを入力" maxlength="150"></textarea>
        </div>
      </div>
    </div>
    <!-- 同じ .userdiv ブロックを「参加者2」〜「参加者5」のラベルで計5個並べる -->
  </div>
  <input type="hidden" name="button" value="create" />
  <div class="buttonarea mt-6 text-center">
    <button class="button btn-cta !bg-accent" type="button">村作成</button>
    <div class="success-alert mt-4 rounded-xl border border-cta bg-white p-3 text-left" role="alert" style="display: none">
      <strong id="villagenum"></strong>村を作成しました。<br />参加者へ番号を伝えてください
    </div>
    <div class="danger-alert mt-4 rounded-xl border border-dark-accent bg-white p-3 text-left" role="alert" style="display: none">
      異常が発生しました。
    </div>
  </div>
</main>
```

※ 旧HTMLではアラートの初期非表示を旧CSS（`.infomessage`）が担っていた。旧CSS削除後も動くよう `style="display: none"` を直接付ける（form.ts の `setAlertVisibility` は `style.display` を切り替えるため整合する）。

- [ ] **Step 2: `line.html` を書き換え**

particles.js（CDN2本＋設定）と normalize.css / Open Sans CDN を削除し、head は `{{> head-meta}}`。body:

```html
<body>
  {{> site-header}}
  <main class="mx-auto max-w-xl px-4 py-4">
    <div class="chat card overflow-hidden !p-0">
      <div class="chat-title flex items-center gap-3 bg-accent px-4 py-3 text-white">
        <img src="/contents/img/maru_base.webp" alt="" class="w-10" />
        <div><h1 class="!text-white text-base font-bold">インサイダーゲームツール</h1><p class="text-xs">Bot（ブラウザ版）</p></div>
      </div>
      <div class="messages h-[55svh] overflow-y-auto bg-secondary/30 p-4">
        <div class="messages-content"></div>
      </div>
      <div class="message-box flex items-end gap-2 border-t border-secondary bg-white p-3">
        <textarea class="message-input block w-full resize-none rounded-xl border border-secondary px-3 py-2" placeholder="メッセージ"></textarea>
        <button type="submit" class="message-submit btn-cta !min-h-11 !px-4" aria-label="送信">送信</button>
      </div>
    </div>
  </main>
  {{> bottom-nav}}
  {{> footer}}
  <script type="module" src="/src/pages/line.ts"></script>
</body>
```

- [ ] **Step 3: チャット吹き出しスタイルを `src/styles/tailwind.css` に追加**

line.ts が生成するクラス（`.message` `.message-personal` `.avatar` `.timestamp` `.thumbnailI`）に対応:

```css
  .messages-content .message {
    position: relative;
    width: fit-content;
    max-width: 80%;
    margin-bottom: 1rem;
    border-radius: 1.25rem;
    border-top-left-radius: 0.25rem;
    background-color: #fff;
    padding: 0.6rem 0.9rem 0.6rem 3.2rem;
    box-shadow: 0 2px 8px rgb(94 58 135 / 0.1);
  }
  .messages-content .message.message-personal {
    margin-left: auto;
    border-radius: 1.25rem;
    border-top-right-radius: 0.25rem;
    background-color: var(--color-cta);
    color: #fff;
    padding-left: 0.9rem;
  }
  .messages-content .avatar {
    position: absolute;
    left: 0.5rem;
    top: 0.4rem;
    width: 2.2rem;
    margin: 0;
  }
  .messages-content .avatar img { width: 100%; border-radius: 9999px; }
  .messages-content .timestamp { margin-top: 0.2rem; font-size: 0.65rem; opacity: 0.6; }
  .messages-content .thumbnailI { max-width: 100%; border-radius: 0.75rem; }
```

- [ ] **Step 4: `src/pages/line.ts` のアバター画像を差し替え**

`createAvatar()` 内の `image.src = "/contents/img/icon.png";` を `image.src = "/contents/img/maru_base.webp";` に変更（他は変更しない）。

- [ ] **Step 5: 動作確認と Commit**

Run: `npm test && npx tsc --noEmit && npm run build`
Expected: 全テストパス。devサーバーで form.html の＋/－ボタンで参加者カードが増減し、line.html で初回メッセージ「こんにちは！ 参加したい村の番号を入力してください。」が表示されること

```bash
git add form.html line.html src/pages/line.ts src/styles/tailwind.css
git commit -m "feat: restyle form and browser-chat pages, drop particles.js"
```

---

### Task 9: 記事4本・カラオケの新レイアウト適用

**Files:**
- Modify: `article/article_001.html` `article/article_002.html` `article/article_003.html` `article/article_004.html`
- Modify: `other/powerpointkaraoke.html`
- Modify: `src/styles/tailwind.css`（記事互換スタイル追加）

**Interfaces:**
- Consumes: パーシャル群、旧クラス互換スタイル
- Produces: なし。karaoke.ts のセレクタ契約（`.forward` `.next` `#num` `.imageView`＋数値id `.fadeInAnime`）を維持

- [ ] **Step 1: 記事の吹き出し・登場人物クラスの互換スタイルを追加**

旧 `lineStyle.css` が担っていた記事内クラスを新トークンで再定義（`@layer components`）:

```css
  .articlueTop { text-align: center; padding: 1.5rem 1rem 0; }
  .articlueTop img { max-width: 100%; border-radius: 1rem; margin-inline: auto; }
  .articlueTop .mojiImg { max-width: 320px; }
  .wrap_row_character { display: grid; gap: 1rem; }
  .row_character {
    display: flex;
    gap: 0.75rem;
    align-items: flex-start;
    border-radius: 1.25rem;
    background-color: #fff;
    padding: 1rem;
    box-shadow: 0 2px 8px rgb(94 58 135 / 0.08);
  }
  .row_character > img { width: 3.5rem; border-radius: 9999px; flex: none; }
  .text_name { color: var(--color-accent); }
  .text_join { font-size: 0.8rem; color: var(--color-accent); opacity: 0.8; }
  .text_comment { font-size: 0.9rem; }
```

※ 記事HTML内で上記以外の旧クラス（`balloon2-top` 等）は Task 1/7 の互換スタイルが既に受ける。実装時に各記事を表示し、装飾が完全に欠落しているクラスが他に見つかった場合は同じ方針（新トークンで同名クラスを定義）で追記する。

- [ ] **Step 2: 記事4本の骨組みを共通化**

各 `article/article_00N.html` について:
1. `<head>` の中身を `{{> head-meta}}`＋`<script type="module" src="/src/pages/common.ts"></script>` に置き換え（旧CSS `link` 2本と旧メタ・favicon行を削除）
2. `{{> header}}` 参照を削除、`{{> logo}}` `{{> menubar}}` を `{{> site-header}}` に置き換え
3. `<div id="container">` を `<main class="mx-auto max-w-2xl px-4">` に置き換え
4. 本文コンテンツ（`.articlueTop` 以降）は無変更で維持
5. `{{> footer}}` の前に `{{> bottom-nav}}` を挿入

- [ ] **Step 3: `other/powerpointkaraoke.html` の骨組みを差し替え**

head を `{{> head-meta}}`＋`<script type="module" src="/src/pages/karaoke.ts"></script>` に置き換え（旧 `favicon2.ico` 参照と `../contents/css/style.css` を削除）。body 構造・スライドDOM（`.imageView` id=0〜4、`.forward`/`.next`/`#num`、picsum画像URL）は現状維持し、`{{> footer}}` の前に `{{> bottom-nav}}` を挿入。ツールチップ・ナビの既存Tailwindユーティリティはそのまま。

- [ ] **Step 4: 動作確認と Commit**

Run: `npm run build && npx tsc --noEmit`
Expected: 成功。devサーバーで記事の吹き出し・登場人物カードが崩れず、カラオケの前/次送りとスライドアニメーションが動くこと

```bash
git add article other/powerpointkaraoke.html src/styles/tailwind.css
git commit -m "feat: apply shared layout to articles and karaoke page"
```

---

### Task 10: favicon/OGP 差し替えとレガシー削除

**Files:**
- Create: `public/contents/img/favicon-32.png`（および `favicon-192.png`）
- Modify: `public/contents/img/ogp.png`（新OGPに差し替え）
- Delete: `public/contents/css/`（style.css, previewStyle.css, blog-style.css, headerStyle.css, line.css, lineStyle.css）
- Delete: `partials/header.hbs` `partials/logo.hbs` `partials/menubar.hbs`
- Delete: `public/contents/js/particles.js` `public/contents/json/particlesjs-config-line.json`
- Delete: 未参照画像（Step 4 の grep で確定したもののみ）
- Modify: `docs/architecture.md`（削除物への言及を現状に合わせて更新）

**Interfaces:**
- Consumes: 全ページが新パーシャルへ移行済みであること（Task 4〜9 完了が前提）
- Produces: `/contents/img/favicon-32.png`（head-meta が参照）、`/contents/img/ogp.png`（OGPメタが参照）

- [ ] **Step 1: favicon を生成（B-20 の代替。macOS の sips を使用）**

理想は生成指示書 B-20（まるの顔アイコン）を Codex image_gen で生成することだが、未生成のため `maru_base.webp` から作る:

```bash
sips -s format png -Z 192 public/contents/img/maru_base.webp --out public/contents/img/favicon-192.png
sips -s format png -Z 32 public/contents/img/maru_base.webp --out public/contents/img/favicon-32.png
```

32px で顔が判別できるか目視確認する。判別できない場合はこのタスクを中断し、B-20 生成をユーザーに依頼する。

- [ ] **Step 2: OGP を PNG 化して差し替え**

OGPはWebP非対応のクローラーがあるためPNGで配信する（URL `contents/img/ogp.png` は旧サイトと同じため外部シェアのキャッシュも自然に置き換わる）:

```bash
sips -s format png public/contents/img/ogp.webp --out public/contents/img/ogp.png
sips -g pixelWidth -g pixelHeight public/contents/img/ogp.png
```

1536×1024 のままなら 1200×630 相当に中央クロップ:

```bash
sips -c 630 1200 public/contents/img/ogp.png
```

- [ ] **Step 3: レガシーファイルを削除**

```bash
git rm -r public/contents/css
git rm partials/header.hbs partials/logo.hbs partials/menubar.hbs
git rm public/contents/js/particles.js public/contents/json/particlesjs-config-line.json
```

- [ ] **Step 4: 参照が残っていないことを確認**

Run:

```bash
grep -rn "contents/css\|{{> header}}\|{{> logo}}\|{{> menubar}}\|particles" index.html rule.html Instructions.html form.html line.html opinion.html article other partials src
```

Expected: ヒットなし。ヒットがあれば該当ページの直し漏れなので修正する。

- [ ] **Step 5: 未参照画像を削除**

削除候補それぞれについて参照を確認してから削除する:

```bash
for f in favicon2.ico usagiMain.png flower.svg raindrop_s.svg raindrop_m.svg raindrop_l.svg navi_panda.png toroku.png go.png icon.png logo.png usagi.png usagiOGP.png karaokeOGP.png favicon.ico ogp.webp; do
  echo "== $f =="; grep -rln "$f" index.html rule.html Instructions.html form.html line.html opinion.html article other partials src public/contents | grep -v "public/contents/img" || echo "(未参照)"
done
```

「(未参照)」と出たファイルのみ `git rm public/contents/img/<file>` する。1件でも参照が残っていたら消さない。

- [ ] **Step 6: `docs/architecture.md` を現状に合わせて更新**

`grep -n "style.css\|header.hbs\|menubar\|particles\|contents/css" docs/architecture.md` でヒットする記述を、新構成（Tailwind単一エントリ `src/styles/tailwind.css`、パーシャルは head-meta/site-header/bottom-nav/footer の4つ、公開アセットは `contents/img/` のみ）に書き直す。

- [ ] **Step 7: ビルド・テスト・Commit**

Run: `npm run build && npm test && npx tsc --noEmit`
Expected: 成功。`ls dist/contents/css` が「存在しない」こと、`dist/_redirects` が存在すること

```bash
git add -A
git commit -m "chore: remove legacy css/partials/particles and swap favicon/ogp"
```

---

### Task 11: 総合検証

**Files:**
- なし（検証のみ。問題があれば該当タスクのファイルを修正）

**Interfaces:**
- Consumes: 全タスクの成果物

- [ ] **Step 1: ビルド成果物の必須項目を機械的に確認**

```bash
npm run build
test -f dist/_redirects && echo "_redirects OK"
test -f dist/form.html && echo "form OK"
test -f dist/opinion.html && echo "opinion OK"
grep -q "google-site-verification" dist/index.html && echo "site-verification OK"
grep -q "line.me/R/ti/p/%40966mpnqz" dist/index.html && echo "LINE URL OK"
grep -rq "insidergamehelper" dist/assets && echo "API_BASE OK"
ls dist/rule.html dist/Instructions.html dist/line.html dist/article/article_001.html dist/other/powerpointkaraoke.html && echo "all pages OK"
```

Expected: すべて OK が出力される

- [ ] **Step 2: テスト・型チェックの最終確認**

Run: `npm test && npx tsc --noEmit`
Expected: 全テストパス（form-logic / chat logic / api / config / bottom-nav / scroll-reveal）

- [ ] **Step 3: 手動チェックリスト（`npm run dev` で全ページ巡回）**

- [ ] index: ヒーロー演出（マスコット登場→文字リビール→3D浮遊）、ポインタ視差、スクロールでボトムナビが隠れる/戻る
- [ ] index: DevTools で prefers-reduced-motion をエミュレートし、リロードで静止画フォールバックになる
- [ ] rule: 進捗ピル切り替え、ダーク面のカード登場演出、勝利条件の文言が旧サイトと一致
- [ ] Instructions: `#wereword` `#gyakumura` アンカーが機能、マニュアル画像表示
- [ ] opinion: FAQ開閉（＋/－表示）、Googleフォーム表示
- [ ] form: ＋/－で参加者カード増減（2〜20でクランプ）、村作成ボタンのローディング表示（API失敗時に danger-alert 表示）
- [ ] line: 初回メッセージ表示、送信でメッセージが右側に追加される
- [ ] 記事4本: 吹き出し・登場人物カードが判読可能
- [ ] karaoke: 前/次送り、`0 / 4` カウンタ、スライドアニメーション
- [ ] モバイル幅（375px）で全ページ横スクロールが発生しない
- [ ] ライトハウス目視相当: ヒーローのコピーとCTAがJS読み込み前でも表示される（ネットワークをSlow 3GにしてCTAが早期に見えること）

- [ ] **Step 4: コントラスト確認**

本文（ink `#2B2438` on base `#F3EEF6`）と ダーク面（dark-text `#FFC9E8` on dark-base `#17131F`）はいずれも4.5:1以上（計算上 約13:1 / 約11:1）。追加した文字色の組み合わせがあれば https://webaim.org/resources/contrastchecker/ 相当の計算で確認する。

- [ ] **Step 5: 完了コミット（修正があれば）**

```bash
git add -A
git commit -m "fix: address verification findings for design refresh"
```

※ push はユーザーの明示指示があるまで行わない（master push＝本番デプロイ）。

---

## 実装後の後始末（docs/AGENTS.md の規約）

全タスク完了・ユーザー確認後、設計の結論を `docs/` 直下（architecture.md 等）に蒸留し、`docs/superpowers/specs/2026-08-23-design-refresh-design.md`・`2026-08-23-asset-generation-guide.md`・本計画ファイルを削除する。
