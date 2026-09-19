# AGENTS.md

InsiderGameHome — インサイダーゲーム用 LINE BOT の紹介・マニュアルサイト（静的サイト）。

## プロジェクト概要

- デプロイ先は Netlify（https://insidergametool.netlify.app）。**master への push が本番デプロイになる。
- `_redirects` が旧パス `/webcontent/*` をルートへリダイレクトしている（互換維持のため残す）。
- 外部APIの詳細仕様は `docs/api-specification.md` を参照すること。

## 開発原則

- **後方互換性は維持しない。** 互換レイヤー、フォールバック、マイグレーションを追加するのではなく、不要になった実装やコードパスは削除する。
