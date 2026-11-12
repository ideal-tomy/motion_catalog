const {chromium}=require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const context=await browser.newContext({viewport:{width:1600,height:1000}});
 await context.route('**/*',route=>{const url=route.request().url();if(!url.startsWith('http://127.0.0.1:4212')&&!url.startsWith('data:'))return route.fulfill({status:200,contentType:'text/css',body:''});return route.continue();});
 const page=await context.newPage();page.on('pageerror',e=>console.log('ERROR',e.message));
 await page.goto('http://127.0.0.1:4212/ai');await page.waitForTimeout(1200);
 console.log((await page.locator('body').innerText()).slice(0,4000));
 await page.getByRole('tab',{name:'自社で入力',exact:true}).click();
 await page.getByLabel('会社名',{exact:true}).fill('プロモ検証（架空企業）');
 await page.getByLabel('売上（百万円）',{exact:true}).fill('2801');
 console.log('INPUTS',await page.locator('.dd-client-form input').evaluateAll(xs=>xs.map(x=>({type:x.type,value:x.value,min:x.min,step:x.step}))));
 await page.getByRole('button',{name:'対象企業として設定',exact:true}).click();
 console.log('AFTER', (await page.locator('body').innerText()).slice(0,3500));
 const panel=page.locator('.dd-live-panel');await panel.scrollIntoViewIfNeeded();
 fs.mkdirSync('jobs/dd-rock-20261112/captures',{recursive:true});
 await page.screenshot({path:'jobs/dd-rock-20261112/captures/inspect.png',fullPage:false});
 console.log('LIVE',await panel.innerText());
 console.log('bounds',await panel.boundingBox());
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
