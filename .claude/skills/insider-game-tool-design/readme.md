# インサイダーゲームツール Design System — 「かわいい秘密結社」

LINEだけで遊べる正体隠匿ゲーム「インサイダーゲーム」の進行サポートBOT（LINE BOT）の紹介・マニュアルサイトのデザインシステム。2026-08 のデザイン刷新（コンセプト「かわいい秘密結社」）を正とする。

## ソース

- コードベース: 本リポジトリ（Vite MPA + Handlebars + Tailwind v4 + TypeScript）
- 設計書: `docs/superpowers/specs/2026-08-23-design-refresh-design.md`（最終決定）
- 実装計画: `docs/superpowers/plans/2026-08-23-design-refresh.md`（トークン・コンポーネントCSSの実装先）
- アセット生成指示書: `docs/superpowers/specs/2026-08-23-asset-generation-guide.md`
- 本番サイト: https://insidergametool.netlify.app
- LINE友だち追加URL（一字も変えない）: `https://line.me/R/ti/p/%40966mpnqz`

## プロダクト

1つのウェブサイト（全10ページ・モバイル主体）: トップ / ルール / 使い方 / FAQ・ご意見 / 特殊村作成フォーム / ブラウザ版チャット / コラム記事4本 / パワポカラオケ。

## コンセプト「かわいい秘密結社」

明るくかわいい「表の顔」（パステル面）と、正体隠匿ゲームらしい謎めいた「裏の顔」（ダーク×ネオン面）の二層構造。全面カラフル・全面ダークのどちらにも振り切らず、場所で使い分ける。ダーク面は役職紹介・世界観訴求セクションに限定。装飾は引き算：マスコットとコピー1行が主役。

マスコットは2種:
- **まる**（市民・ナビゲーター）: 白いおにぎり型おばけ。ライト面担当
- **ふーど**（インサイダー）: まると同シルエット＋フード＋仮面。ダーク面でネオン縁取り
- 旧うさぎキャラは引退（使用禁止）

## CONTENT FUNDAMENTALS

- **言語**: 日本語。文体は「です・ます」＋くだけた話しかけ。読者は「あなた」と呼ばず直接誘いかける（「さあ、仲間をあつめよう」「がんばろう！」）
- **世界観に沿った言い回し**: 無機質な業務文言を避ける。CTA文言は必ず「友だち追加してはじめる」（固定）。誘い文句は「仲間になる」系
- **ひらがなでかわいく**: 見出しに意図的なひらがな開き（「役職しょうかい」「勝敗のきまりかた」「読みもの」）
- **ヒーローコピー**: メイン「答えを知ってるのは、だれ？」／サブ「LINEだけで遊べる正体隠匿ゲーム。インサイダーゲーム進行サポートBOT」
- **ふーどの一人称は「ぼく」**、含みのある語り（「（きみがインサイダーなら、お題もこっそり届くよ…）」）。まるは明るい呼びかけ（「〜だよ！」「〜しよう！」）
- **数字はスペック強調**: 「2〜20人」「10分」「¥0」を Baloo 2 で大きく見せる
- **絵文字は使わない**。強調は `<strong>` とアクセント色
- **役職の勝利条件テキストは旧サイトの文言を一字一句維持**する（例:「勝利条件：誰かが制限時間内にお題を当てる。かつ、自分が最多投票にならない。」）

## VISUAL FOUNDATIONS

