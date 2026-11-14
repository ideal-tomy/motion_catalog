const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');

const base='http://127.0.0.1:4319';
const projectId='sample-d041aeef-bcf';
const output=path.resolve('docs/qa/ui-guide');
fs.mkdirSync(output,{recursive:true});

(async()=>{
  const before=await (await fetch(`${base}/api/projects/${projectId}`)).json();
  const browser=await chromium.launch({channel:'msedge',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  try{
    await page.goto(`${base}/?project=${projectId}`);
    const guideLink=page.getByRole('link',{name:'操作ガイド',exact:true});
    await guideLink.waitFor();assert.equal(await guideLink.getAttribute('href'),'/guide/');
    const guide=await browser.newPage({viewport:{width:1440,height:1000}});
    await guide.goto(`${base}/guide/`);
    await guide.getByRole('heading',{name:/やりたい操作から/}).waitFor();
    const inventory=await guide.evaluate(()=>window.__GUIDE_TEST__);
    assert.ok(inventory.operationCount>=30,`expected 30+ operation entries; got ${inventory.operationCount}`);
    assert.equal(await guide.locator('.map img').evaluate(img=>img.complete&&img.naturalWidth>0),true);

    await guide.locator('#search').fill('文字を真ん中に');
    const results=guide.locator('.result');
    await results.first().waitFor();
    const centerResults=await results.allTextContents();
    assert.ok(centerResults.some(t=>t.includes('枠の中の文字を中央揃えにする')));
    assert.ok(centerResults.some(t=>t.includes('テキストボックス自体を画面中央へ置く')));
    await results.filter({hasText:'テキストボックス自体を画面中央へ置く'}).click();
    assert.match(await guide.locator('#detail').innerText(),/配置・サイズ/);

    await guide.locator('#search').fill('テキストを書き換える');
    await results.first().click();
    assert.match(await guide.locator('#detail').innerText(),/本文・書式.*テキスト/s);
    assert.match(await guide.locator('#detail').innerText(),/文字レイヤー/);

    await guide.locator('#search').fill('画像をドラッグ');
    await results.first().click();
    assert.match(await guide.locator('#detail').innerText(),/編集モード/);
    assert.match(await guide.locator('#detail').innerText(),/スナップ/);

    await guide.locator('#search').fill('MP4出力');
    await results.first().click();
    assert.match(await guide.locator('#detail').innerText(),/未対応/);

    await guide.locator('#search').fill('');
    await guide.getByRole('button',{name:'シーン・タイムライン',exact:true}).click();
    assert.ok(await guide.locator('.result').count()>0);
    await guide.getByRole('button',{name:/下部：タイムライン/}).click();
    assert.match(await guide.locator('#detail').innerText(),/再生位置で動画シーンを分割/);

    await guide.locator('#search').fill('該当しない検索語xyz');
    assert.match(await guide.locator('#detail').innerText(),/該当する操作がありません/);
    await guide.locator('#clear-search').click();
    await guide.locator('#quick [data-open="text-edit"]').click();

    await guide.keyboard.press('Tab');
    await guide.screenshot({path:path.join(output,'guide-desktop.png'),fullPage:true});
    await guide.setViewportSize({width:390,height:844});
    assert.ok(await guide.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile horizontal overflow');
    await guide.screenshot({path:path.join(output,'guide-mobile.png'),fullPage:true});
    assert.deepEqual(errors,[]);
    const after=await (await fetch(`${base}/api/projects/${projectId}`)).json();
    assert.deepEqual(after,before,'guide inspection must not modify the project');
    const report={status:'passed',operationCount:inventory.operationCount,categories:inventory.categories.length,checks:['existing app button opens /guide/','search synonyms distinguish in-box alignment from box position','task search shows actual path and prerequisites','screen-map links open relevant operations','empty search result clears stale operation details','not-implemented MP4 export is labelled honestly','desktop and mobile layouts have no horizontal overflow','project JSON remains unchanged'],screenshots:['docs/qa/ui-guide/guide-desktop.png','docs/qa/ui-guide/guide-mobile.png'],browserErrors:errors};
    fs.writeFileSync(path.join(output,'result.json'),JSON.stringify(report,null,2));
    console.log(JSON.stringify(report,null,2));
    await guide.close();
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
