import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
export const studio=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const workspace=path.dirname(studio);
export const library=path.join(workspace,'動画ライブラリ');
export const read=p=>JSON.parse(fs.readFileSync(p,'utf8').replace(/^\uFEFF/,''));
export const hash=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const css=`body{margin:0;background:#0b111a;color:#edf3f8;font:16px/1.7 system-ui,sans-serif}main{max-width:1120px;margin:auto;padding:36px 24px}h1{font-size:clamp(28px,4vw,44px);line-height:1.25}h2{font-size:23px}p,small{color:#b5c4d2}a{color:#9be8e5}button,select,input{font:inherit;padding:10px;border:1px solid #526477;border-radius:6px;background:#192634;color:#f5f7fa;max-width:100%}button{cursor:pointer}button:focus-visible,a:focus-visible{outline:3px solid #d6ff35}section,.card{border:1px solid #334557;border-radius:12px;padding:22px;margin:20px 0;background:#101c29}video,img{width:100%;display:block;aspect-ratio:16/9;object-fit:cover;border-radius:7px}ul{padding-left:23px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:20px}.tag{display:inline-block;font-size:13px;color:#d6ff35;margin-right:12px}label{display:inline-block;margin:8px 20px 8px 0}code{overflow-wrap:anywhere}a,li{overflow-wrap:anywhere}[hidden]{display:none!important}`;
export function naming(meta,request){
 for(const key of ['subject','tone','language','variant'])if(typeof meta[key]!=='string'||!meta[key]||/[<>:"/\\|?*\x00-\x1f]/.test(meta[key])||meta[key].length>24)throw Error(`Invalid delivery ${key}`);
 if(!/^\d{8}$/.test(meta.date)||!Number.isInteger(meta.version)||meta.version<1)throw Error('Invalid date/version');
 if(!Number.isFinite(request.durationSeconds)||request.durationSeconds<=0)throw Error('Invalid duration');
 const aspect=request.width>request.height?'横型':request.width<request.height?'縦型':'正方形';
 const stem=`${meta.subject}_${meta.tone}${request.durationSeconds}秒_${meta.language}_${aspect}_${meta.variant}_${meta.date}_v${String(meta.version).padStart(2,'0')}`;
 if(stem.length>110)throw Error('Delivery name too long');
 return {stem,folder:`動画フォルダ_${stem}`};
}
export function assertMediaQA(qa,request,sha){
 if(qa.mediaSHA256!==sha||!qa.fullDecode||qa.playback?.ended!==true||qa.playback?.muted!==false||qa.playback?.error||!Array.isArray(qa.errors)||qa.errors.length||!Array.isArray(qa.everyFrameQA?.black)||qa.everyFrameQA.black.length||qa.everyFrameQA.checked!==request.durationSeconds*request.fps||qa.format?.frames!==request.durationSeconds*request.fps||qa.format?.width!==request.width||qa.format?.height!==request.height)throw Error('Current video must pass QA before collection');
}
export function refreshIndex(){
 fs.mkdirSync(library,{recursive:true});
 const items=fs.readdirSync(library,{withFileTypes:true}).filter(e=>e.isDirectory()&&fs.existsSync(path.join(library,e.name,'作品情報.json'))).map(e=>({...read(path.join(library,e.name,'作品情報.json')),folder:e.name})).sort((a,b)=>b.date.localeCompare(a.date)||a.stem.localeCompare(b.stem,'ja'));
 const cards=items.map(i=>{const base=encodeURIComponent(i.folder)+'/';return `<article class="card" data-search="${escape([i.subject,i.tone,i.language,i.variant,i.durationSeconds].join(' '))}"><a href="${base}${encodeURIComponent(i.stem+'.html')}"><img loading="lazy" src="${base}${encodeURIComponent(i.stem+'_ポスター.png')}" alt="${escape(i.subject+' '+i.variant)}"></a><h2>${escape(i.subject)} / ${escape(i.tone)} ${i.durationSeconds}秒</h2><span class="tag">${escape(i.language)}</span><span class="tag">${escape(i.variant)}</span><p>${escape(i.description)}</p><p><a href="${base}${encodeURIComponent(i.stem+'.html')}">HTMLで再生</a>　<a href="${base}${encodeURIComponent(i.stem+'.mp4')}" download>MP4</a></p><small>${i.date} / v${String(i.version).padStart(2,'0')} / ${i.width}×${i.height}</small></article>`}).join('');
 fs.writeFileSync(path.join(library,'index.html'),`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>完成動画ライブラリ</title><style>${css}</style><main><p>MOTION ATLAS / 完成動画</p><h1>見たい動画へ、すぐに。</h1><p>対象・雰囲気・尺・言語・演出名で探せます。作品フォルダを丸ごとコピーして共有できます。</p><label>動画を検索 <input id="search" type="search" placeholder="例：トーナメント 英語"></label><p id="count">${items.length}作品</p><div class="grid">${cards}</div><p><a href="../index.html">ワークスペースへ</a></p></main><script>document.querySelector('#search').oninput=e=>{const terms=e.target.value.toLowerCase().trim().split(/\\s+/);let n=0;document.querySelectorAll('article').forEach(c=>{c.hidden=!terms.every(t=>c.dataset.search.toLowerCase().includes(t));if(!c.hidden)n++});document.querySelector('#count').textContent=n+'作品'};</script></html>`);
 fs.writeFileSync(path.join(library,'作品一覧.json'),JSON.stringify(items,null,2));return items;
}
export function exportJob(jobPath){
 const job=path.resolve(studio,jobPath),jobsRoot=path.join(studio,'jobs');
 if(path.dirname(job)!==jobsRoot)throw Error('Job must be directly under jobs/');
 const meta=read(path.join(job,'delivery.json')),request=read(path.join(job,'request.json')),qa=read(path.join(job,'qa/result.json'));
 const video=path.join(job,'output/promo_16x9.mp4'),sha=hash(video),{stem,folder}=naming(meta,request);
 assertMediaQA(qa,request,sha);
 const dest=path.join(library,folder),infoPath=path.join(dest,'作品情報.json');
 if(fs.existsSync(dest)){
  if(!fs.existsSync(infoPath))throw Error('Folder already exists without manifest');
  const old=read(infoPath);if(old.sha256!==sha||old.job!==path.basename(job)||old.previewSHA256!==hash(path.join(job,'output/preview/index.html')))throw Error('Existing version differs. Increase delivery.version; previous output is protected.');
 }
 fs.mkdirSync(dest,{recursive:true});
 const info={...meta,stem,job:path.basename(job),durationSeconds:request.durationSeconds,width:request.width,height:request.height,fps:request.fps,sha256:sha,previewSHA256:hash(path.join(job,'output/preview/index.html')),sourceJob:`promo-studio/jobs/${path.basename(job)}`};
 const namedVideo=path.join(dest,stem+'.mp4');
 if(!fs.existsSync(namedVideo)||hash(namedVideo)!==sha)fs.copyFileSync(video,namedVideo);
 fs.copyFileSync(path.join(job,'output/preview/poster.png'),path.join(dest,stem+'_ポスター.png'));
 const original=fs.readFileSync(path.join(job,'output/preview/index.html'),'utf8');
 fs.writeFileSync(path.join(dest,stem+'.html'),original.replaceAll('promo_16x9.mp4',encodeURIComponent(stem+'.mp4')).replaceAll('poster.png',encodeURIComponent(stem+'_ポスター.png')));
 fs.writeFileSync(infoPath,JSON.stringify(info,null,2));
 fs.copyFileSync(path.join(job,'qa/result.json'),path.join(dest,'検査結果.json'));
 fs.writeFileSync(path.join(dest,'この動画について.txt'),`${meta.subject} / ${meta.tone} / ${request.durationSeconds}秒 / ${meta.language}\n${meta.description}\n\n再生：${stem}.html または ${stem}.mp4\n共有：このフォルダを丸ごとコピーしてください。\n編集データ：${info.sourceJob}\n検査済み動画SHA-256：${sha}\n`);
 refreshIndex();console.log(`Collected: ${folder}`);return dest;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const arg=process.argv[2];if(arg==='--all'){for(const e of fs.readdirSync(path.join(studio,'jobs')))if(fs.existsSync(path.join(studio,'jobs',e,'delivery.json')))exportJob(path.join('jobs',e));}
 else if(arg)exportJob(arg);else refreshIndex();
}
