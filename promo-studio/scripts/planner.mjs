import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {studio,workspace,read,escape,css} from './library.mjs';
const light={low:1,medium:2,high:3};
export function recommend(registry,style,phaseEnergy){
 const excluded=[],available=[];
 for(const m of registry){
  const t=m.style;let reason=null;
  if(m.runtimeStatus!=='verified'||m.sourceReviewRequired)reason='未検証・未実装、または仕様変更の再レビューが必要';
  else if(!t)reason='タグ未登録';
  else if(!style.allowShake&&t.shake)reason='揺れを避ける指定';
  else if(light[t.light]>light[style.maxLight])reason='光量の上限を超える';
  else if(style.mood==='healing'&&(t.energy>2||t.shake||t.light!=='low'))reason='癒しの低刺激条件に合わない';
  else if(style.id==='calm'&&t.energy>3)reason='落ち着いた印象に対して動きが強い';
  if(reason)excluded.push({id:m.id,name:m.name,reason,runtimeStatus:m.runtimeStatus});
  else available.push({...m,score:10-Math.abs(t.energy-phaseEnergy)*2+(t.mood.includes(style.mood)?4:0)});
 }
 return {available:available.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id)),excluded};
}
export function makePlan(job,preset){
 const registry=read(path.join(studio,'src/catalog/registry.json')),manifest=read(path.join(studio,'jobs',job,'assets.json'));
 const roles=['hook','before','operation','result','cta'];let from=0;const selected=new Map();
 const scenes=roles.map((role,i)=>{
  const rec=recommend(registry,preset,preset.energyCurve[i]);
  const lookup=role==='hook'||role==='cta'?role:role==='before'?'focus':role;
  const m=rec.available.find(m=>m.style.role.includes(lookup)&&!selected.has(m.id))??rec.available.find(m=>m.style.role.includes(lookup))??rec.available[0];
  if(!m)throw Error(`No verified motions for ${preset.id}`);selected.set(m.id,m);
  const asset=role==='result'||role==='cta'?manifest.assets.find(a=>a.phase==='result'):role==='operation'?manifest.assets.find(a=>a.phase==='operation'):manifest.assets[0];
  const to=from+preset.durations[i];const scene={from,to,role,assetId:asset.id,feature:asset.feature,motionIds:[m.id],energy:preset.energyCurve[i],holdFrames:Math.max(m.style.minReadableFrames,role==='operation'?60:30),footagePolicy:asset.kind==='still'?'hold-still':to-from>asset.availableSeconds?'play-then-hold-last-frame':'play',reason:`${m.name}：${role}、強さ${preset.energyCurve[i]}に対しタグenergy=${m.style.energy}。${m.style.mood.join('/')}、${m.style.pace}。`};from=to;return scene;
 });
 // A third independent role helps avoid a generic two-effect plan.
 const extra=recommend(registry,preset,2).available.find(m=>!selected.has(m.id)&&m.style.role.includes('operation'));
 if(selected.size<3&&extra){selected.set(extra.id,extra);scenes[2].motionIds.push(extra.id);}
 return {version:1,job,preset:preset.id,label:preset.label,status:'proposed-not-rendered',durationSeconds:from,fps:30,width:1920,height:1080,sceneEnergyCurve:preset.energyCurve,musicDirection:preset.music,paletteDirection:preset.palette,selected:[...selected.values()].map(m=>({id:m.id,name:m.name,runtimeStatus:m.runtimeStatus,tagStatus:m.style.tagStatus,reason:`${m.style.motionType} / ${m.style.mood.join('/')} / energy ${m.style.energy}`})),excluded:recommend(registry,preset,3).excluded,scenes,warnings:['タグは初期分類。映像の印象は人によるレビューが必要','このデータは構成候補であり既存Compositionの書き出し入力ではない。新しい動画は未生成','音源・色・動きの調整は候補の方針。既存の音源を自動で別ジャンルに変換しない','縦型の切り出しは未レビュー。今回は16:9','実画面にある機能・サンプル以外の実績や効果を追加しない']};
}
export function buildPlans(){
 const presets=read(path.join(studio,'presets/styles.json')).presets;
 const jobs=fs.readdirSync(path.join(studio,'jobs')).filter(j=>fs.existsSync(path.join(studio,'jobs',j,'assets.json')));
 const all=[];
 for(const job of jobs)for(const preset of presets){const plan=makePlan(job,preset);const dir=path.join(studio,'jobs',job,'planning');fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,`${preset.id}.json`),JSON.stringify(plan,null,2));all.push(plan);}
 const out=path.join(workspace,'制作プラン');fs.mkdirSync(out,{recursive:true});
 const sections=all.map(p=>`<section data-job="${escape(p.job)}" data-preset="${p.preset}"><h2>${escape(p.label)} / ${p.durationSeconds}秒</h2><p>${escape(p.job)}</p><p>${escape(p.musicDirection)}<br>${escape(p.paletteDirection)}</p><p>強弱：${p.sceneEnergyCurve.join(' → ')}</p><h3>構成</h3><ol>${p.scenes.map(s=>`<li>${s.from}〜${s.to}秒 / ${escape(s.feature)} / ${s.motionIds.join(', ')}<br><small>${escape(s.reason)} ${s.footagePolicy==='play-then-hold-last-frame'?'撮影した動作の後は末尾を保持。':''}</small></li>`).join('')}</ol><h3>採用した演出（${p.selected.length}種類）</h3><ul>${p.selected.map(m=>`<li>${m.id} ${escape(m.name)} — ${escape(m.reason)} <small>タグ仮登録 / 動画検証済み部品</small></li>`).join('')}</ul><details><summary>除外した演出と理由（${p.excluded.length}件）</summary><ul>${p.excluded.map(m=>`<li>${m.id} ${escape(m.name)}：${escape(m.reason)}</li>`).join('')}</ul></details><p><a href="../promo-studio/jobs/${p.job}/planning/${p.preset}.json" download>構成JSONを保存</a></p></section>`).join('');
 fs.writeFileSync(path.join(out,'index.html'),`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>映像の印象から構成を選ぶ</title><style>${css}</style><main><p>MOTION ATLAS / 構成候補</p><h1>同じ素材を、違う印象で。</h1><p>検証済みの部品から選び、操作と結果を見せる時間を確保します。以下は構成案です。新しい完成動画ではありません。タグは仮登録で、印象のレビューが必要です。</p><label>素材 <select id="job">${jobs.map(j=>`<option value="${j}">${escape(j)}</option>`).join('')}</select></label><label>印象 <select id="preset"><option value="all">3案を比較</option>${presets.map(p=>`<option value="${p.id}">${p.label}</option>`).join('')}</select></label>${sections}<p><a href="../動画ライブラリ/index.html">完成動画ライブラリ</a> / <a href="../index.html">ワークスペースへ</a></p></main><script>function update(){const j=document.querySelector('#job').value,p=document.querySelector('#preset').value;document.querySelectorAll('section').forEach(s=>s.hidden=s.dataset.job!==j||(p==='all'?s.dataset.preset==='healing':s.dataset.preset!==p))}document.querySelector('#job').onchange=update;document.querySelector('#preset').onchange=update;update();</script></html>`);
 console.log(`${all.length} plans generated for ${jobs.length} jobs`);return all;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))buildPlans();
