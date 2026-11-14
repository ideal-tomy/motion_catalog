const fs=require('node:fs');
const path=require('node:path');
const job=path.resolve(__dirname,'..'),output=path.join(job,'output');
const preview=path.join(output,'preview');
fs.mkdirSync(preview,{recursive:true});
fs.copyFileSync(path.join(output,'promo_16x9.mp4'),path.join(preview,'promo_16x9.mp4'));
fs.copyFileSync(path.join(job,'qa','frame-1254.png'),path.join(preview,'poster.png'));
fs.writeFileSync(path.join(preview,'index.html'),`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>TOURNAMENT: LIVE MOMENTS — 50秒 仮制作</title><style>body{margin:0;background:#050a12;color:#edf3fa;font:16px/1.8 system-ui,"Yu Gothic",Meiryo,sans-serif}main{max-width:1280px;margin:auto;padding:clamp(20px,5vw,64px)}h1{font-size:clamp(27px,4vw,48px);line-height:1.25}p,small{color:#aab8ca}video{display:block;width:100%;aspect-ratio:16/9;background:#02050a;border:1px solid #3d536b}a{color:#9fd8ff}.badge{display:inline-block;border:1px solid #e7bd66;color:#ffdf95;padding:4px 12px;font-size:13px;font-weight:800;letter-spacing:3px}</style><main><span class="badge">仮制作 / SAMPLE PREVIEW</span><p>TOURNAMENT / LIVE MOMENTS</p><h1>演出が動く。大会が動き出す。</h1><video controls playsinline preload="metadata" poster="poster.png"><source src="promo_16x9.mp4" type="video/mp4">動画ファイルを直接開いて再生してください。</video><p>50秒 · 16カット · 15回のスピーディな切替 · 9種のトランジション · 1920×1080 · 30fps · オリジナル・シネマティックロック</p><p>Draw、Bracket、VS、Result、Championは対象アプリのfixture専用Animation Previewを収録したサンプル映像です。氏名・対戦・結果はサンプルで、本番操作や実際の大会結果ではありません。登録説明は機能説明コピーで、登録UIの実画面ではありません。</p><p><a href="promo_16x9.mp4" download>仮制作MP4をダウンロード</a></p><small>仮制作の確認用です。最終版の書き出しと動画ライブラリ登録は、内容の確認・承認後に行います。</small></main></html>`);
console.log(`Preview finalized: ${preview}`);
