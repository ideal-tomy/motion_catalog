# v3 操作・回帰検証 — 2026-11-13

これはv0.3.0時点の検証記録です。v0.4.0の全60種試着・動画編集の検査は [LIVE_EDITING.md](LIVE_EDITING.md) を参照してください。

## 結果

3段階を順番に実装し、各段階の合格後に次へ進んだ。追加インストールなし。実際のWindows上のEdge（Playwright headless）でマウス・キーボード・再生・保存・API・実ファイルの経路を確認した。物理モニター上での人の操作評価ではない。

|検査|結果・証拠|
|---|---|
|既存コア|`npm test` 8件合格。旧JSON・秒数・固定尺・分割・部分AI patch・ロック・素材検査|
|本番ビルド|`npm run build` 合格。Remotionのuse client無視、約906KBのバンドルサイズ警告のみ。型エラーなし|
|既存UIの回帰|`npm run test:browser` 15項目合格。20秒全編、タイムライン、7→9秒、複合モーション、Undo/Redo、固定尺承認、色固定、AI保護、履歴復元、複製、競合409、Origin403、render API未実装404|
|Phase 1|60カード、5種で異なる見本、停止後の画像固定、閉じるとCanvasなし、モーション試着取消、赤/青PNGの区別、セル3への正しい素材配置、保存再読込、別コマ保持|
|Phase 2|12レイアウトすべてを試着・取消。使用した素材構成で11パターンの候補画像差分を確認。L-09の採用・保存再読込、既存レイヤーID・他コマ・尺を維持|
|Phase 3|4分割の1領域を楕円にし、赤画像を実クリップ。実マウスによる移動・四隅拡縮・回転、固定、Undo/Redo、複製/削除、図形追加、保存再読込、再生モードにハンドルなし|
|原本との一致|M-001 / 008 / 020 / 054 / 060を同じ進捗0.36で描画し、独立原本HTMLと抽出版CanvasのPNGが完全一致|
|画像・動画|PNG2枚とMP4の縮小ポスターを永続保存。動画をクリックして再生、閉じた後にvideo要素なし。破損PNGを拒否。旧形式のポスター情報なし動画も派生JPEGを生成して再読込で再利用|
|最終操作|変更前/後の試着比較、空の画像フレーム、DeleteとUndo/Redo、字体Georgiaと文字色の保存・復元、プロジェクト複製時のサムネイルコピー|
|再起動と保護|停止→非表示起動後のProject JSON完全一致、全参照素材ファイルあり。既存サンプルの内容は作業前バックアップとrevisionを除き完全一致|

`docs/qa/browser-result.json`、`docs/qa/v3/phase1.json`〜`phase3.json`、`extra.json`、`final.json`、`restart-and-protection.json` が機械可読結果。

## エンドツーエンド経路

ユーザーの操作 → Reactの候補/編集JSON → スキーマ・意味検査 → localhost API → project.json・history・assets → 再読込 → 共通Compositionの表示、まで確認。外部サービス・APIキー・本番環境は使用していない。

- 素材POSTで原本・縮小JPEGを別保存し、PUT保存後に新しいページで実画像を再表示。
- 試着は元JSONを変更せず、採用時だけUndo履歴を作成。別sceneIdと総尺を比較。
- 変形は正規化座標をJSONに保存。編集オーバーレイと映像のDOMを分け、再生時はオーバーレイ0件。
- 保存の履歴復元は非同期のため、回帰テストでは復元完了表示を待機するよう修正。画面を刷新したモーション図鑑・素材配置は新しい操作名で同じ受け入れ内容を検査。

## 性能

検査環境の参考値（`extra.json`）。60種類を静的に1回ずつ描画：約253ms。選択1件の再生時はCanvas1枚・iframe0枚、rAF間隔中央値約6.9ms、95パーセンタイル約15.8ms、JSヒープ約26MB。閉じた後は図鑑Canvas0枚。一覧の動画デコーダー0個。これらはheadless Edgeの短時間観測値で、全PCや実画面でのFPS保証ではない。

## 画面証跡

- `docs/qa/v3/phase1-catalog.png`：原本図鑑の一覧と選択1件。
- `phase1-assets.png`：画像2枚の実サムネイル。
- `phase2-layouts.png`：12種の図解。
- `phase2-adopted.png`：採用後。
- `phase3-editing.png`：実画像の楕円クリップと回転ハンドル。
- `phase3-playback.png`：ハンドルのない映像表示。
- `final-editor.png` / `final-compact.png`：最終操作・1100px幅。390px幅の横溢れも検査。

## 残る範囲

MP4/共有HTMLの書出は未実装で、出力画質やMP4でのマスク互換は未検証。今回は編集中のMP4生成を行っていない。残る機能上の制約は `EXTENSION_V3_IMPLEMENTATION.md` に記載。