- **配色**: ライト面 = base `#F3EEF6` / primary `#F7C9DE` / secondary `#C9DEF7` / accent `#5E3A87` / ink `#2B2438`。ダーク面 = dark-base `#17131F` / dark-accent `#FF3EA5` / dark-sub `#5EE7FF` / dark-text `#FFC9E8` / dark-line `#3A2E4D`。CTAグリーン `#06C755` は友だち追加CTA専用で他用途禁止
- **コントラスト**: 本文4.5:1以上必須。パステル（primary/secondary）は背景・装飾専用で文字色に使わない。文字は ink/accent（ライト面）、dark-text/白（ダーク面）。色だけに意味を持たせない（アイコン/ラベル併用）
- **タイポ**: 見出し Zen Maru Gothic 700/900、本文 M PLUS Rounded 1c 400/700、数字・欧文 Baloo 2 700。このウェイト以外読み込まない。階層はサイズ・ウェイト・余白のみで作る
- **背景**: ベタ塗りのパステル。全面に薄いCSSグレイン（feTurbulence, opacity 0.04）を重ねる。グラデーション背景は使わない
- **カード**: 白背景 / radius 1.5rem / shadow `0 4px 16px rgb(94 58 135 / .08)` / padding 1.5rem。ホバーで `translateY(-4px)`＋影強化
- **ボタン**: ピル型（radius 9999px）。CTAはグリーン＋白文字＋緑影＋シャインエフェクト1種のみ（パルス等を重ねない）。ホバー `scale(1.03)`、押下 `scale(0.94)` のスクワッシュ
- **ダーク面**: 見出しはネオンマゼンタ＋`text-shadow: 0 0 16px rgb(255 62 165 / .45)` の発光。カード背景はフォグパープル。役職カードは `drop-shadow(0 0 18px rgb(255 62 165 / .25))`
- **影**: すべてバイオレット系 `rgb(94 58 135 / α)` の柔らかい外影。内影・ハードシャドウなし
- **モーション言語**: 「弾む・にじむ・ふわっと浮く」。鋭いスライド・硬い動きは使わない。対象プロパティは transform/opacity のみ。登場は `back.out` 系のぽよん、スクロールリビールは 16px 上昇フェード 0.6s。`prefers-reduced-motion: reduce` で全演出停止（no-motion-first）
- **透明・ブラー**: 固定ナビにのみ `bg-white/90 + backdrop-blur`（ボトムナビ）と `bg-base/90 + backdrop-blur`（進捗バー）
- **レイアウト**: モバイル主体。ボトム固定ナビ（ルール/CTA/FAQ の3項目、下スクロールで隠れ上スクロールで再表示）。コンテンツ幅 max-w-2xl〜4xl 中央寄せ。タップ領域44px以上・ボタン間隔8px以上
- **画像の色味**: パステル×フラットステッカー調（Digi-Cute）。ダーク面アセットはネオンリムライト。写真は使わない（記事OGP除く）

## ICONOGRAPHY

- **UI基盤アイコン**: Lucide（本体はnpm/SVG直埋め。ボトムナビの「ルール」= book-open、「FAQ」= help-circle をstroke-width 2でインライン埋め込み）。CDNが必要な場合は lucide の unpkg を使用可
- **装飾ワンポイント**（虫眼鏡・仮面・鍵穴・封筒）: Phosphor duotone を部分採用
- **イラストアイコンの代わり**: 生成済みマスコット/小物WebP（`public/contents/img/obj_*.webp`）を使う。手描きSVG・絵文字での代用は禁止
- **正式なロゴは存在しない**: ヘッダーは `maru_base.webp`（40px）＋サイト名を Zen Maru Gothic 900 のテキストで組む。旧 `logo.png`・うさぎ系アセットは引退
- favicon はまるの顔（`maru_base.webp` 縮小）

## トークン & ファイル索引

このスキル内:

- `styles.css` — エントリ（@importのみ）
- `tokens/colors.css` — 色（ライト面/ダーク面/セマンティック）
- `tokens/typography.css` — Google Fonts読み込み＋フォント/サイズ
- `tokens/shape.css` — 角丸・影・余白・タップ領域
- `tokens/motion.css` — イージング・リビール・CTAシャイン
- `tokens/base.css` — body/見出し/リンク既定・グレイン
- `_adherence.oxlintrc.json` — コンポーネントprops定義とトークン一覧のリファレンス（ビルド未接続）

リポジトリ内:

- `public/contents/img/` — マスコット・役職カード・浮遊小物・ステップ挿絵・記事OGP等
- `src/styles/tailwind.css` — 上記トークンの Tailwind v4 実装（`@theme`）

リモートの Claude Design プロジェクトにのみ存在（本リポジトリは React ではないため未取り込み）:

- `guidelines/` — 仕様カード18枚（Design Systemタブの視覚リファレンス）
- `components/core|conversation|navigation|content/` — JSX コンポーネント12種（Button, Card, Badge, Speech, ChatMessage, SiteHeader, BottomNav, StepNav, SiteFooter, SectionDark, RoleCard, Faq）
- `ui_kits/website/` — サイト主要5画面の React 再現＋インタラクティブデモ

### Intentional additions

なし（コンポーネント一覧は実装計画の `@layer components` とパーシャル定義に1:1対応）。

### フォントについて

フォントバイナリは同梱せず Google Fonts（Zen Maru Gothic / M PLUS Rounded 1c / Baloo 2）をCSS `@import` で読み込む — 刷新設計の指定どおり。旧 `emikofont.ttf` は引退につき未収録。
