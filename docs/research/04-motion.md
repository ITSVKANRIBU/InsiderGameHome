# モーション・インタラクション調査

インサイダーゲームツール サイトリニューアル — デザイン全面刷新プロジェクト
担当領域: モーション・インタラクション（ヒーロー演出／マイクロインタラクション／スクロールアニメーション／実装ライブラリ選定／パフォーマンス配慮／CTA演出）

技術前提: Vite + TypeScript + 静的HTML（Handlebarsパーシャル）。React等のSPAフレームワークなし。Netlifyホスティング。モバイル閲覧が主。

---

## 1. 「感動」を生むヒーローエリアの演出パターン（事例5選+）

「感動」＝サイトを開いた瞬間に「おっ」と思わせる第一印象の演出。Awwwards等で評価される優秀事例に共通するのは、**単発の派手さではなく「ロード→テキスト登場→スクロール誘導」までを1本のタイムラインとして設計している**点。

1. **プリローダー→リビール型**
   画面をローディング画面（ロゴやプログレスバーのシンプルなアニメーション）で覆い、読み込み完了と同時にマスクが割れる/スライドして本編のヒーローが現れる演出。体感読み込み時間を「演出」に変換でき、実際のアセット読み込み待ちを隠せる利点もある。ただし静的サイトでは待たせすぎないこと（後述のベストプラクティス参照）。

2. **SplitText によるテキスト逐次リビール**
   見出しを文字/単語/行単位に分割し、GSAP SplitText等でstagger（ずらし）付きにフェードイン・下からスライドインさせる。1つのタイムライン上で「画像がスライドイン→テキストが行ごとに割れて登場→サブテキストがフェードイン」と振り付けるパターンが定番で、視線が自然に誘導される。

3. **スクロール連動のパララックス／3Dスクロール**
   ヒーロー画像やイラストがスクロール量に応じて視差移動・拡大縮小・回転する演出。Awwwards掲載事例では「Hero Image 3D scroll animation」のように、スクロールでヒーロービジュアルが奥行きを持って動く例が多く見られる。CSSのscroll-timelineだけでも実装可能（4章参照）。

4. **水平スクロール型ヒーロー**
   縦スクロールを内部的に横方向の動きに変換し、ヒーロー内のロゴ・コピー・ビジュアルが横にスライドしながら展開するパターン（Awwwards「Hero Animation - Horizontal Scroll」等）。ゲーム紹介サイトのような「世界観を見せる」用途と相性が良い。

5. **アンビエント/背景の常時アニメーション**
   Canvasやパーティクルによる背景の緩やかな動き（漂う光、キャラクターの待機モーション的な揺れなど）をヒーローの主役アニメーションの後ろで常時ループさせ、静止画にならないようにする。GSAPとCanvasパーティクル背景を組み合わせたポートフォリオヒーロー実装例が典型。

6. **スクロールインジケーターのマイクロアニメーション**
   ヒーロー下部の「▼」や「Scroll」テキストを微妙にバウンス/フェードループさせ、次コンテンツへの誘導を演出として仕込む。単体では地味だが、上記1〜5と組み合わせることで「作り込まれている感」の総仕上げになる。

**このサイトへの示唆**: インサイダーゲームは「正体隠匿×推理」がテーマなので、ヒーローでは「カードがめくれる」「正体が明かされる」ような可愛らしいマイクロストーリー性のあるリビール演出（例: キャラクター/カードイラストがふわっと登場→キャッチコピーが1文字ずつ現れる）が、ブランド世界観と演出効果を両立しやすい。

