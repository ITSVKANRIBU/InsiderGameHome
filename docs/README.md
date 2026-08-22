# ドキュメント

このディレクトリは、サイトの現行仕様と進行中の作業資料を分けて管理する。

## 現行仕様

- [システム構成](architecture.md): 配信構成、ページ構成、コードと外部サービスの境界。
- [バックエンド API 仕様](api-specification.md): `InsiderGameHome` から利用する公開 API の契約。
- [運用手順](operations.md): 開発、テスト、ビルド、Netlify 配信の手順と確認事項。

## 作業資料

進行中の設計提案・実装計画・レビュー・検証記録は [`superpowers/`](superpowers/) に置く。ファイル名には作成日を付ける。

- [リファクタリング提案](superpowers/specs/2026-08-23-refactor-proposals.md)
- [移行検証チェックリスト](superpowers/plans/2026-08-23-verification-checklist.md)

作業が完了した資料は、実装の結論を現行仕様へ反映した後に削除する。現行仕様の設計書には日付・経緯・実装手順・チェックリストを残さない。
