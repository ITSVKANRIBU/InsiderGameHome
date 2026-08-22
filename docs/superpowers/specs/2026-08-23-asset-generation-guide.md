# 画像・動画生成 指示書（アセット制作フェーズ用）

親ドキュメント: [2026-08-23-design-refresh-design.md](2026-08-23-design-refresh-design.md) §4
目的: 実装前に全ビジュアルアセットを生成し、デザインの完成イメージを確認できる状態にする。

## 生成ルール（必須）

1. **生成は必ず Codex の image_gen スキルを利用する**（ChatGPT画像生成）。
2. **生成順序を守る**: キャラクターシート（A-1, A-2）を最初に生成し、以降のキャラ登場アセットは必ずキャラシートを**参照画像として渡して**生成する（絵柄・シルエットの一貫性確保のため）。
3. 各プロンプトは「共通スタイルベース ＋ アセット個別指定」の連結で構成する。
4. 生成サイズは 1024×1024 / 1536×1024 / 1024×1536 のいずれか。最終サイズが異なるものはトリミングで対応する。
5. 文字の扱いはアセット種別で分ける:
   - **A〜B-18（キャラ・オブジェクト素材）**: 画像内に文字を生成しない（`no text, no letters` を維持）。
   - **B-19 以降（OGP・イメージボード・動画）**: サイト名やコピーを入れる場合は、後載せではなく**画像生成と同時に、かわいい飾り文字（丸くて太いバブルレタリング風の日本語ハンドレタリング）として生成する**。文字が崩れた場合は採用せず再生成する。飾り文字の共通指定: `cute chunky rounded Japanese hand-lettering, bubbly kawaii logo style, deep violet #5E3A87 letters with petal pink #F7C9DE outline and soft drop shadow`
6. 採用した生成物は WebP に変換して `public/contents/img/` 配下に配置する（透過が必要なものは透過PNG→WebP）。

## 共通スタイルベースプロンプト

すべての生成の先頭に付ける:

```
kawaii mascot illustration, simple rounded blob shape, flat vector sticker style,
soft pastel palette: whisper lavender #F3EEF6, petal pink #F7C9DE, baby blue #C9DEF7,
deep violet #5E3A87 accent, minimal clean linework, emoji-like simple face,
smooth edges, high quality, consistent character design, no text, no letters
```

ダーク面用アセットは以下を追加:

```
dark mysterious background #17131F, neon magenta #FF3EA5 rim light,
neon cyan #5EE7FF glow accents, cute but secretive mood
```

透過が必要なアセットは `isolated on transparent background` を追加。

### キャラクター定義（プロンプト用固定文言）

**まる（市民・ナビゲーター）**
```
"Maru": a plump round white ghost-like blob mascot, rounded onigiri silhouette,
tiny stubby arms, simple black dot eyes, small open smile, pink blush cheeks,
subtle deep violet #5E3A87 outline
```

**ふーど（インサイダー）**
```
"Fudo": the same blob silhouette as Maru, wearing a deep violet #5E3A87 hooded cloak
and a small black domino eye mask, mischievous grin, slightly shadowed face,
neon magenta #FF3EA5 rim light on the hood edge
```

## A. キャラクターシート（最優先・他の全生成の参照元）

| ID | ファイル名 | サイズ | 内容 |
|---|---|---|---|
| A-1 | `maru_sheet` | 1536×1024 | まる: 正面基本ポーズ＋表情差分3種（喜び/考え中/驚き）を1枚に並べたキャラクターシート |
| A-2 | `fudo_sheet` | 1536×1024 | ふーど: 同上 |

**A-1 プロンプト（共通ベース＋以下）**
```
character reference sheet of [まる定義], four poses in a row on one sheet:
(1) standing front view neutral happy, (2) joyful jumping with sparkles,
(3) thinking with a tilted head and a small question mark gesture,
(4) surprised with wide eyes, plain white background, character sheet layout
```

**A-2 プロンプト（共通ベース＋以下）**
```
character reference sheet of [ふーど定義], four poses in a row on one sheet:
(1) standing front view with mischievous grin, (2) peeking from behind the hood,
(3) whispering with a hand beside the mouth, (4) shrugging innocently,
plain white background, character sheet layout
```

