# v3 現状監査 — 2026-11-13

## 保護

この編集アプリにはGitリポジトリがなく、status / branch / log はいずれも対象外だった。既存コードを初期化・リセットしない。作業直前の `workspace/projects` 全体（JSON・素材・履歴）、src、serverを `docs/backups/v3-before-*` へコピーした。既存Project/Scene/Layer IDと正本JSONは保持する。

## 現状と利用方針

- React19 / Remotion Player4 / Express5 / Vite6。localhost:4319。独立した既存アプリを改修する。
- App.tsxは3パネル＋タイムライン、Undo/Redo、revision付き保存、AI部分提案の承認を実装済み。これらを維持し、新機能を別コンポーネントへ分離する。
- core.tsのProject/Scene/Layerと正式schema、serverの原子的JSON保存・履歴・素材保管を継続利用。旧JSONを移行強制しない。v3追加情報は許容済みstyleと局所的schemaアダプターで拡張。
- Composition.tsxは同じ定義をPlayerへ描画。4モーション（M-003/008/012/017）のみ適用可能。MP4 API・共有HTML生成は未実装。見本・適用・出力の状態を分離し、MP4対応は全件不可と表示する。
- 既存の矩形/円/ひし形マスクと数値による位置・重ね順を利用する。新規ドラッグUIは描画外のオーバーレイ。外部操作ライブラリは導入せずPointer Eventsで実装予定。
- 素材の永続assets/保存は既存実装を使用。画像・動画の縮小JPEGをブラウザで生成し、サーバーに別ファイルとして保存。Base64やBlob URLを正本へ保存しない。
- 参照Canvas原本は `reference/catalog/MOTION_ATLAS_60/index.html`（60種）。その描画関数を生成モジュールへそのまま抽出し、ctx・ID・進捗を受けるアダプターにする。原本は変更しない。静止ポスター60枚と選択1件のCanvasのみを使う。
- 12レイアウト原本は依頼フォルダの03 JSON。既存のsingle/split2/grid4/freeを保ち、プリセットをfreeの正規化transformへ変換する。既存レイヤーIDは残し、余る媒体は保留トレイへ。

## 順序と合格条件

1. 原本Canvasの60ポスター＋選択1件再生・停止・速度、検索・タグ、試着、および画像/動画のサムネイル・拡大・永続化。
2. L-01〜12の図解、選択コマだけへの試着・採用/取消、別コマ・尺・レイヤー保持。
3. 編集/再生切替、直接移動・四隅拡縮・回転、クリップ・素材充填・重ね順・複製/削除/ロック、Undo/Redo・保存・再読込。

各段階でブラウザ確認後に次へ進む。MP4を編集中に生成しない。既存の本番アプリ、promo-studioの動画、元カタログは変更しない。