Sources:
- [Hero section scroll animation - Awwwards](https://www.awwwards.com/inspiration/hero-section-scroll-animation-dstafin)
- [Hero Image 3D scroll animation - Awwwards](https://www.awwwards.com/inspiration/loading-screen-toutdroit)
- [Hero Animation - Horizontal Scroll - Awwwards](https://www.awwwards.com/inspiration/hero-animation-horizontal-scroll-studio-arde)
- [Hero section animations - Awwwards](https://www.awwwards.com/inspiration/hero-section-animations-mosey)
- [Awwward-winning animation techniques for websites (Medium)](https://medium.com/design-bootcamp/awwward-winning-animation-techniques-for-websites-cb7c6b5a86ff)
- [GSAP Text Animation: A Practical SplitText Guide (2026)](https://lab.good-fella.com/blog/gsap-text-animation-splittext-guide)
- [Building an Animated Portfolio Hero with GSAP, SplitText, and a Canvas Particle Background](https://dev.to/fahadalikhanca/building-an-animated-portfolio-hero-with-gsap-splittext-and-a-canvas-particle-background-3d4e)
- [Text Animations with GSAP: 4 Approaches | GSAP Vault](https://gsapvault.com/blog/text-animations-gsap)

---

## 2. マイクロインタラクション（「かわいい」系実装パターン）

マイクロインタラクションは「クリック・ホバー・タップ・入力」といった小さな操作に対する即時フィードバック。2025〜2026年のトレンドでは、**「小さなバウンス」「柔らかい膨らみ」「跳ねる数字」など、有機的で丸みのある動きが"かわいい"の鍵**とされている。

### ボタンホバー
- **微膨張（スケールアップ）**: `transform: scale(1.03〜1.08)` 程度の控えめな拡大。2%程度の拡大が「上品」、それ以上は「おもちゃっぽい」印象になるとされる。過剰にしないことが「かわいい」と「安っぽい」の分かれ目。
- **アイコン/絵文字の弾む動き**: ボタン内のアイコンだけがバウンド（弾む）するイージング（`cubic-bezier`のオーバーシュート、または `spring` 系イージング）を当てると、コロンとした可愛らしさが出る。
- **背景のにじみ/塗りつぶし**: ホバー時に背景色が円形/斜めに広がって塗りつぶされる「フィルインエフェクト」。

### カードホバー
- **浮き上がり（elevation）**: `box-shadow` を強め、`translateY(-4px)` 程度浮かせることでクリック可能性を直感的に伝える。
- **傾き（tilt）演出**: マウス位置に応じてカードが3D的にわずかに傾く（`rotateX/rotateY`）。ゲームのカードコンポーネント（役職カード紹介など）と相性が良い。
- **中身のディテール出現**: Bentoグリッド系トレンドでは、ホバーで隠れていた情報がスッと出てくる、動画がホバー時のみ再生されるなどのインタラクションが「2.0」的な流行として挙げられている。

### フォーム入力フィードバック
- ラベルがフワッと上に移動する「フローティングラベル」
- 入力成功時にチェックマークがポップする、入力エラー時にフィールドが軽くシェイクする、といった即時フィードバック
- 送信ボタン押下後のマイクロアニメーション（ローディングスピナー→チェックマークへの変形）

### 「かわいい」の具体例（SNSリアクション系）
Facebookのリアクション機能（長押しで絵文字が弾けるように展開する）はマイクロインタラクション設計の好例として頻繁に引用される。「小さなバウンス」「跳ねる数字（カート追加時など）」も日本語圏の2025年トレンド記事で明示的に「かわいい」文脈の代表例として挙げられている。

**このサイトへの示唆**: LINE BOTらしい親しみやすさを出すため、ボタンやカードには「弾む」「にじむ」「ふわっと浮く」系の柔らかいイージングを統一トーンとして採用し、鋭いスライドや硬い動きは避けるのが良い。

Sources:
- [Best web micro-interaction examples and guidelines for 2025 - Justinmind](https://www.justinmind.com/web-design/micro-interactions)
- [Microinteractions in UI Design | THESOFTKING](https://thesoftking.com/resources/microinteractions-in-ui-design)
- [10 Micro-Interaction Examples: Boost UX with CSS & JavaScript](https://www.frontendtools.tech/blog/micro-interactions-ui-ux-guide)
- [Card UI design: fundamentals and examples - Justinmind](https://www.justinmind.com/ui-design/cards)
- [2025年Webデザイントレンド マイクロインタラクションとは？](https://nokibou.jp/service/web/creative/20250219/)
- [【2026年最新】Webデザイントレンド15選](https://zero-day.jp/2026/02/21/%E3%80%902026%E5%B9%B4%E6%9C%80%E6%96%B0%E3%80%91web%E3%83%87%E3%82%B6%E3%82%A4%E3%83%B3%E3%83%88%E3%83%AC%E3%83%B3%E3%83%8915%E9%81%B8%EF%BD%9C%E3%83%97%E3%83%AD%E3%81%8C%E6%B3%A8%E7%9B%AE%E3%81%99/)

---

## 3. スクロールトリガーアニメーション（実装アプローチと事例）

大きく3つのアプローチがある。

### アプローチA: Intersection Observer（JS制御・現状の主流）
要素がビューポートに入ったことを検知して `class` を付与し、CSSトランジション/アニメーションを発火させる。ブラウザ対応率94%以上でほぼ全ブラウザ利用可能。ライブラリ例:
- **AOS (Animate On Scroll)** — data属性ベースで手軽、要素ごとに `data-aos="fade-up"` のように指定するだけ。
- **ScrollReveal.js** — 軽量でシンプル、設定オブジェクトでdistance/duration/easingを制御。
- **Murphy.js** — 1.7KB gzip程度の超軽量。Web Animations API + Intersection Observerの組み合わせ。
- **GSAP ScrollTrigger** — 最も高機能（スクラブ、ピン留め、タイムライン同期）。4章で詳述。

自作する場合も数十行程度で実装可能（IntersectionObserverでクラス付与→CSSでtransition）なので、ライブラリを増やしたくない場合は自前実装が現実的。

### アプローチB: CSS Scroll-Driven Animations（`scroll-timeline` / `animation-timeline: view()`）
JS不要でスクロール量に連動したアニメーションを宣言的に書ける仕様（CSS Animations Level 2）。Chrome 115+で利用可能、2024年後半にBaseline入りしつつあるが、**Firefox/Safariの対応は発展途上**であり、`animation-timeline` 非対応ブラウザへのフォールバック（例: `@supports` でIntersection Observer版に切り替える、またはそもそも「動かないが崩れない」設計にする）が必須。Firefoxでは `animation-duration: 1ms` を明示しないと動作しない等の実装上の癖もある。
- `scroll()` : スクロールコンテナ全体の進捗にアニメーションを紐付け（例: ヘッダーの縮小、進捗バー）
- `view()` : 要素がビューポートに入ってから出るまでの区間にアニメーションを紐付け（フェードイン/アウト、パララックス的表現）

メリット: メインスレッドをブロックしない・JS不要・GPU合成されるため60fps安定。デメリット: 対応ブラウザが限定的、デバッグがしづらい、複雑な演出は書きにくい。

### アプローチC: GSAP ScrollTrigger（JS制御・高機能）
スクロール位置に応じたスクラブアニメーション、要素のピン留め（スクロール中固定して演出）、複数要素の同期タイムラインなど、演出の自由度が最も高い。2025年4月以降ScrollTriggerを含む全プラグインが無償化されたため、コスト面のハードルもなくなった（5章参照）。

**推奨方針**: 「フェードイン/スライドインなどの軽い演出」は IntersectionObserver + CSS（または軽量ライブラリ）で十分。「ヒーローのピン留め演出」「複雑な世界観訴求セクション」など見せ場を作りたい箇所に限定して GSAP ScrollTrigger を使う、というハイブリッド構成が現実的（全ページをGSAPで書くとメンテコストが上がる）。

Sources:
- [MDN: CSS scroll-driven animations](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_scroll-driven_animations)
- [A guide to Scroll-driven Animations with just CSS | WebKit](https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/)
- [Animate elements on scroll with Scroll-driven animations | Chrome for Developers](https://developer.chrome.com/docs/css-ui/scroll-driven-animations)
- [CSS scroll-triggered animations are coming! | Chrome for Developers](https://developer.chrome.com/blog/scroll-triggered-animations)
- [Latest ScrollReveal Solutions in JavaScript (2024-2025)](https://portalzine.de/latest-scrollreveal-solutions-in-javascript-2024-2025/)
- [Modern Animate On Scroll Library For Vanilla JavaScript - Scroll Observer](https://www.cssscript.com/animate-scroll-observer/)
- [Vanilla JS Scroll Events & Animations with IntersectionObserver API](https://cheewebdevelopment.com/vanilla-js-scroll-events-animations-with-intersectionobserver-api/)

---

## 4. アニメーションライブラリ比較（静的サイト/Vite+TSでの現実的選択肢）

| ライブラリ | 学習コスト | バンドルサイズ（目安・gzip） | パフォーマンス | ライセンス | 特徴 |
|---|---|---|---|---|---|
| **GSAP + ScrollTrigger** | 中（独自API、慣れれば直感的） | core 約25KB＋ScrollTrigger等プラグインで数十KB追加 | 非常に高い。DOM/SVG/Canvas問わず安定、タイムライン制御が強力 | **2025年4月以降 完全無料**（商用含め全プラグイン無償化。Webflowが買収し方針転換） | scroll-linkedや複雑な演出、SplitTextでのテキスト分割リビールなど「作り込み」に最強 |
| **Motion（旧Framer Motion, Motion One系）** | 低〜中（宣言的でシンプル） | 非常に軽量（GSAPよりおよそ5KB軽い規模、Web Animations API土台） | 高速（単純なtweenではGSAPより高速なベンチマークもあり）。ただし複雑な同時実行アニメーションでは分が悪いという報告も | MIT（OSS版） | Web Animations API活用でネイティブに近い性能。React版もあるがVanilla JS版(`motion`パッケージ)も提供され、Viteとの親和性は高い |
| **anime.js (v4)** | 低 | 約17KB、モジュール分割でさらに削減可能 | 良好。シンプルなtween主体なら十分高速 | MIT | バンドルサイズ制約が厳しい場合の第一候補。単発の要素アニメーションが中心なら学習コストも最小 |
| **CSS Scroll-Timeline（ライブラリ不要）** | 低〜中（CSS力次第） | 0KB（ネイティブCSS） | 最高（メインスレッド外・GPU合成） | — | JS不要でスクロール連動演出が書けるが、Safari/Firefoxの対応状況に注意しフォールバック設計が必要 |
| **Lottie / dotLottie** | 中（AE等でアニメ制作 or 素材調達が前提） | プレイヤー本体 約50KB gzip＋アニメーションデータ30〜100KB（dotLottie形式ならJSON比最大10分の1に圧縮可） | アニメーション内容次第。ベクターの複雑なキャラクターアニメーション等に強いが、重いと初期表示に影響するため遅延読み込み必須 | MIT（lottie-web / dotlottie-web） | 「かわいいキャラが動く」ようなイラスト表現をコードで作るのが難しい場合の解。要素単位ではなく「動画的な1アセット」として扱う |
| **Intersection Observer + 自前CSS（ライブラリ不要）** | 低 | 0KB（ネイティブAPI） | 高い（実装次第） | — | フェードイン/スライドイン程度なら十分。依存ゼロで最も軽量・保守しやすい |

**総括**: バンドルサイズ最優先なら「CSS Scroll-Timeline + Intersection Observer自前実装」の組み合わせでゼロ依存運用が可能。ただしヒーローの「作り込まれた感動」演出（テキストの逐次リビール、ピン留めしたスクロール演出など）を狙うなら、無償化されたGSAP（core + ScrollTrigger + SplitText）を部分投入するのが最も効率的（学習リソースが豊富で、Awwwards級の演出パターンの大半がGSAPベースで解説されているため実装の再現性が高い）。

Sources:
- [Webflow makes GSAP 100% free — plus more exciting updates](https://webflow.com/blog/gsap-becomes-free)
- [GSAP Is Now Free for Everyone: Webflow's Game-Changing Gift to Web Animators](https://www.alijavadi.net/articles/gsap-is-now-free-for-everyone-webflow-s-game-changing-gift-to-web-animators)
- [GSAP is Now Completely Free, Even for Commercial Use! | CSS-Tricks](https://css-tricks.com/gsap-is-now-completely-free-even-for-commercial-use/)
- [Comparing JavaScript animation libraries for production use - ICS MEDIA](https://ics.media/en/entry/14973/)
- [GSAP vs Motion: A detailed comparison | Motion](https://motion.dev/docs/gsap-vs-motion)
- [GSAP vs Anime.js vs Motion Compared | GSAP Vault](https://gsapvault.com/blog/gsap-vs-animejs-vs-motion)
- [dotLottie: The Open .lottie Animation Format](https://lottiefiles.com/dotlottie)
- [High-Performing Lottie animations on the Web – 8awake](https://www.8awake.com/best-practices-implementing-lottie-animations-on-the-web/)
- [Murphy.js (GitHub topics: intersection-observer)](https://github.com/cesarolvr/murphyjs)

---

## 5. やりすぎを防ぐベストプラクティス（モバイル配慮・`prefers-reduced-motion`）

### パフォーマンス原則
- **アニメーションさせるプロパティは `transform` と `opacity` に限定する**。`width`/`top`/`left` 等のレイアウトに影響するプロパティのアニメーションはレイアウト再計算（リフロー）を引き起こし、モバイルでフレーム落ちの原因になる。
- **同時に動かす要素数を最小限にする**。多数の要素を一斉にアニメーションさせるとミッドレンジ端末で60fpsを維持できない。
- **初回ロード直後のクリティカルな表示をアニメーションでブロックしない**。ヒーローの主要テキスト/CTAはできるだけ早く「見える」状態にし、装飾的な演出はそれに続けて走らせる。
- **`translate` を使い `top`/`left` を避ける**、DOMの読み書きをバッチ化してレイアウトスラッシングを防ぐ、実機（特にミッドレンジのAndroid端末）でテストする、といった実装レベルの徹底が推奨されている。
- スクロールトリガー演出はIntersection Observer/`view()`で「画面内に入った時だけ」発火させ、画面外の要素を計算し続けない。

### `prefers-reduced-motion` 対応
- OSの「視差効果を減らす」等の設定を検知し、対象ユーザーには**過度な動きを完全に削除または縮小したバージョン**を提示するのが必須のアクセシビリティ対応（前庭障害等のユーザーへの配慮）。
- 実装は `@media (prefers-reduced-motion: reduce)` でスクロール演出・自動再生ループ・パララックスを無効化し、フェードなど最小限のトランジションのみ残す、またはトランジション自体を`transition: none`にする方針が一般的。
- 「motion-first」ではなく「no-motion-first」で設計し、reduce指定時にどう見えるかを先に決めてから通常時の演出を足していく考え方（"no-motion-first approach"）が提唱されている。
- reduced-motion環境では体感速度も向上する（アニメーション待ちがなくなりInteraction to Next Paintが改善するとの指摘あり）ため、パフォーマンス面でも一石二鳥。

### モバイル特有の配慮
- ホバー前提の演出（`:hover`のみで発火するインタラクション）はタッチデバイスで機能しないため、**タップ/フォーカスでも同等のフィードバックが出るように設計する**（モバイルではホバー状態自体が存在しない）。
- 複雑なJSアニメーション（GSAP等）の多用は低〜中スペック端末でフレーム落ちしやすいため、ネイティブAPI（Web Animations API、CSS transitions/animations）を優先し、JS制御は「ここぞ」という箇所に絞る方針が推奨される。
- 画像・Lottie等の重いアセットは遅延読み込み（lazy load）と組み合わせ、初期表示（LCP）に影響させない。

**このサイトへの示唆**: モバイル中心・パフォーマンス重視という制約から、「常時JSアニメーションが動き続ける」演出（背景パーティクル等）は避けるか非常に軽量なものに限定し、`prefers-reduced-motion`分岐を最初から設計に組み込むべき。

Sources:
- [prefers-reduced-motion CSS media feature - MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
- [prefers-reduced-motion: Taking a no-motion-first approach to animations » Tatiana Mac](https://www.tatianamac.com/posts/prefers-reduced-motion)
- [Using prefers-reduced-motion for Accessible Animation](https://blog.openreplay.com/prefers-reduced-motion-accessible-animation/)
- [How to Use Motion Design Without Hurting Page Speed | Thrive](https://thriveagency.com/news/how-to-use-motion-design-without-hurting-page-speed/)
- [Mastering Mobile Transitions - Essential Animation Techniques for Cross-Platform Apps](https://moldstud.com/articles/p-mastering-mobile-transitions-essential-animation-techniques-for-cross-platform-apps)
- [Designing Accessible Animations: A Practical Guide to prefers-reduced-motion (Medium)](https://medium.com/@daceynolan/designing-accessible-animations-a-practical-guide-to-prefers-reduced-motion-0d3b89c3b1cb)

---

## 6. 最重要CTA（LINE友だち追加ボタン）を印象的に見せるアニメーション事例

LINE友だち追加ボタンはこのサイトのコンバージョンの核なので、「気づかれる」「押したくなる」の両方が必要。

### 気づかせるための動き
- **パルス/シャイン（光の反射）ループ**: ボタン全体をゆっくり拡大縮小させる、あるいはボタン上を光の帯が斜めに一定間隔で通過する「シャインエフェクト」。1.05倍程度の控えめなスケールパルスが「待っている感」を演出し、行動を促すとされる。
- **ワンポイントのバッジ/吹き出し**: ボタン脇に「無料」「30秒で完了」等のマイクロコピーの吹き出しをふわっと出現→軽くバウンドさせる、通知バッジ風の小さな丸をピコピコ点滅させるなど、ゲーム性・親しみやすさと相性が良い演出。
- **スクロール追従（スティッキーCTA）**: モバイルで一定スクロール後に画面下部に追従表示させ、常にアクセス可能にする。追従開始時に軽くスライドイン+バウンドさせると唐突感を減らせる。

### 押したくなるための動き（ホバー/タップ時）
- ホバー可能な環境ではホバー時に**15〜25%コンバージョン改善**の報告があるほど、ホバーアニメーション付きボタンは有効とされる。ただしモバイル主体のためタップ時のフィードバック（軽い縮小→戻る「押し込み感」、色の反転、LINEのグリーンが一瞬明るくなるフラッシュ等）の設計を優先すべき。
- タップ直後に成功が視覚的にわかる遷移（LINE風の吹き出しやチェックマークのポップ）を挟むと、離脱前の安心感につながる。

### 実装上の注意
- パルス/シャイン系の常時ループアニメーションは`prefers-reduced-motion`で必ず停止させる（5章参照）。
- CTAの動きは「目立たせる」ことが目的であり、複数の演出（パルス＋バッジ＋シャイン）を同時に盛り込みすぎると逆にうるさくなり信頼感を損なう。**1〜2種類の動きに絞り、他の装飾は静的にする**メリハリが重要（"2%のスケールは上品、それ以上はおもちゃっぽい"という指摘が示す通り）。

Sources:
- [LINE友だち追加を促すポップアップバナー｜デザイン5選と効果を高める方法 | Promolayer](https://promolayer.io/%E3%82%B3%E3%83%B3%E3%83%90%E3%83%BC%E3%82%B8%E3%83%A7%E3%83%B3%E7%8E%87%E3%82%A2%E3%83%83%E3%83%97/line%E3%81%AE%E3%81%8A%E5%8F%8B%E9%81%94%E7%99%BB%E9%8C%B2%E4%BF%83%E9%80%B2%E3%83%90%E3%83%8A%E3%83%BC/)
- [CTAとは？クリック率が向上するボタンデザインや文言を紹介 - Sienca](https://sienca.jp/blog/cro/what-is-cta/)
- [CTA（コール・トゥ・アクション）ボタンでアニメーションを作成する方法](https://sellp.co.jp/2024/11/cta%EF%BC%88%E3%82%B3%E3%83%BC%E3%83%AB%E3%83%BB%E3%83%88%E3%82%A5%E3%83%BB%E3%82%A2%E3%82%AF%E3%82%B7%E3%83%A7%E3%83%B3%EF%BC%89%E3%83%9C%E3%82%BF%E3%83%B3%E3%81%A7%E3%82%A2%E3%83%8B%E3%83%A1/)
- [UI Micro-Animations in 2026: The Secret Weapon Behind High-Converting Websites](https://sohelmalek.com/blog/ui-micro-animations-high-converting-websites-2026/)
- [How Hover Animations Improve UX and Conversions – Upward Engine](https://upwardengine.com/blog/hover-animations-improve-ux-conversions/)
- [The Impact of Animation on Conversion Rates](https://blog.pixelfreestudio.com/the-impact-of-animation-on-conversion-rates/)

---

## 推奨: このプロジェクトに最も適したアプローチ

**推奨: 「CSS/ネイティブAPIをベースにし、演出の見せ場（ヒーロー・CTA）にのみ GSAP（core + ScrollTrigger、必要なら SplitText）をピンポイント投入するハイブリッド構成」**

理由:
1. **コスト・ライセンス面の障壁が消えた**: 2025年4月にWebflowの買収によりGSAP本体・ScrollTrigger・SplitTextを含む全プラグインが商用含め完全無料化された。かつての「高機能だが有料プラグインが必要」という導入障壁がなくなり、追加コストゼロで最も表現力の高いアニメーションエンジンを使える。
2. **Vite/Vanilla TSとの親和性が高い**: GSAPはフレームワーク非依存のプレーンなJSライブラリで、npmインストールしてTSファイルからimportするだけで動く。ReactやSPAを前提としないこのサイトの構成（静的HTML＋Handlebarsパーシャル＋Vite）と自然に噛み合い、React専用の`Motion`（Framer Motion系）のような設計上のミスマッチが生じない。
3. **「感動」演出との相性**: 1章で挙げたテキスト逐次リビール、ピン留めスクロール演出、スクラブ同期タイムラインといった「作り込まれた第一印象」を狙う演出は、GSAP＋ScrollTriggerの得意領域であり、実装例・学習リソースも最も豊富（再現性が高くハマりにくい）。
4. **ただしGSAPだけに頼らない**: 全ページの単純なフェードイン/スライドインまでGSAPで書くとバンドルサイズと保守コストが不必要に増える。そうした軽微な演出は「Intersection Observer + CSSトランジション」（依存ゼロ）で処理し、GSAPは①ヒーローの登場演出、②CTAの印象づけ演出、③1〜2箇所の見せ場スクロール演出、に限定投入する。これによりバンドルサイズを抑えつつ、モバイルパフォーマンスと表現力を両立できる。
5. **CSS Scroll-Timelineは補助的に留める**: ブラウザ対応がまだ完全でない（Safari/Firefoxの実装差異）ため、対応ブラウザへのプログレッシブエンハンスメントとして軽微な演出（進捗バー等）にのみ使い、主要演出の土台には据えない。
6. **`prefers-reduced-motion`とモバイル配慮を実装の前提条件にする**: GSAPのタイムライン生成前に`matchMedia('(prefers-reduced-motion: reduce)')`分岐を必ず入れ、reduce時はGSAP自体を初期化しない（あるいは`duration: 0`にする）設計を最初から組み込む。

以上より、**GSAP（core + ScrollTrigger、必要箇所のみSplitText）をピンポイントで使い、それ以外はネイティブCSS/Intersection Observerで賄うハイブリッド構成**を最終推奨とする。