## B. 実装用アセット

以降はすべて **A-1 / A-2 を参照画像に渡して** 生成する。

### B-1〜B-4: まる 単体ポーズ（透過・1024×1024）

| ID | ファイル名 | プロンプト個別指定 |
|---|---|---|
| B-1 | `maru_base` | `[まる定義], standing front view, happy, full body, isolated on transparent background` |
| B-2 | `maru_joy` | `[まる定義], jumping joyfully with small sparkles around, full body, isolated on transparent background` |
| B-3 | `maru_think` | `[まる定義], thinking pose with tilted head, full body, isolated on transparent background` |
| B-4 | `maru_surprise` | `[まる定義], surprised with wide eyes, full body, isolated on transparent background` |

### B-5〜B-7: ふーど 単体ポーズ（透過・1024×1024・ダーク面追加プロンプト適用）

| ID | ファイル名 | プロンプト個別指定 |
|---|---|---|
| B-5 | `fudo_base` | `[ふーど定義], standing front view, mischievous grin, full body, isolated on transparent background` |
| B-6 | `fudo_whisper` | `[ふーど定義], whispering with a hand beside the mouth, full body, isolated on transparent background` |
| B-7 | `fudo_peek` | `[ふーど定義], peeking from the edge as if hiding, full body, isolated on transparent background` |

### B-8〜B-10: 役職カード3種（透過・1024×1536 縦）

まるの衣装差分で3役職を表現。カード枠ごと生成する。

| ID | ファイル名 | プロンプト個別指定 |
|---|---|---|
| B-8 | `role_citizen` | `a cute trading card frame in petal pink #F7C9DE with rounded corners, [まる定義] in the center, bright and friendly mood, isolated on transparent background` |
| B-9 | `role_insider` | `a cute trading card frame in fog purple #3A2E4D with neon magenta #FF3EA5 glowing border, [ふーど定義] in the center, secretive mood, isolated on transparent background`（ダーク面追加プロンプト適用） |
| B-10 | `role_master` | `a cute trading card frame in deep violet #5E3A87 with gold trim, [まる定義] wearing a tiny black top hat and holding a magnifying glass, wise and calm expression, isolated on transparent background` |

### B-11〜B-14: three.js 用 浮遊オブジェクト（透過・1024×1024）

疑似3D（クレイ風）で統一。共通ベースに加え:
```
soft 3D clay render style, matte texture, single object centered,
soft studio lighting, gentle shadows, isolated on transparent background
```

| ID | ファイル名 | オブジェクト |
|---|---|---|
| B-11 | `obj_mask` | `a cute pastel pink and violet masquerade eye mask` |
| B-12 | `obj_magnifier` | `a cute magnifying glass with a petal pink handle and lavender lens` |
| B-13 | `obj_card` | `a rounded playing card, baby blue back with a deep violet question mark symbol (symbol only, not text)` |
| B-14 | `obj_keyhole` | `a rounded keyhole charm in deep violet with a soft pink glow inside` |

### B-15: ヒーロー フォールバック静止画（1536×1024）

reduced-motion / WebGL非対応時に3Dシーンの代わりに表示する1枚絵。

```
（共通ベース＋）dreamy hero illustration: [まる定義] floating in the center
surrounded by floating pastel objects (masquerade mask, magnifying glass,
rounded playing cards, keyhole charms), whisper lavender #F3EEF6 sky background
with soft clouds and subtle sparkles, [ふーど定義] peeking from the lower corner,
wide composition, generous empty space in the upper left for a headline
```

### B-16〜B-18: 遊び方3ステップ挿絵（透過・1024×1024）

| ID | ファイル名 | プロンプト個別指定 |
|---|---|---|
| B-16 | `step1_add` | `[まる定義] happily hugging a big smartphone showing a green chat app icon (icon only, no text), small heart marks, isolated on transparent background` |
| B-17 | `step2_village` | `[まる定義] and two same-species blob friends in different pastel colors gathering around chat bubbles, cozy mood, isolated on transparent background` |
| B-18 | `step3_play` | `[まる定義] and blob friends sitting in a circle around a smartphone, [ふーど定義] hiding among them with a mischievous grin, playful party mood, isolated on transparent background` |

