const fs = require('node:fs');
const path = require('node:path');
const {chromium} = require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');
const root = path.resolve(__dirname, '..');
const english=process.argv.includes('--english');
const job=english?'tournament-rock-en-transitions-20261112':'tournament-20261112';
const plans = [
  {scene:'draw', frames:120, start:0, end:4.89},
  {scene:'vs', frames:90, start:4.2, end:5.939},
  {scene:'result', frames:90, start:0, end:2.789},
  {scene:'champion', frames:120, start:0, end:3.5},
];
(async()=>{
  const browser = await chromium.launch({headless:true, channel:'msedge'});
  const context = await browser.newContext({viewport:{width:1920,height:1400},deviceScaleFactor:1});
  const page = await context.newPage();
  const errors=[], failed=[], writes=[], external=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)failed.push({url:r.url(),status:r.status()});});
  page.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.method());if(!r.url().startsWith('http://127.0.0.1:5175')&&!r.url().startsWith('data:'))external.push(r.url());});
  fs.mkdirSync(path.join(root,`jobs/${job}/captures`),{recursive:true});
  for(const plan of plans){
    await page.goto(`http://127.0.0.1:5175/?scene=${plan.scene}&mode=short`);
    await page.getByRole('heading',{name:'Animation Preview',exact:true}).waitFor();
    await page.evaluate(()=>document.fonts.ready);
    await page.addStyleTag({content:'.ap-app{padding:0;max-width:none}.ap-header{display:none}.ap-screen{width:1920px;border:0;border-radius:0}'});
    await page.locator('.ap-screen img').evaluateAll(async imgs=>{await Promise.all(imgs.map(img=>img.decode().catch(()=>{})));});
    const broken=await page.locator('.ap-screen img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src));
    if(broken.length)throw Error('Missing images '+JSON.stringify(broken));
    await page.getByRole('button',{name:'最初から再生',exact:true}).click();
    await page.waitForTimeout(150);
    await page.getByRole('button',{name:'一時停止',exact:true}).click();
    const dir=path.join(root,english?'public/captures/tournament-en':'public/captures',plan.scene);fs.mkdirSync(dir,{recursive:true});
    for(let i=0;i<plan.frames;i++){
      const position=plan.start+(plan.end-plan.start)*i/(plan.frames-1);
      await page.getByRole('slider',{name:'確認位置'}).evaluate((el,value)=>{
        const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set;set.call(el,String(value));el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));
      },position);
      if(english)await page.locator('.ap-screen').evaluate(el=>{const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);const translations=[['青木 サンプル','AOKI / SAMPLE'],['佐藤 サンプル','SATO / SAMPLE'],['高橋 サンプル','TAKAHASHI / SAMPLE'],['田中 サンプル','TANAKA / SAMPLE'],['サンプル大会','SAMPLE TOURNAMENT'],['勝利','WINS']];while(walker.nextNode()){let text=walker.currentNode.textContent;for(const [a,b]of translations)text=text.replaceAll(a,b);if(walker.currentNode.textContent!==text)walker.currentNode.textContent=text;}});
      await page.waitForTimeout(16);
      await page.locator('.ap-screen').screenshot({path:path.join(dir,`${String(i).padStart(4,'0')}.jpg`),type:'jpeg',quality:93,animations:'disabled'});
    }
    if(english){const text=await page.locator('.ap-screen').innerText();if(/[\u3040-\u30ff\u3400-\u9fff]/.test(text))throw Error('Japanese remains in localized stage: '+text);}
    await page.screenshot({path:path.join(root,`jobs/${job}/captures/${plan.scene}-controls.png`),fullPage:true});
    console.log(`Captured ${plan.scene}: ${plan.frames} frames`);
  }
  const evidence={plans,viewport:{width:1920,height:1400},capture:{width:1920,height:1080,fps:30},source:'existing isolated Animation Preview; sample data, not a live tournament',errors,failed,writes,external};
  fs.writeFileSync(path.join(root,`jobs/${job}/captures/evidence.json`),JSON.stringify({...evidence,localization:english?'English text substitution in the live preview DOM only; source code unchanged; names remain fictional':'original Japanese'},null,2));
  await browser.close();
  if(errors.length||failed.length||writes.length||external.length)throw Error('Capture QA failed; see evidence.json');
})().catch(e=>{console.error(e);process.exitCode=1;});
