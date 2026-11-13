const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');
const base='http://127.0.0.1:4319',out=path.resolve('docs/qa/presentation');fs.mkdirSync(out,{recursive:true});
async function api(url,method='GET',body){const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json','X-Promo-Local':'1'},...(body?{body:JSON.stringify(body)}:{})});const j=await r.json();if(!r.ok)throw Error(j.error);return j;}
(async()=>{
 const p=await api('/api/editable-sample','POST',{}),s=p.scenes[0],image=s.layers[0],title=s.layers[1];
 p.title='DD 枠なし・配色・レイヤー編集の確認';s.colorOverrides={background:'#112233',text:p.theme.palette.text};title.style.color=p.theme.palette.text;p.revision++;
 await api('/api/projects/'+p.projectId,'PUT',{project:p,baseRevision:1});
 const browser=await chromium.launch({channel:'msedge',headless:true});const report={projectId:p.projectId,styles:[],errors:[]};
 try{
 const page=await browser.newPage({viewport:{width:1680,height:1100}});require('./uiux-reveal.cjs')(page);page.on('pageerror',e=>report.errors.push(e.message));
 await page.goto(base+'/?project='+p.projectId);await page.getByRole('button',{name:'編集モード',exact:true}).click();
 await page.getByText('全体の配色',{exact:true}).click();await page.getByLabel('全体のbackground',{exact:true}).fill('#18483f');
 await page.waitForFunction(id=>getComputedStyle(document.querySelector(`[data-scene="${id}"]`)).backgroundColor==='rgb(24, 72, 63)',s.sceneId);
 await page.getByLabel('全体のtext',{exact:true}).fill('#ffeedd');
 await page.waitForFunction(id=>getComputedStyle(document.querySelector(`[data-layer-text="${id}"]`)).color==='rgb(255, 238, 221)',title.layerId);
 report.globalPaletteVisible=true;
 await page.getByLabel('レイヤー選択',{exact:true}).selectOption(image.layerId);
 for(const mode of ['fullbleed','plain','rounded','browser','ellipse','diagonal']){
  await page.getByLabel('素材の表示スタイル',{exact:true}).selectOption(mode);
  const layer=page.locator(`[data-layer-container="${image.layerId}"]`);
  await page.waitForTimeout(120);
  const state=await layer.evaluate(el=>({presentation:el.dataset.presentation,frame:el.dataset.mediaFrame,box:{left:el.style.left,top:el.style.top,width:el.style.width,height:el.style.height},clip:getComputedStyle(el.querySelector('[data-layer]')).clipPath,radius:getComputedStyle(el.querySelector('[data-layer]')).borderRadius,chrome:!!el.querySelector('[data-media-chrome]')}));
  if(mode==='fullbleed'){assert.equal(state.presentation,'background');assert.equal(state.frame,'none');assert.equal(state.clip,'none');assert.equal(state.radius,'0px');assert.equal(state.box.width,p.video.width+'px');assert.equal(state.box.height,p.video.height+'px');}
  if(mode==='browser')assert.equal(state.chrome,true);
  if(mode==='ellipse')assert.match(state.clip,/ellipse/);
  if(mode==='diagonal')assert.match(state.clip,/polygon/);
  const screenshot=await page.getByTestId('edit-stage').screenshot({path:path.join(out,mode+'.png')});
  if(mode==='fullbleed'){
   const white=await page.evaluate(async base64=>{const img=new Image();img.src='data:image/png;base64,'+base64;await img.decode();const c=document.createElement('canvas');c.width=160;c.height=90;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,160,90);const data=ctx.getImageData(0,0,160,90).data;let count=0;for(let k=0;k<data.length;k+=4)if(data[k]>180&&data[k+1]>180&&data[k+2]>180)count++;return count;},screenshot.toString('base64'));
   assert.ok(white>1000,'Full-screen actual image must be visible, not hidden behind the scene background');report.fullbleedActualPixels=true;
  }
  report.styles.push({mode,...state,pixelsSHA256:crypto.createHash('sha256').update(screenshot).digest('hex')});
 }
 assert.equal(new Set(report.styles.map(s=>s.pixelsSHA256)).size,6);
 await page.getByLabel('素材の拡大率',{exact:true}).fill('1.8');
 await page.waitForFunction(id=>getComputedStyle(document.querySelector(`[data-layer="${id}"] img`)).transform.startsWith('matrix(1.8'),image.layerId);report.sourceZoomVisible=true;
 // Place the same asset as background: reuse the original layer, no hidden duplicate.
 await page.getByRole('button',{name:'素材',exact:true}).click();
 await page.locator(`[data-asset-id="${image.assetId}"]`).getByRole('button',{name:'背景に設定',exact:true}).click();
 await page.getByRole('button',{name:'保存',exact:true}).click();await page.waitForSelector('header .saved');
 const saved=await api('/api/projects/'+p.projectId),ls=saved.scenes[0].layers;
 assert.equal(ls.length,s.layers.length);assert.equal(ls[0].layerId,image.layerId);assert.equal(ls[0].style.presentation,'background');assert.equal(ls[0].style.frame,'none');assert.equal(ls[0].transform.width,1);assert.equal(ls[0].style.mediaZoom,1.8);assert.equal(saved.scenes[0].colorOverrides.background,undefined);report.backgroundPlacementVisible=true;
 await page.reload();await page.getByRole('button',{name:'編集モード',exact:true}).click();
 assert.equal(await page.locator(`[data-layer-container="${image.layerId}"]`).getAttribute('data-presentation'),'background');
 // Scrubbing while editing synchronizes inspector and stage to the actual scene.
 const nextStart=s.durationFrames;await page.getByLabel('再生位置',{exact:true}).fill(String(nextStart+5));
 await page.waitForSelector(`[data-scene="${p.scenes[1].sceneId}"]`);assert.ok((await page.locator('.inspector h2').innerText()).includes('2 / 4'));report.scrubUpdatesScene=true;
 await page.getByRole('button',{name:'再生モード',exact:true}).click();await page.getByLabel('再生位置',{exact:true}).fill('5');
 await page.waitForFunction(id=>document.querySelector('[data-testid="preview"]').dataset.frame==='5'&&!!document.querySelector(`[data-scene="${id}"]`),s.sceneId);
 assert.ok((await page.locator('.inspector h2').innerText()).includes('1 / 4'));report.pausedScrubUpdatesScene=true;
 await page.getByRole('button',{name:'このコマを再生',exact:true}).click();await page.waitForFunction(()=>Number(document.querySelector('[data-testid="preview"]').dataset.frame)>15);await page.getByRole('button',{name:'停止',exact:true}).click();report.playback=true;
 await page.screenshot({path:path.join(out,'ready.png'),fullPage:true});assert.deepEqual(report.errors,[]);
 fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(report,null,2));console.log(report);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});


