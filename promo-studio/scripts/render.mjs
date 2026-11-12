import fs from 'node:fs';
import path from 'node:path';
import {bundle} from '@remotion/bundler';
import {selectComposition,renderMedia,renderStill,openBrowser} from '@remotion/renderer';
import {naming,escape,css} from './library.mjs';

const job=path.resolve(process.argv[2]??'jobs/tournament-20261112');
const request=JSON.parse(fs.readFileSync(path.join(job,'request.json'),'utf8'));
const deliveryPath=path.join(job,'delivery.json');
if(!fs.existsSync(deliveryPath))throw Error('Create delivery.json with subject/tone/language/variant/date/version before rendering. See docs/動画の保存ルール.md');
naming(JSON.parse(fs.readFileSync(deliveryPath,'utf8')),request);
const plan=JSON.parse(fs.readFileSync(path.join(job,'composition.json'),'utf8'));
if(![20,22].includes(request.durationSeconds)||request.fps!==30||request.width!==1920||request.height!==1080)throw Error('This MVP supports 20/22s / 1920x1080 / 30fps');
const isAtlas=plan.compositionId==='AtlasTournament';
if(isAtlas){let end=0;const supported=new Set(['M-009','M-017','M-060','M-054','M-014','M-016']);for(const s of plan.scenes){if(!supported.has(s.id)||!Number.isInteger(s.startFrame)||!Number.isInteger(s.endFrame)||s.startFrame!==end||s.endFrame<=s.startFrame||s.from*30!==s.startFrame||s.to*30!==s.endFrame||!Number.isFinite(s.speed)||s.speed<=0||!['linear','easeOut'].includes(s.easing)||!Number.isInteger(s.audioCue)||s.audioCue<0||s.audioCue>=s.endFrame-s.startFrame||typeof s.text!=='string')throw Error('Invalid Atlas scene');end=s.endFrame;}if(end!==600)throw Error('Atlas sample requires 600 frames');}
const isEnglish=plan.compositionId==='TournamentRockEnglish';
const isPremium=plan.compositionId==='DdPremium';
if(isPremium){let end=0;for(const scene of plan.scenes){if(scene.from!==end||scene.to<=scene.from)throw Error('Invalid premium scene timing');end=scene.to;}if(end!==20)throw Error('Premium cut requires 20 seconds');}
const isRock=['TournamentRock','DdRock','TournamentRockEnglish'].includes(plan.compositionId);
if(isRock){if(plan.scenes.length!==10||plan.durationSeconds!==22)throw Error('Rock cut requires 10 scenes / 22 seconds');let end=0;for(const [i,scene] of plan.scenes.entries()){if(scene.from!==end||scene.to-scene.from!==(i===9?4:2))throw Error('Invalid cut timing');end=scene.to;}if(end!==22)throw Error('Invalid total duration');}
const out=path.join(job,'output');fs.mkdirSync(path.join(out,'preview'),{recursive:true});fs.mkdirSync(path.join(job,'qa'),{recursive:true});
const browserExecutable='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';
const serveUrl=await bundle({entryPoint:path.resolve('src/index.tsx'),publicDir:path.resolve('public'),outDir:path.resolve('build')});
const inputProps={plan};
const browser=await openBrowser('chrome',{browserExecutable});
const composition=await selectComposition({serveUrl,id:plan.compositionId??'TournamentPromo',inputProps,browserExecutable,puppeteerInstance:browser});
const baseFrames=isAtlas?[0,45,120,192,210,330,420,540,599]:isPremium?[0,30,75,105,150,205,225,285,315,330,375,420,450,480,540,599]:isRock?[0,...plan.scenes.map(s=>s.from*30+30),659]:[0,45,165,255,345,465,570,599];
const previewFrames=isEnglish?[...new Set([...baseFrames,...plan.transitions.flatMap(t=>[t.atFrame-5,t.atFrame,t.atFrame+5])])].sort((a,b)=>a-b):baseFrames;
const frames=process.argv.includes('--skip-stills')?[]:previewFrames;
for(let i=0;i<frames.length;i+=3){
  await Promise.all(frames.slice(i,i+3).map(frame=>renderStill({serveUrl,composition,inputProps,frame,browserExecutable,puppeteerInstance:browser,output:path.join(job,`qa/frame-${String(frame).padStart(3,'0')}.png`)})));
}
if(process.argv.includes('--stills-only')){await browser.close({silent:true});console.log('Review stills ready');process.exit(0);}
let last=-1;
await renderMedia({serveUrl,composition,inputProps,browserExecutable,puppeteerInstance:browser,codec:'h264',audioCodec:'aac',pixelFormat:'yuv420p',crf:18,concurrency:3,outputLocation:path.join(out,'promo_16x9.mp4'),onProgress:({progress})=>{const p=Math.floor(progress*10);if(p!==last){console.log(`Render ${p*10}%`);last=p;}}});
await browser.close({silent:true});
fs.copyFileSync(path.join(out,'promo_16x9.mp4'),path.join(out,'preview/promo_16x9.mp4'));
fs.copyFileSync(path.join(job,isPremium?'qa/frame-540.png':isRock?'qa/frame-570.png':'qa/frame-045.png'),path.join(out,'preview/poster.png'));
fs.writeFileSync(path.join(out,'preview/index.html'),`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DARTS TOURNAMENT — Promo</title><style>body{margin:0;background:#070d17;color:#e9f1f4;font-family:system-ui,sans-serif}main{max-width:1200px;margin:auto;padding:40px 24px}p{color:#9fb0bd;line-height:1.8}video{width:100%;aspect-ratio:16/9;background:#070d17;border:1px solid #29404d;border-radius:12px}a{color:#8af0ed}h1{font-size:clamp(24px,4vw,40px)}small{color:#94a5b2}</style><main><p>DARTS TOURNAMENT / MOTION ATLAS</p><h1>大会の瞬間を、見せ場に。</h1><video controls playsinline preload="metadata" poster="poster.png"><source src="promo_16x9.mp4" type="video/mp4">動画を再生できません。MP4を直接開いてください。</video><p>20秒 · 1920×1080 · 30fps · オリジナルBGM</p><p><a href="promo_16x9.mp4" download>MP4をダウンロード</a></p><small>指定アプリの既存Animation Previewを撮影しています。サンプル演出であり、実際の大会結果・本番操作の記録ではありません。</small></main></html>`);
console.log(`Output: ${out}`);
if(isRock){const htmlPath=path.join(out,'preview/index.html');let html=fs.readFileSync(htmlPath,'utf8');html=html.replaceAll('大会の瞬間を、見せ場に。','次の大会を、もっと熱く。').replace('20秒 ·','22秒 · 10カット · 180 BPM ·').replace('オリジナルBGM','オリジナル・ロック調BGM');fs.writeFileSync(htmlPath,html);}
if(plan.compositionId==='DdRock'){const p=path.join(out,'preview/index.html');let html=fs.readFileSync(p,'utf8');html=html.replaceAll('DARTS TOURNAMENT','AXEON DD INTELLIGENCE').replaceAll('次の大会を、もっと熱く。','見抜く。その先を、決める。').replace('指定アプリの既存Animation Previewを撮影しています。サンプル演出であり、実際の大会結果・本番操作の記録ではありません。','DDデモの実画面を撮影しています。同梱の架空CSVによる給与×勤怠の突合と根拠確認のデモです。推計は例示であり、最終判断は人が行います。');fs.writeFileSync(p,html);}
if(isEnglish){fs.writeFileSync(path.join(out,'preview/index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DARTS TOURNAMENT — English Transition Edition</title><style>body{margin:0;background:#0b0d0b;color:#f4f3ea;font-family:Arial,sans-serif}main{max-width:1200px;margin:auto;padding:40px 24px}h1{font-size:clamp(25px,4vw,42px)}p,small{line-height:1.7;color:#b8c3b8}video{width:100%;aspect-ratio:16/9;background:#0b0d0b;border:1px solid #44522c;border-radius:10px}a{color:#d6ff35}</style><main><p>DARTS TOURNAMENT / ENGLISH TRANSITION EDITION</p><h1>Bring more heat to your next tournament.</h1><video controls playsinline preload="metadata" poster="poster.png"><source src="promo_16x9.mp4" type="video/mp4">Open the MP4 directly if your browser cannot play this video.</video><p>22 seconds · 10 scenes · 9 unique transitions · 180 BPM · Full HD</p><p><a href="promo_16x9.mp4" download>Download MP4</a></p><small>Captured from the existing application preview. Display text has been localized into English for this video. All names and results are samples, not actual tournament results.</small></main></html>`);}
if(isPremium){fs.writeFileSync(path.join(out,'preview/index.html'),`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DD — 高級感・信頼感 / 20秒</title><style>${css}</style><main><p>AXEON / DD INTELLIGENCE</p><h1>根拠から、次の判断へ。</h1><video controls playsinline preload="metadata" poster="poster.png"><source src="promo_16x9.mp4" type="video/mp4">MP4を直接開いて再生してください。</video><p>20秒 · 1920×1080 · 30fps · オリジナルのピアノ風BGM</p><p><a href="promo_16x9.mp4" download>MP4をダウンロード</a></p><small>DDデモの実画面キャプチャを使用。${escape(plan.disclaimer)}。数値・氏名はサンプルであり、実案件の結果ではありません。</small></main></html>`);}

if(isAtlas){fs.writeFileSync(path.join(out,'preview/index.html'),`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ATLAS 6種 / Tournament opening</title><style>${css}</style><main><p>MOTION ATLAS / 6 MOTIONS</p><h1>ダーツ大会オープニング — 20秒</h1><video controls playsinline preload="metadata" poster="poster.png" src="promo_16x9.mp4"></video><p>M-009 → M-017 → M-060 → M-054 → M-014 → M-016</p><p>1920×1080 / 30fps / オリジナルBGM・SE</p><p><a href="promo_16x9.mp4" download>MP4を保存</a></p><small>演出用に再構築した架空の大会・対戦例です。実画面や実際の大会結果ではありません。</small></main></html>`);}
