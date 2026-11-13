# v3 実装内容

これはv0.3.0時点の記録です。現在の全60種試着・動画取り込みについては [LIVE_EDITING.md](LIVE_EDITING.md) を参照してください。

既存アプリを段階的に拡張。新規アプリ・全面リライト・追加依存の導入なし。

|機能|変更場所|実装|
|---|---|---|
|60種類の本物の動く見本|src/atlas/renderer.js、scripts/extract-atlas.mjs|原本の描画関数を抽出。ctx/ID/progress指定。原本は保護、生成ファイルにSHA-256を記録|
|静止一覧＋選択1件再生|MotionCatalog.tsx、public/atlas-posters/|60件のJPEG、検索・カテゴリー・仮感情タグ、拡大Canvas1枚、再生/停止/再再生/速度、閉じると破棄。画面外は描画を停止|
|状態の分離|server/index.mjs、MotionCatalog|previewAvailable / sceneApplicable / mp4Exportable を独立。60件視聴可、4件適用可、0件MP4書出可|
|モーション試着|App.tsx|選択レイヤーへの候補を別Projectで保持。中央で変更前/後を比較、採用/取消。元のrevision・sceneIdと異なる場合は採用拒否|
|素材サムネイル|MediaLibrary.tsx、server/index.mjs|画像縮小JPEG、動画の先頭フレームポスター、拡大/再生。アップロードは逐次処理。縮小画像はassets/へ永続化。旧素材も必要時に派生ポスターを生成・再利用|
|素材配置|App.tsx、Composition.tsx|セル/選択フレーム/新規レイヤー/背景、cover/contain、切り抜き位置。素材一覧から外す操作は物理ファイルを消さず、使用中素材は拒否、Undo可能|
|12レイアウト|layouts.ts、LayoutCatalog.tsx、reference/layouts-v3.json|配布JSONをアダプターでfree座標へ変換。図解・試着・変更前/後比較・採用/取消。媒体・文字IDと他シーン・尺を保持。余剰媒体は保留トレイ|
|直接編集|EditStage.tsx、geometry.ts|Pointer Eventsで移動・四隅拡縮・回転。1%/5°スナップ、比率固定。正規化座標で保存。1ジェスチャーでUndo1回。選択ハンドルは独立オーバーレイ|
|追加/整列/文字|App.tsx|四角・角丸・円/楕円・ひし形・画像/動画用の空フレーム・文字、字体・文字色・図形色、複製・削除/Delete・最前背面・中央揃え・横中心の等間隔・固定・非表示|
|クリップと描画|Composition.tsx、geometry.ts|実媒体にellipse/diamond/斜めCSSクリップ、角丸。編集モードは全レイヤーを静止表示、再生モードは時間とモーションを適用しハンドルなし|
|互換・保存|core.ts、server/index.mjs|既存schema原本を変更せず局所アダプターでassetメタ情報とlayout.presetIdを追加。style拡張と旧mask互換。保存・履歴・revision競合・AI手動保護を継続|

## ファイルと復元

原本カタログと元のタグ定義は変更していない。`reference/style-tags.json` は既存タグから日本語の選択用ラベルを派生させたもの。仮分類であることをUIに明示。

作業前の保護コピー：`docs/backups/v3-before-20261113-005523/`。projectsには元のJSON・素材・履歴、src/serverには改修前のコードがある。復元が必要なら現在の編集を保存・別途バックアップしてから停止し、対象ファイルだけ戻す。実行中に一括上書きしない。

Project JSONは引き続き `workspace/projects/<id>/project.json`。素材は `assets/<assetId>.<ext>`、サムネイルは `assets/<assetId>.thumb.jpg`。原寸画像やBase64をJSONへ入れない。新規素材は元名・寸法・動画秒数・posterPathを保存。旧素材の元名や寸法がJSONにない場合は、元ファイル名を表示し、派生ポスターをファイル名規則から復元する。

## 制約・次工程

- MP4・共有HTML書出、出力とのピクセル一致検査は未実装。見本の60件をそのまま出力対応と表示しない。編集のたびの動画書出なし。
- シーン適用は既存4件だけ。図鑑は原本の見本、シーン上では編集器の既存アダプターで実際の文字・媒体に適用するため、原本のサンプル文字や背景そのものが挿入されるわけではない。
- 操作は単一レイヤー選択。等間隔は現在のコマの表示中レイヤーの横中心を対象とする。複数選択・グループ化・ガイド線吸着は未追加。回転済み領域の拡縮はローカル軸方向。
- 円形プリセットは提供JSONどおりの比率。厳密な真円にする場合は幅・高さを調整する。旧circleマスクは互換維持、新ellipseは楕円。
- 余剰素材は保留。レイアウト採用で文字の自動縮小・衝突回避は行わない。中央画面と警告を確認して手で調整する。
- ブラウザが再生/デコードできるPNG/JPEG/WebP/MP4に対応。画像・動画のサムネイル生成はブラウザ側で行うため、原寸のデコードはアップロード時に1件ずつ発生する。1ファイル20MBまで。
- サムネイルキャッシュの自動整理・素材の物理削除なし。Undoと過去保存版の参照を保護する。
- 感情タグは初期分類。フォントはOSに依存し配布しない。AI自動呼び出し・配色生成などは従来どおり未実装。

## 再現

`./起動.ps1` → http://127.0.0.1:4319 。README「v3の操作」を参照。既に開いているブラウザは未保存の編集を保存してから再読込する。

検査：`npm test`、`npm run build`、`npm run test:browser`。v3専用検査は `node tests/v3-phase1.cjs` → `node tests/v3-phase2.cjs` → `node tests/v3-phase3.cjs` → `node tests/v3-extra.cjs` → `node tests/v3-final.cjs` の順（専用プロジェクトを生成）。ポスター再生成は起動中に `node scripts/atlas-posters.cjs`。原本抽出は `node scripts/extract-atlas.mjs`。
