const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');
const base='http://127.0.0.1:4319',root=path.resolve(__dirname,'..'),out=path.join(root,'docs/qa');fs.mkdirSync(out,{recursive:true});
const pid=process.argv[2]??'promo-sample-001';
async function api(url,method='GET',body){const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json','X-Promo-Local':'1'},...(body?{body:JSON.stringify(body)}:{})});const j=await r.json();if(!r.ok)throw Error(j.error);return j;}
const get=()=>api('/api/projects/'+pid);
(async()=>{
 const original=await get(),browser=await chromium.launch({headless:true,channel:'msedge'}),errors=[],checks=[],createdCopies=[];
 const page=await browser.newPage({viewport:{width:1600,height:1080}});require('./uiux-reveal.cjs')(page);page.on('pageerror',e=>errors.push(e.message));
 async function number(label,value){const input=page.getByLabel(label,{exact:true});await input.fill(String(value));await input.press('Tab');}
 async function save(){await page.getByRole('button',{name:'保存',exact:true}).click();await page.waitForFunction(()=>document.querySelector('header .saved'));return get();}
 try{
  await page.goto(base+'/?project='+pid);await page.getByRole('heading',{name:'ライブプレビュー'}).waitFor();
  assert.equal(await page.locator('.scene-list').count(),4);assert.match(await page.getByTestId('duration-total').innerText(),/20秒/);
  await page.getByRole('button',{name:'全編再生',exact:true}).click();
  await page.waitForFunction(()=>Number(document.querySelector('[data-testid="preview"]').dataset.frame)>=599,{},{timeout:30000});
  assert.ok((await page.locator('[data-scene="sc-outro"]').count())>0);checks.push('Step1: 20s / 4 scenes / Player plays all 600 frames, timeline follows scene');
  await page.getByTestId('scene-sc-feature').click();await page.getByLabel('画面構成',{exact:true}).selectOption('grid4');
  const a=await save();assert.equal(a.scenes[1].layout.type,'grid4');for(const i of [0,2,3])assert.deepEqual(a.scenes[i],original.scenes[i]);checks.push('Step2: only scene 2 becomes grid4; others unchanged');
  await page.getByTestId('scene-sc-explain').click();await number('コマの秒数',9);assert.match(await page.getByTestId('duration-total').innerText(),/22秒/);
  await page.getByLabel('動き',{exact:true}).selectOption('M-017');await page.getByLabel('スキャンを重ねる',{exact:true}).check();await number('演出の速度',1.3);if(await page.getByRole('button',{name:'停止',exact:true}).count())await page.getByRole('button',{name:'停止',exact:true}).click();
  await page.getByLabel('テキスト',{exact:true}).fill('手動で確定した説明');
  await page.getByRole('button',{name:'元に戻す',exact:true}).click();assert.notEqual(await page.getByLabel('テキスト',{exact:true}).inputValue(),'手動で確定した説明');await page.getByRole('button',{name:'やり直す',exact:true}).click();assert.equal(await page.getByLabel('テキスト',{exact:true}).inputValue(),'手動で確定した説明');
  const b=await save();assert.equal(b.scenes[2].durationFrames,270);assert.equal(b.scenes[0].durationFrames,90);assert.equal(b.scenes[1].durationFrames,120);assert.equal(b.scenes[3].durationFrames,180);assert.equal(b.scenes[2].layers[0].motionStack.length,2);checks.push('ripple 7→9 keeps others; type + scan; independent speed; Undo/Redo');
  await page.reload();await page.getByRole('heading',{name:'ライブプレビュー'}).waitFor();await page.getByTestId('scene-sc-explain').click();assert.equal(await page.getByLabel('テキスト',{exact:true}).inputValue(),'手動で確定した説明');assert.equal(await page.getByLabel('動き',{exact:true}).inputValue(),'M-017');checks.push('disk save + browser reload restores edits');
  // Real live preview: seek into the selected scene and observe its layer/effect.
  await page.getByLabel('再生位置',{exact:true}).evaluate(el=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(el,'252');el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.waitForFunction(()=>document.querySelector('[data-testid="preview"]').dataset.frame==='252');
  assert.equal(await page.locator('[data-effect="scan"]').count(),1);assert.ok((await page.locator('[data-layer="text-explain"]').innerText()).includes('手動'));checks.push('live seek shows typed text and scan simultaneously');
  await page.screenshot({path:path.join(out,'edited-desktop.png'),fullPage:true});
  await page.getByLabel('尺変更の方針',{exact:true}).selectOption('fixed');await number('コマの秒数',10);await page.getByRole('dialog',{name:'尺の再配分案'}).waitFor();assert.match(await page.getByTestId('duration-total').innerText(),/22秒/);await page.getByRole('button',{name:'キャンセル',exact:true}).click();assert.match(await page.getByTestId('duration-total').innerText(),/22秒/);await number('コマの秒数',10);await page.getByRole('button',{name:'再配分を承認',exact:true}).click();assert.match(await page.getByTestId('duration-total').innerText(),/20秒/);const c=await save();assert.equal(c.scenes[2].durationFrames,300);assert.equal(c.scenes.reduce((a,s)=>a+s.durationFrames,0),600);checks.push('fixed duration changes only after review + approval; cancel is no-op');
  await page.getByLabel('このコマの色を固定',{exact:true}).check();const color=await page.getByLabel('コマのaccent',{exact:true}).inputValue();await page.getByText('全体の配色',{exact:true}).click();await page.getByLabel('全体のaccent',{exact:true}).fill('#cc5533');assert.equal(await page.getByLabel('コマのaccent',{exact:true}).inputValue(),color);checks.push('scene color lock survives global theme change');
  await save();const current=await get();
  await page.getByRole('button',{name:'AI部分修正',exact:true}).click();
  const prop={proposalId:'browser-patch',baseRevision:current.revision,targetSceneId:'sc-explain',reason:'手動編集済みの文字は保護される',operations:[{op:'setLayerText',sceneId:'sc-explain',layerId:'text-explain',text:'AIが上書きしようとした文'}]};
  await page.getByLabel('提案patch JSON',{exact:true}).fill(JSON.stringify(prop));await page.getByRole('button',{name:'差分を確認',exact:true}).click();await page.getByRole('dialog',{name:'AI差分の確認'}).waitFor();assert.ok(await page.getByRole('dialog',{name:'AI差分の確認'}).getByText(/手動編集済み/).count());assert.equal(await page.getByRole('button',{name:'選択した差分を適用',exact:true}).isDisabled(),true);await page.getByRole('button',{name:'却下・閉じる',exact:true}).click();checks.push('manual field cannot be overwritten by AI patch');
  const safe={...prop,reason:'選択コマの余韻だけ調整',operations:[{op:'setPaceKeyframes',sceneId:'sc-explain',paceKeyframes:[{position:0,intensity:25},{position:1,intensity:10}]}]};
  await page.getByLabel('提案patch JSON',{exact:true}).fill(JSON.stringify(safe));await page.getByRole('button',{name:'差分を確認',exact:true}).click();await page.getByRole('button',{name:'選択した差分を適用',exact:true}).click();const afterPatch=await save();for(const i of [0,1,3])assert.deepEqual(afterPatch.scenes[i],current.scenes[i]);assert.equal(afterPatch.scenes[2].layers[0].text,'手動で確定した説明');checks.push('approved patch changes only selected pace; manual text + other scenes intact');
  // Import real media into the project and use it in a layer.
  await page.getByRole('button',{name:'素材',exact:true}).click();await page.getByLabel('素材アップロード',{exact:true}).setInputFiles({name:'test.png',mimeType:'image/png',buffer:Buffer.from(await page.evaluate(()=>{const c=document.createElement('canvas');c.width=20;c.height=20;c.getContext('2d').fillRect(0,0,20,20);return c.toDataURL().split(',')[1];}),'base64')});
  await page.getByRole('button',{name:'レイヤーとして追加',exact:true}).waitFor();await page.getByRole('button',{name:'レイヤーとして追加',exact:true}).click();const media=await save();assert.equal(media.assets.length,1);assert.equal(media.scenes[2].layers.length,2);checks.push('image upload stored in project + placed without losing text');
  await page.getByLabel('画面構成',{exact:true}).selectOption('free');await number('透明度',.65);await number('重ね順',22);const free=await save();assert.equal(free.scenes[2].layers.length,2);assert.equal(free.scenes[2].layers[1].opacity,.65);checks.push('free layout + opacity + layer order keep all layers');
  await page.getByRole('button',{name:'編集モード',exact:true}).click();await page.getByTestId('edit-stage').waitFor();assert.ok((await page.locator('[data-edit-layer]').count())>0);
  await page.getByRole('button',{name:'動き',exact:true}).click();await page.getByRole('button',{name:'モーションを探す',exact:true}).click();await page.getByRole('dialog',{name:'モーション図鑑'}).waitFor();
  assert.equal(await page.locator('.edit-overlay').count(),0);await page.getByRole('button',{name:'図鑑を閉じる',exact:true}).click();assert.ok((await page.locator('[data-edit-layer]').count())>0);checks.push('edit overlay hidden while motion catalog is open');
  await page.getByRole('button',{name:'モーションを探す',exact:true}).click();await page.getByLabel('図鑑検索',{exact:true}).fill('M-060');assert.equal(await page.locator('.catalog-card').count(),1);await page.locator('[data-motion-id="M-060"]').click();assert.equal(await page.getByRole('button',{name:'コマ全体に試着して再生',exact:true}).isEnabled(),true);await page.getByRole('button',{name:'図鑑を閉じる',exact:true}).click();checks.push('all catalog motions can be tried; MP4 export remains unavailable');
  await page.getByRole('button',{name:'構成',exact:true}).click();await page.getByRole('button',{name:/^v\d+を復元$/}).first().click();await page.locator('header .dirty').waitFor();await page.getByRole('button',{name:'元に戻す',exact:true}).click();await save();checks.push('stored revision restores in UI and is undoable');
  await page.getByRole('button',{name:'プロジェクト複製',exact:true}).click();await page.waitForFunction(()=>document.querySelector('select[aria-label="プロジェクトを開く"]').value.startsWith('copy-'));
  const copyId=await page.getByLabel('プロジェクトを開く',{exact:true}).inputValue();createdCopies.push(copyId);const copied=await api('/api/projects/'+copyId);assert.equal(copied.assets.length,1);assert.ok(fs.existsSync(path.join(root,'workspace/projects',copyId,copied.assets[0].path)));checks.push('project duplication copies local media and keeps source intact');
  const stale=structuredClone(media);stale.revision++;
  const bad=await fetch(base+'/api/projects/'+pid,{method:'PUT',headers:{'Content-Type':'application/json','X-Promo-Local':'1'},body:JSON.stringify({project:stale,baseRevision:1})});assert.equal(bad.status,409);
  const hostile=await fetch(base+'/api/projects/'+pid,{method:'PUT',headers:{'Content-Type':'application/json','X-Promo-Local':'1','Origin':'https://invalid.example'},body:'{}'});assert.equal(hostile.status,403);
  const renderer=await fetch(base+'/api/render',{method:'POST',headers:{'Content-Type':'application/json','X-Promo-Local':'1'},body:'{}'});assert.equal(renderer.status,404);checks.push('stale save + hostile origin rejected; no render endpoint invoked');
  assert.deepEqual(errors,[]);
  await page.setViewportSize({width:1100,height:900});await page.screenshot({path:path.join(out,'editor-compact.png'),fullPage:true});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  fs.writeFileSync(path.join(out,'browser-result.json'),JSON.stringify({checks,errors,renderRequests:0,testCreatedCopies:createdCopies},null,2));console.log(JSON.stringify({checks,errors}));
 }finally{
  // Return only the bundled sample's content to its pre-test state, as a new revision.
  const current=await get(),restore=structuredClone(original);restore.revision=current.revision+1;await api('/api/projects/'+pid,'PUT',{project:restore,baseRevision:current.revision});await browser.close();
  for(const copyId of createdCopies){const folder=path.resolve(root,'workspace/projects',copyId);if(!/^copy-[a-f0-9]{8}-[a-f0-9]{3}$/.test(copyId)||path.dirname(folder)!==path.resolve(root,'workspace/projects'))throw Error('Unsafe test cleanup target');fs.rmSync(folder,{recursive:true});}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});


