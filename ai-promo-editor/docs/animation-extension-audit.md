# 個別アニメーション拡張・着手前調査

2026-11-13。React 19 / Remotion 4.0.542 / Player / Vite / Express。既存アプリを拡張する。追加依存なし。

- `App.tsx` が project / sceneId / layerId、試着用別プロジェクト、履歴80件、保存revisionを管理。保存前の試着は元データを変更しない。
- `core.ts` の Layer は正規化座標、セル番号、素材参照、トリミング、旧M motionStackを保持。Sceneは分割レイアウトと相対フレームを持つ。
- `geometry.ts` の layerBounds でセル座標からキャンバス座標へ変換できる。既存にグループ構造はない。新しい明示的な親フレーム参照を導入し、無関係の文字を追従させない。
- `LiveComposition.tsx` を Player と Composition が共有。Scene内のSequenceによりレイヤーローカル時刻とシーン時刻が異なる。新設定は必ずsceneFrameで評価する。
- 枠装飾は外側、マスクは内側。frame変換は外側、imageContent変換はマスク内の素材に限定する。既存のmediaZoom/crop/rotate/配色を保持する。
- Ajv適応スキーマ＋明示検証、ローカルAPI原子的保存、JSON、Undo/Redo、チェックポイントを再利用する。旧JSONに新フィールドは要求しない。
- 既存M-001〜060と原本・ビューアは維持。A-001〜024は独立した単一TSカタログ＋決定論的評価関数にする。必要時だけ小見本をPlayerで再生する。
- 編集用選択線は静止編集モードだけ。試着は再生モードで確認する。既存のMP4エディタ書き出しは未接続のため、MP4対応は未検証と表示する。

## 実装順

1. A-005のみ有効にしてframe/canvasとimageContent/parentFrameを実ブラウザで確認。
2. 論理解像度・回転外接矩形・親参照を用いた方向終点を共通化して方向8件へ拡張。
3. 基本・文字・表示を追加し24件の状態を一覧管理。
4. 試着調整・複数合成・競合表示・日本語設定案・保存復元・既存機能の回帰検査。

編集前のsrc/server/projectsは `docs/backups/animations-before-20261113/` にコピーした。原本カタログ、完成動画、既存案件を直接編集しない。
