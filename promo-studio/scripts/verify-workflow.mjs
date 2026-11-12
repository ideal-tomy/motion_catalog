import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {pathToFileURL} from 'node:url';
import {studio,workspace,library,read,hash,naming,assertMediaQA,exportJob} from './library.mjs';
import {recommend} from './planner.mjs';
const require=createRequire(import.meta.url);
const {chromium}=require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');
const registry=read(path.join(studio,'src/catalog/registry.json'));
assert.equal(registry.length,60);assert.ok(registry.filter(m=>m.runtimeStatus==='verified').length>=16);
for(const m of registry){assert.ok(m.style);assert.ok(m.style.energy>=1&&m.style.energy<=5);assert.ok(m.style.minReadableFrames>=24);assert.ok(['provisional','reviewed'].includes(m.style.tagStatus));}
const presets=read(path.join(studio,'presets/styles.json')).presets;
const fake={...registry.find(m=>m.runtimeStatus==='verified'),id:'M-TEST',runtimeStatus:'demo-only'};
for(const p of presets){const r=recommend([...registry,fake],p,3);assert.ok(r.excluded.some(m=>m.id==='M-TEST'));assert.ok(r.available.every(m=>m.runtimeStatus==='verified'));if(!p.allowShake)assert.ok(r.available.every(m=>!m.style.shake));if(p.id==='healing')assert.ok(r.available.every(m=>m.style.energy<=2&&m.style.light==='low'));}
const entries=read(path.join(library,'作品一覧.json'));assert.ok(entries.length>=4);
const onlyJob=process.argv[2];
const playEntries=onlyJob?entries.filter(e=>e.job===onlyJob):entries;
assert.ok(playEntries.length,'Requested job not found');
let plans=0;
for(const e of entries){
 const job=path.join(studio,'jobs',e.job),req=read(path.join(job,'request.json')),qa=read(path.join(job,'qa/result.json'));
 const assets=read(path.join(job,'assets.json')).assets;
 for(const a of assets)assert.ok(fs.existsSync(path.join(studio,'public',a.path)));
 for(const p of presets){const plan=read(path.join(job,'planning',p.id+'.json'));let end=0;for(const s of plan.scenes){assert.equal(s.from,end);assert.ok(s.to>s.from);assert.ok(assets.some(a=>a.id===s.assetId));end=s.to;for(const id of s.motionIds)assert.equal(registry.find(m=>m.id===id)?.runtimeStatus,'verified');}assert.equal(end,p.durationSeconds);assert.ok(plan.selected.length>=3&&plan.selected.length<=6);plans++;}
 assert.equal(hash(path.join(library,e.folder,e.stem+'.mp4')),qa.mediaSHA256);
 assertMediaQA(qa,req,qa.mediaSHA256);
 assert.throws(()=>assertMediaQA(qa,req,'stale-hash'));
 assert.throws(()=>assertMediaQA({...qa,playback:{...qa.playback,ended:false}},req,qa.mediaSHA256));
 assert.throws(()=>assertMediaQA({...qa,everyFrameQA:{...qa.everyFrameQA,black:[5]}},req,qa.mediaSHA256));
 const meta=read(path.join(job,'delivery.json'));
 assert.throws(()=>naming({...meta,subject:'../outside'},req));
 assert.notEqual(naming({...meta,version:2},req).folder,naming(meta,req).folder);
}
assert.throws(()=>exportJob('../outside'));
const browser=await chromium.launch({headless:true,channel:'msedge'});
const out=path.join(workspace,'docs/qa'),errors=[],playback=[];
// Isolated flat folders prove copied deliveries have no dependency on original paths.
const portable=fs.mkdtempSync(path.join(os.tmpdir(),'motion-atlas-portable-'));
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.join(library,'index.html')).href);
 assert.equal(await page.locator('article').count(),entries.length);
 await page.locator('#search').fill('トーナメント 英語');assert.equal(await page.locator('article:visible').count(),1);
 await page.locator('#search').fill('');await page.screenshot({path:path.join(out,'library-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'library-mobile.png'),fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.goto(pathToFileURL(path.join(workspace,'制作プラン/index.html')).href);
 assert.equal(await page.locator('section:visible').count(),3);
 for(const p of presets){await page.locator('#preset').selectOption(p.id);assert.equal(await page.locator('section:visible').count(),1);assert.ok((await page.locator('section:visible').innerText()).includes(p.label));}
 await page.locator('#preset').selectOption('all');await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:path.join(out,'planner-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'planner-mobile.png'),fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 for(const [i,e]of playEntries.entries()){
  const dest=path.join(portable,String(i));fs.mkdirSync(dest);
  for(const suffix of ['.mp4','.html','_ポスター.png'])fs.copyFileSync(path.join(library,e.folder,e.stem+suffix),path.join(dest,e.stem+suffix));
  await page.goto(pathToFileURL(path.join(dest,e.stem+'.html')).href);
  const meta=await page.locator('video').evaluate(async v=>{if(v.readyState<1)await new Promise((r,j)=>{v.onloadedmetadata=r;v.onerror=j});return {width:v.videoWidth,height:v.videoHeight,duration:v.duration}});
  assert.equal(meta.width,e.width);assert.equal(meta.height,e.height);assert.ok(Math.abs(meta.duration-e.durationSeconds)<.1);
  await page.locator('video').evaluate(v=>{v.volume=.25;return v.play()});
  await page.waitForFunction(()=>document.querySelector('video').ended,{},{timeout:35000});
  assert.ok(await page.locator('video').evaluate(v=>v.ended&&!v.muted&&!v.error));
  playback.push({job:e.job,portable:true,ended:true,...meta});console.log(`Portable playback passed: ${e.subject} / ${e.variant}`);
 }
 assert.deepEqual(errors,[]);
 const report={taggedMotions:60,taggedTransitions:9,plans,verifiedOnly:true,negativeCases:true,deliveries:entries.length,search:true,presetSwitching:true,mobileOverflow:false,portableScope:onlyJob??'all',playback,errors};
 fs.writeFileSync(path.join(out,onlyJob?`workflow-${onlyJob}.json`:'workflow-result.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{
 await browser.close();
 // Only the exact temporary directory created by this test is removed.
 if(path.dirname(portable)!==os.tmpdir()||!path.basename(portable).startsWith('motion-atlas-portable-'))throw Error('Unsafe temporary path');
 fs.rmSync(portable,{recursive:true});
}
