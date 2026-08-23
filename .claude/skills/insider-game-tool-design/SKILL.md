---
name: insider-game-tool-design
description: Use this skill to generate well-branded interfaces and assets for インサイダーゲームツール (Insider Game Tool, LINE BOT紹介サイト), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `readme.md` file within this skill, and explore the other available files (`styles.css`, `tokens/*.css`, `_adherence.oxlintrc.json`).

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out of `public/contents/img/` and create static HTML files for the user to view. If working on production code, copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key rules: concept is 「かわいい秘密結社」 (pastel light face + limited dark×neon face); CTA green `#06C755` is reserved for LINE friend-add only; pastels never used as text colors; fonts are Zen Maru Gothic (headings), M PLUS Rounded 1c (body), Baloo 2 (numbers); mascots are まる (light face) and ふーど (dark face) — never draw new mascots, use the WebP assets in `public/contents/img/`.

## このリポジトリでの所在

| もの | 場所 |
|---|---|
| デザイン規約（本体） | このスキルの `readme.md` |
| トークン定義（正） | このスキルの `tokens/*.css`（エントリは `styles.css`） |
| トークンの実装 | `src/styles/tailwind.css` の `@theme` ブロック（Tailwind v4） |
| 画像アセット | `public/contents/img/`（マスコット・役職カード・浮遊小物・ステップ挿絵）— スキル内に複製しない |
| 設計書 | `docs/superpowers/specs/2026-08-23-design-refresh-design.md` |
| 実装計画 | `docs/superpowers/plans/2026-08-23-design-refresh.md` |

トークンを変更する場合は `tokens/*.css`（正）と `src/styles/tailwind.css`（実装）の両方を同じコミットで更新する。

## リモートの Claude Design プロジェクト

このスキルは Claude Design プロジェクト「インサイダーゲームツール Design System」から取り込んだもの。仕様カード（`guidelines/`）と JSX コンポーネント実装（`components/`）・UI Kit（`ui_kits/website/`）はリモート側にのみ存在する。

- プロジェクト: https://claude.ai/design/p/44f98dcc-caa9-41f7-8afa-5776de3453af

JSX コンポーネントを取り込んでいないのは、本リポジトリが React ではなく Vite MPA + Handlebars + 素の TypeScript 構成であるため。`_adherence.oxlintrc.json` はコンポーネントの props 定義とトークン一覧のリファレンスとして置いてあり、ビルドやリントには接続していない。
