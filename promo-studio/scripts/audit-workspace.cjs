const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');
const root=path.resolve(__dirname,'../..');
const ref=path.join(root,'MOTION_ATLAS_60_AEE99382E38383%88/MOTION_ATLAS_60');
const out=path.join(root,'docs/qa');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const data=JSON.parse(fs.readFileSync(path.join(ref,'motions.json'),'utf8'));
 const registry=JSON.parse(fs.readFileSync(path.join(root,'promo-studio/src/catalog/registry.json'),'utf8'));
 const browser=await chromium.launch({headless:true,channel:'msedge'});
 const errors=[];const page=await browser.newPage({viewport:{width:1440,height:1000}});
 page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto(pathToFileURL(path.join(ref,'index.html')).href);
  const initial=await page.evaluate(()=>({title:document.title,cards:document.querySelectorAll('.motioncard').length,ids:MOTIONS.map(m=>m.id),fields:Object.keys(MOTIONS[0]),buttons:[...document.querySelectorAll('button')].map(b=>b.textContent.trim()).slice(0,22)}));
  const samples=[];
  for(const id of initial.ids){
   await page.locator(`.motioncard[data-id="${id}"]`).click();
   await page.locator('#scrub').evaluate(el=>{el.value='1';el.dispatchEvent(new Event('input',{bubbles:true}));});
   const s=await page.evaluate(()=>({id:document.querySelector('#motionId').textContent,title:document.querySelector('#motionTitle').textContent,prompt:document.querySelector('#promptBox').textContent.length,pixels:document.querySelector('#stage').getContext('2d').getImageData(640,360,1,1).data.slice(0,3).join(',')}));
   if(s.id!==id||!s.prompt)throw Error(`Broken motion ${id}`);samples.push(s);
  }
  await page.locator('.motioncard[data-id="M-060"]').click();
  await page.screenshot({path:path.join(out,'catalog-desktop.png'),fullPage:true});
  const search=page.locator('input[type="search"], input[placeholder*="検索"]');
  let searchResult=null;
  if(await search.count()){await search.first().fill('M-032');searchResult=await page.locator('.motioncard').count();await search.first().fill('');}
  await page.locator('#addBtn').click();
  const added=await page.evaluate(()=>document.body.innerText.includes('M-060'));
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:path.join(out,'catalog-mobile.png'),fullPage:true});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  const report={referenceVersion:data.version,motions:data.motions.length,fields:Object.keys(data.motions[0]),registryStatus:registry.reduce((a,m)=>(a[m.runtimeStatus]=(a[m.runtimeStatus]??0)+1,a),{}),registryMismatch:data.motions.filter(m=>{const r=registry.find(r=>r.id===m.id);return !r||r.name!==m.name||r.prompt!==m.prompt;}).map(m=>m.id),initial,samples,searchResult,added,mobileOverflow:overflow,errors};
  fs.writeFileSync(path.join(out,'catalog-audit.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify({...report,samples:`${samples.length} motions checked`,initial:{...initial,ids:initial.ids.length}}));
  if(errors.length||initial.cards!==60||searchResult!==1||overflow)process.exitCode=1;
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
