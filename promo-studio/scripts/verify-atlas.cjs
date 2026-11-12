const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');
const root=path.resolve(__dirname,'..'),job=path.join(root,'jobs/atlas-reexport-tournament-20261113');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true});const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
 const ids=['M-009','M-017','M-060','M-054','M-014','M-016'];
 await page.goto(pathToFileURL(path.resolve(root,'../再出力_MOTION_ATLAS_60_AEE99382E38383%88/MOTION_ATLAS_60/index.html')).href);
 assert.equal(await page.locator('.motioncard').count(),60);
 for(const id of ids){await page.locator(`.motioncard[data-id="${id}"]`).click();assert.ok((await page.locator('#motionId').textContent()).includes(id));}
 await page.goto(pathToFileURL(path.join(job,'output/motions/index.html')).href);
 assert.equal(await page.locator('video').count(),6);
 const videos=await page.locator('video').evaluateAll(async els=>{const result=[];for(const el of els){if(el.readyState<1)await new Promise((resolve,reject)=>{el.onloadedmetadata=resolve;el.onerror=reject;});el.currentTime=.8;await new Promise((resolve,reject)=>{el.onseeked=resolve;el.onerror=reject;});await el.play();await new Promise(r=>setTimeout(r,120));el.pause();result.push({width:el.videoWidth,height:el.videoHeight,duration:el.duration,seek:el.currentTime,error:el.error?.message??null});}return result;});
 for(const v of videos){assert.equal(v.width,1920);assert.equal(v.height,1080);assert.ok(v.seek>=.8);assert.equal(v.error,null);}
 await page.screenshot({path:path.join(job,'qa/motions-desktop.png'),fullPage:true});await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.screenshot({path:path.join(job,'qa/motions-mobile.png'),fullPage:true});
 // The collected player must work directly from its final local folder.
 const {library,naming}=await import('./library.mjs'),meta=JSON.parse(fs.readFileSync(path.join(job,'delivery.json'))),request=JSON.parse(fs.readFileSync(path.join(job,'request.json'))),names=naming(meta,request);
 await page.goto(pathToFileURL(path.join(library,names.folder,names.stem+'.html')).href);await page.locator('video').evaluate(async el=>{el.muted=true;await el.play();});await page.waitForFunction(()=>document.querySelector('video').currentTime>.2);await page.locator('video').evaluate(el=>el.pause());assert.deepEqual(errors,[]);
 const report={originalCatalogCount:60,selectedIds:ids,singleVideoPreviews:videos,mobileNoOverflow:true,collectedHTMLPlayback:true,errors};fs.writeFileSync(path.join(job,'qa/browser-tests.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
