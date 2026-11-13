const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');
(async()=>{
 const library=path.resolve('../動画ライブラリ'),entries=JSON.parse(fs.readFileSync(path.join(library,'作品一覧.json')));
 const job=process.argv[2]??'dd-signature-20261113';
 const e=entries.find(e=>e.job===job);assert.ok(e);
 const portable=fs.mkdtempSync(path.join(os.tmpdir(),'dd-signature-review-'));
 for(const suffix of ['.html','.mp4','_ポスター.png'])fs.copyFileSync(path.join(library,e.folder,e.stem+suffix),path.join(portable,e.stem+suffix));
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',err=>errors.push(err.message));
  await page.goto(pathToFileURL(path.join(library,'index.html')).href);
  await page.locator('#search').fill(e.variant);assert.equal(await page.locator('article:visible').count(),1);
  assert.ok((await page.locator('article:visible').innerText()).includes(e.variant));
  await page.goto(pathToFileURL(path.join(portable,e.stem+'.html')).href);
  await page.locator('video').evaluate(v=>{v.volume=.3;return v.play()});
  await page.waitForFunction(()=>document.querySelector('video').ended,{},{timeout:45000});
  const playback=await page.locator('video').evaluate(v=>({ended:v.ended,muted:v.muted,error:v.error?.message??null,width:v.videoWidth,height:v.videoHeight,duration:v.duration}));
  assert.equal(playback.ended,true);assert.equal(playback.muted,false);assert.equal(playback.error,null);assert.equal(playback.width,1920);assert.equal(playback.height,1080);
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
  const report={search:true,portable:true,portableReviewFolder:portable,playback,mobileOverflow:false,errors};fs.writeFileSync(path.join('jobs',job,'qa/delivery-check.json'),JSON.stringify(report,null,2));console.log(report);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