### B-19: OGP画像（1536×1024 で生成 → 1200×630 にトリミング）

```
（共通ベース＋飾り文字共通指定＋）social media banner illustration:
[まる定義] and [ふーど定義] side by side in the right half, floating pastel
mystery objects around them, whisper lavender background with soft grain texture,
in the left half the Japanese title 「インサイダーゲーム」 written in cute chunky
rounded kawaii hand-lettering as the main logo, with the smaller Japanese
tagline 「答えを知ってるのは、だれ？」 below it, wide composition
```

文字（「インサイダーゲーム」「答えを知ってるのは、だれ？」）が一字でも崩れていたら不採用とし、再生成する。

### B-20: favicon（1024×1024 で生成 → 32/16px に縮小）

```
（共通ベース＋）app icon of Maru's face only, extremely simple, bold shapes,
large features readable at tiny size, petal pink circle background,
flat design, centered, no gradients
```

16px 縮小時に顔が判別できることを採用基準とする。

## C. デザインイメージボード（実装前の完成イメージ確認用・サイトには使わない）

ユーザーがデザインの方向性を事前確認するためのモック画像。ページには組み込まない。

| ID | ファイル名 | 内容 |
|---|---|---|
| C-1 | `mock_hero` | トップページのヒーローセクション完成イメージ。`smartphone mockup of a cute pastel website hero section, blob mascot floating among pastel 3D objects, the Japanese headline 「答えを知ってるのは、だれ？」 in cute chunky rounded kawaii hand-lettering at the top, a green rounded CTA button at the bottom`（共通ベース＋飾り文字共通指定を適用） |
| C-2 | `mock_dark` | rule.html 役職紹介（ダーク面）の完成イメージ。`smartphone mockup of a dark mysterious website section #17131F with three cute glowing role cards in a row, neon magenta accents, the Japanese heading 「やくしょく しょうかい」 in cute rounded kawaii hand-lettering glowing in neon magenta at the top`（ダーク面追加プロンプト＋飾り文字共通指定を適用） |

## D. 動画（任意・確認用/SNS宣伝用）

動画生成が可能な場合に制作する。サイト実装には使わない（ヒーローはthree.jsで実装）。

| ID | 用途 | プロンプト |
|---|---|---|
| D-1 | ヒーロー演出の動きイメージ確認（10秒ループ・横） | `slow dreamy camera drift through floating pastel objects (masquerade mask, magnifying glass, playing cards) around a cute white blob mascot, lavender pastel sky, objects gently bobbing with parallax depth, soft sparkles, seamless loop, kawaii flat-3D clay style` |
| D-2 | SNS宣伝ショート（15秒・縦 9:16） | `a cute white blob mascot invites the viewer, friends gather around a smartphone, a hooded blob sneaks in among them, playful suspicion, everyone laughs, pastel kawaii style, upbeat party mood, vertical composition, ending title card with the Japanese title 「インサイダーゲーム」 in cute chunky rounded kawaii hand-lettering`（飾り文字共通指定を適用） |

## 受け入れチェックリスト（全アセット共通）

- [ ] シルエット・目鼻の描き方がキャラシート（A-1/A-2）と一致している
- [ ] 使用色が §2 のパレット（HEX）から大きく外れていない
- [ ] 透過指定アセットは背景が完全に透過で、輪郭にフリンジ（白縁）がない
- [ ] A〜B-18: 画像内に文字・ロゴが生成されていない
- [ ] B-19以降で文字を入れたもの: 日本語の飾り文字が一字も崩れず正しく読める（崩れは不採用・再生成）
- [ ] 小さく表示しても表情が読める（マスコット系）
- [ ] WebP変換後、1ファイル200KB以下（B-15/B-19/C系は500KB以下）

## 配置・命名

- 配置先: `public/contents/img/`（C・Dの確認用アセットは `docs/superpowers/assets/` に置き、確認完了後に削除）
- 形式: WebP（favicon のみ ICO＋PNG）
- ファイル名は本書の「ファイル名」列に従う（拡張子 `.webp`）
