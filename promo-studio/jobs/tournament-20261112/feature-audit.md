# 機能監査

調査日: 2026-11-12
対象: C:/Users/ryoji/00myapp/ai_demo_workspace/tournament-latest-review-20261024

| 機能 | 分類 | 根拠 | 撮影方針 |
|---|---|---|---|
| サンプルのペア発表・カード公開 | verified（コード・画面操作） | src/preview/PreviewApp.tsx、FixtureStage.tsx、capture evidence | 既存Animation Previewを撮影 |
| サンプルの対戦カード | verified（コード・画面操作） | src/features/presentation/postMatch/PostMatchStage.tsx、capture evidence | 同上 |
| サンプルの勝利表示 | verified（コード・画面操作） | 同上 | 同上 |
| サンプルの優勝表示 | verified（コード・画面操作） | src/preview/FixtureStage.tsx | 同上 |
| 再生・停止・シーク | verified（コード・画面操作） | PreviewAppの操作ボタンと確認位置スライダー | 撮影フレームの時刻指定に使用 |
| 受付・ペア抽選の保存・大会進行 | inferred（コード・README） | README.md、src/checkin | 今回は宣伝上の実証に使わない |
| 本番での端末同期・会場音響・実カメラ | inaccessible（未調査） | 本番環境を操作していない | 主張しない |

## 対象保護

- ソース、Git履歴、設定、共有node_modules、D1/R2を変更しない。
- 元のVite設定を制作側設定から読み込み、キャッシュは制作フォルダに分離。公開素材のdev配信だけ制作側で有効化。
- ローカルのバックエンド不要な既存プレビューを使用。顧客データ・認証情報を読み取らない。
- 写真は既存のplaceholder_face.svg、名前は既存サンプル。サンプル表示の注記を完成動画にも常時表示。
- draw/championはアプリ自身がサンプル専用と明記している演出。本番Displayと完全同一とは主張しない。

## 素材とライセンス

- 元アプリの画像はユーザー指定アプリの画面キャプチャにのみ含める。上流素材の個別配布権・商用利用権はリポジトリ内で確証を得られず、外部公開前の確認事項として残す。
- BGMは本制作の数式によるオリジナル合成。第三者録音や音楽サンプルなし。
- 字幕はOSにある日本語フォントで描画し、フォントファイルを同梱しない。
- Remotionの利用条件: https://www.remotion.dev/docs/license/pricing （2026-11-12確認）。利用主体の規模と用途による適用条件は利用者側で確認する。ライセンス購入・有料サービス利用は行わない。
