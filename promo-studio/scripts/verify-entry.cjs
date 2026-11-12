const fs=require('node:fs');const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL,fileURLToPath}=require('node:url');
const {chromium}=require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');
const root=path.resolve(__dirname,'../..'),out=path.join(root,'docs/qa');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));await page.goto(pathToFileURL(path.join(root,'index.html')).href);
 const links=await page.locator('a').evaluateAll(els=>els.map(a=>({text:a.textContent,href:a.href})));
 for(const link of links)assert.ok(fs.existsSync(fileURLToPath(link.href)),`Missing ${link.href}`);
 await page.screenshot({path:path.join(out,'entry-desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(out,'entry-mobile.png'),fullPage:true});
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 await page.getByRole('link',{name:'60種類の動く見本を開く',exact:true}).click();
 assert.equal(await page.locator('.motioncard').count(),60);
 const videos=[];
 const listing=JSON.parse(fs.readFileSync(path.join(root,'動画ライブラリ/作品一覧.json'),'utf8'));
 const videoLinks=listing.map(e=>({text:e.subject+' / '+e.variant,href:pathToFileURL(path.join(root,'動画ライブラリ',e.folder,e.stem+'.html')).href}));
 for(const link of videoLinks){
  await page.goto(link.href);
  const meta=await page.locator('video').evaluate(async v=>{if(v.readyState<1)await new Promise((resolve,reject)=>{v.onloadedmetadata=resolve;v.onerror=reject});return {width:v.videoWidth,height:v.videoHeight,duration:v.duration}});
  assert.equal(meta.width,1920);assert.equal(meta.height,1080);assert.ok(meta.duration>19&&meta.duration<23);videos.push({name:link.text,...meta});
 }
 assert.equal(videos.length,listing.length);assert.deepEqual(errors,[]);
 const report={linksChecked:links.length,catalogNavigation:true,catalogCards:60,desktopAndMobile:true,mobileOverflow:false,videos,errors};
 fs.writeFileSync(path.join(out,'entry-audit.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
