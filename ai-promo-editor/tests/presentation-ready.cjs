const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');
(async()=>{const out='docs/qa/presentation',ready=JSON.parse(fs.readFileSync(out+'/ready-project.json')),browser=await chromium.launch({channel:'msedge',headless:true});try{
 const page=await browser.newPage({viewport:{width:1680,height:1100}}),errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(ready.url);await page.getByRole('button',{name:'編集モード',exact:true}).click();
 await page.getByLabel('レイヤー選択',{exact:true}).selectOption('sample-image-0');await page.locator('[data-layer="sample-image-0"] img').waitFor();await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.getByLabel('素材の表示スタイル',{exact:true}).inputValue(),'fullbleed');
 await page.getByTestId('edit-stage').screenshot({path:out+'/ready-fullbleed.png'});
 for(const [frame,scene,style]of [[155,1,'plain'],[305,2,'browser'],[455,3,'fullbleed']]){await page.getByLabel('再生位置',{exact:true}).fill(String(frame));await page.getByLabel('レイヤー選択',{exact:true}).selectOption('sample-image-'+scene);assert.equal(await page.getByLabel('素材の表示スタイル',{exact:true}).inputValue(),style);}
 await page.getByLabel('再生位置',{exact:true}).fill('0');await page.getByLabel('レイヤー選択',{exact:true}).selectOption('sample-image-0');await page.getByLabel('素材の表示スタイル',{exact:true}).scrollIntoViewIfNeeded();await page.screenshot({path:out+'/ready-editor.png',fullPage:true});
 assert.deepEqual(errors,[]);fs.writeFileSync(out+'/ready-smoke.json',JSON.stringify({projectId:ready.projectId,persisted:true,sceneStyles:['fullbleed','plain','browser','fullbleed'],errors},null,2));console.log('Ready editable sample passed: '+ready.url);
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
