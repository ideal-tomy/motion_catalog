const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');
const job='jobs/dd-rock-20261112',assets='public/captures/dd';
(async()=>{
 fs.mkdirSync(`${job}/captures`,{recursive:true});fs.mkdirSync(`${assets}/scan`,{recursive:true});
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const errors=[],failed=[],writes=[],blocked=[],csvReads=[];
 try{
 const context=await browser.newContext({viewport:{width:1600,height:1000},deviceScaleFactor:1.5});
 await context.route('**/*',route=>{
   const req=route.request(),url=req.url();
   if(!url.startsWith('http://127.0.0.1:4212')&&!url.startsWith('data:')){blocked.push(url.split('?')[0]);return route.fulfill({status:200,contentType:'text/css',body:''});}
   if(!['GET','HEAD'].includes(req.method())){writes.push(req.method());return route.abort();}
   if(url.includes('/live-samples/'))csvReads.push(url);
   return route.continue();
 });
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
 await page.goto('http://127.0.0.1:4212/ai');await page.getByRole('heading',{name:'DD → バリューアップ → EXIT',exact:true}).waitFor();
 await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:`${assets}/overview.jpg`,type:'jpeg',quality:95});
 await page.getByRole('tab',{name:'自社で入力',exact:true}).click();
 await page.getByLabel('会社名',{exact:true}).fill('プロモ検証（架空企業）');
 // The app's min=1 / step=10 requires 1+10n; use a valid fictional value.
 await page.getByLabel('売上（百万円）',{exact:true}).fill('2801');
 await page.getByRole('button',{name:'対象企業として設定',exact:true}).click();
 const panel=page.locator('.dd-live-panel');await panel.waitFor();
 await page.addStyleTag({content:'body{padding-bottom:1400px!important}html{scroll-behavior:auto!important}'});
 await panel.evaluate(el=>window.scrollTo(0,window.scrollY+el.getBoundingClientRect().top-90));
 const crop={x:430,y:65,width:1100,height:850};
 await page.screenshot({path:`${assets}/input.jpg`,clip:crop,type:'jpeg',quality:95});
 await page.clock.install();
 await page.getByRole('button',{name:'サンプル資料を投入',exact:true}).click();
 for(let i=0;i<120;i++){
   await page.clock.runFor(1000/30);
   await page.screenshot({path:`${assets}/scan/${String(i).padStart(4,'0')}.jpg`,clip:crop,type:'jpeg',quality:92});
 }
 await page.locator('.dd-live-result').waitFor();
 const resultText=await panel.innerText();assert.match(resultText,/乖離/);assert.ok(csvReads.some(x=>x.endsWith('/payroll.csv')));assert.ok(csvReads.some(x=>x.endsWith('/attendance.csv')));
 await page.screenshot({path:`${assets}/result.jpg`,clip:crop,type:'jpeg',quality:95});
 await panel.getByRole('button',{name:'根拠を見る',exact:true}).first().click();
 await page.getByRole('dialog').waitFor();
 const evidenceText=await page.getByRole('dialog').innerText();assert.match(evidenceText,/給与台帳.*行目/);assert.match(evidenceText,/支給計上残業/);
 await page.screenshot({path:`${assets}/evidence.jpg`,type:'jpeg',quality:95});
 await page.locator('.dd-evidence-modal__panel').screenshot({path:`${assets}/evidence-card.jpg`,type:'jpeg',quality:96});
 await page.getByRole('button',{name:'発見に戻る',exact:true}).click();
 assert.equal(await page.getByRole('dialog').count(),0);
 fs.writeFileSync(`${job}/captures/evidence.json`,JSON.stringify({source:'dd_demo/src',route:'http://127.0.0.1:4212/ai',viewport:{width:1600,height:1000,deviceScaleFactor:1.5},framing:'bottom padding for framing only; no source changes',clip:crop,frames:120,fps:30,actions:['open /ai','自社で入力','set fictional company with valid dummy revenue','対象企業として設定','サンプル資料を投入','根拠を見る','発見に戻る'],resultText,evidenceText,csvReads,errors,failed,writes,blockedExternalResources:[...new Set(blocked)],liveAIRequests:0},null,2));
 assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);assert.deepEqual(writes,[]);
 console.log(JSON.stringify({resultText,evidenceText,frames:120,errors,failed,writes,csvReads}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
