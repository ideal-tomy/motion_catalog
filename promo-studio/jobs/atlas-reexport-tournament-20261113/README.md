# ATLAS 再出力カタログ：20秒大会オープニング

指定の `Codex_制作依頼.md` の最初のテスト制作を実装。独立した既存 `promo-studio` を使用し、本番アプリ・原本・過去の作品は変更していません。

## 成果物

- `output/preview/index.html`：音付き完成動画。
- `output/motions/index.html`：6種類の単体プレビュー（無音、再生・停止・シーク可能）。
- `composition.json`：文字・色・尺・速度・イージング・音キューを差し替える宣言。
- `../../../動画ライブラリ/index.html`：完成動画の集約先。
- `source-audit.json`：再出力元68ファイルの比較と対象6件の仕様。

|秒|フレーム（終端を含まない）|ID|内容|
|---|---|---|---|
|0–3|0–90|M-009|12層のワイヤートンネル、終盤加速|
|3–6|90–180|M-017|前半速く終盤減速するタイプ入力＋カーソル|
|6–10|180–300|M-060|左右の対戦者が衝突。192f＝6.4秒でVS・低輝度閃光・リング・SE同期|
|10–13|300–390|M-054|複数のリングが遅延して拡大・消失|
|13–17|390–510|M-014|固定シードの100粒子、1.4秒で減速・消失|
|17–20|510–600|M-016|背面の紙吹雪と拡大リング、1.8秒後は見出し保持|

## 実装

各 `src/motions/M009/`、`M017/`、`M060/`、`M054/`、`M014/`、`M016/` が独立した公開部品。共通描画は `atlas-shared.tsx`、共通propsは `atlas-types.ts`。`frame`、`durationInFrames`、`text`、`theme`、`speed`、`easing`、`startFrame`、`endFrame`、`audioCue` を受け取り、時計・乱数状態・CSSアニメーションに依存しません。M-060の文字は `左 / VS / 右` 形式です。`AtlasTournament.tsx` と単体Compositionは同じ部品を利用します。

JSONの `startFrame/endFrame` が実際のタイミング、`from/to` は秒表記です。変更時は両方を揃えてください。完成版は600フレーム固定です。IDは上記6種類を選択できます。全60種の移植ではありません。既存の別案件向け部品やカタログの検証状態は書き換えていません。

## 再実行（promo-studio内）

```powershell
npm run typecheck
node scripts/music-atlas.mjs
node scripts/render.mjs jobs/atlas-reexport-tournament-20261113
node scripts/preview-atlas.mjs
node scripts/package-atlas.mjs --prepare
node scripts/qa.cjs jobs/atlas-reexport-tournament-20261113
node scripts/package-atlas.mjs
node scripts/verify-atlas.cjs
```

新しい映像をライブラリへ収録する場合、先に `delivery.json` の版を上げてください。`setup-atlas-reexport.mjs`、`prepare-atlas.mjs` は初期構築用で、日常の再出力には使いません。Remotion Studioは `npm run studio`、`AtlasTournament` または各M番号を選択します。

## 依存・制約・権利

既存のReact 19.3.1 / Remotion 4.0.542 / TypeScript 7.0.2 とローカルEdgeを使用。追加インストールなし。H.264 / AAC、1920×1080 / 30fps / 20秒 / SDR、配信用yuv420p。疑似3DのSVGであり本物の3Dカメラではありません。縦型はviewBoxを保つ拡張が必要で、今回は未制作。

120 BPMのBGMとSEはオシレータ＋固定シードノイズによる自作。第三者の録音・楽曲・画像は使用していません。Arial/system sans-serifはOSから参照し、フォントファイルは配布していません。実在の大会・選手・成績を示す映像ではありません。画面全体の閃光は最大16%の淡い重ね合わせ1回に抑制。情報の確定後は静止して読ませています。

## 検証

検査結果は `qa/result.json`（全600フレーム・音量・全編復号・ブラウザ完走）、`qa/motion-tests.json`（単体の動き・逆方向シーク後の同一性・組み合わせとの画像ハッシュ一致）、`qa/browser-tests.json`（原本の選択・単体プレビュー・スマホ幅）、`qa/VERIFICATION.md` を参照。
