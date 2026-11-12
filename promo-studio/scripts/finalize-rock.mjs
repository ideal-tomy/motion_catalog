import fs from 'node:fs';
const job='jobs/tournament-rock-20261112';
const qa=JSON.parse(fs.readFileSync(`${job}/qa/result.json`,'utf8'));
if(qa.format.frames!==660||qa.everyFrameQA.black.length||!qa.playback.ended||qa.errors.length)throw Error('QA has not passed');
const motions=JSON.parse(fs.readFileSync(`${job}/motion-registry.json`,'utf8'));
const catalog=JSON.parse(fs.readFileSync('src/catalog/registry.json','utf8'));
for(const motion of motions){
  motion.runtimeStatus='verified';motion.verificationPath=`${job}/qa/result.json`;
  const record=catalog.find(m=>m.id===motion.id);
  Object.assign(record,{runtimeStatus:'verified',implementationPath:motion.implementationPath,exportName:motion.exportName,selectionReason:motion.selectionReason,verificationPath:motion.verificationPath,previewPath:`${job}/output/preview/index.html`});
}
fs.writeFileSync(`${job}/motion-registry.json`,JSON.stringify(motions,null,2));
fs.writeFileSync('src/catalog/registry.json',JSON.stringify(catalog,null,2));
const bytes=fs.statSync(`${job}/output/promo_16x9.mp4`).size;
const music=JSON.parse(fs.readFileSync(`${job}/music-report.json`,'utf8'));
fs.writeFileSync(`${job}/render-report.md`,`# ROCK CUT / VOL.02 — 制作・検査報告

状態: **完成・検査済み**

## 出力

- MP4: output/promo_16x9.mp4（${bytes.toLocaleString('en-US')} bytes）
- HTML: output/preview/index.html、同階層のMP4・poster.png
- 共有用ZIP: output/tournament-rock-share.zip（展開後preview/index.htmlを開く）
- 編集: Remotion StudioのTournamentRock。src/RockPromo.tsx、src/motions/rock.tsx、composition.json
- 再生成: npm run music:rock → npm run render:rock → npm run qa:rock

## 構成

10カット。0〜18秒は2秒×9、18〜22秒は4秒のエンドカード。22秒 / 30fps / 660フレーム。
180 BPMのオリジナル・ロック調BGM。1拍10フレーム、6拍ごとに2秒カットを切り替え、切り替え位置に音声ヒット・文字アタック・衝撃リングを同期。
スラムズーム、斜め分割、短いグリッチ、ライトストリーク、スタンプ文字を使用。After Effects本体ではなく、Remotionによる時刻駆動の独自実装。
使用ID: ${motions.map(m=>m.id).join(', ')}。特定ブランドのロゴ・広告素材・既存曲は使用していない。

## 検査結果

| 項目 | 結果 |
|---|---|
| TypeScript | tsc --noEmit成功 |
| 動画 | ${qa.format.video} / ${qa.format.width}×${qa.format.height} / ${qa.format.fps} fps / ${qa.format.frames} frames |
| 音声 | ${qa.format.audio} / 48kHz / stereo |
| コンテナ尺 | ${qa.format.duration}秒（AACパディングを含む。映像は22秒） |
| 全編デコード | 成功 |
| 黒画面 | ${qa.everyFrameQA.checked}フレーム検査、0件 |
| 音声ピーク | ${qa.audioPeakDB.toFixed(2)} dBFS、クリッピングなし |
| 音声RMS | ${qa.audioRmsDB.toFixed(2)} dBFS |
| HTML全編再生 | ローカルfile://、非ミュート、ended=${qa.playback.ended}、エラーなし |
| HTML表示 | PC 1440×1000 / モバイル390×844、横はみ出しなし |
| 静止画 | 各カット1秒位置・冒頭・最終フレームを確認。日本語コピーと注記に意図しない欠けなし |

英語の大型文字と実画面は速度感を出すため意図的にクロップ。グリッチは各カット冒頭6フレーム以内、位置ずれ最大45px。白い全画面ストロボは使用しない。
音源生成時ピーク${music.peakDB.toFixed(2)} dBFS。第三者録音を使わず、弦モデル・波形・シード固定ノイズだけで作曲・合成。
検査証跡: qa/result.json、qa/ffprobe.json、qa/frame-*.png、qa/html-desktop.png、qa/html-mobile.png。

## 保護・制約

- 初版の20秒動画と成果物を保持。対象アプリ・本番DB・共有node_modules・公開設定は変更していない。
- 既存Animation Previewを撮影したサンプル演出。元の撮影証跡は../tournament-20261112/captures/evidence.json。
- 今回は画面の拡大・色調変更・クロップ・分割編集を施した。実際の本番結果や新しいUI機能を主張していない。
- 画像素材の商用利用・第三者配布権、本番操作・端末同期・会場音響は引き続き未確認。feature-audit.md参照。
- コミット・push・外部公開・有料契約は行っていない。
`);
console.log('Report and motion registry finalized.');
