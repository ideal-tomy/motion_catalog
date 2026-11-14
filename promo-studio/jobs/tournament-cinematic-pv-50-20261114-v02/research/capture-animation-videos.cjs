const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const {chromium}=require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');
const target='C:/Users/ryoji/00myapp/ai_demo_workspace/tournament-latest-review-20261024';
const base='http://127.0.0.1:5175/?mode=full&controls=0&autoplay=1';
const root=__dirname,out=path.join(root,'captures','verified'),scratch=path.join(root,'captures','frames');
const ffmpeg='../../../node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe';
const specs=[
  {id:'draw-standard',scene:'draw',seconds:7.6,fixture:''},
  {id:'draw-long',scene:'draw',seconds:7.6,fixture:'&fixture=long'},
  {id:'result-winner',scene:'result',seconds:4.7,fixture:''},
  {id:'bracket-advance',scene:'bracket',seconds:2.8,fixture:''},
  {id:'vs-impact',scene:'vs',seconds:3.4,fixture:''},
  {id:'champion',scene:'champion',seconds:5.8,fixture:''},
];
const fps=30;
async function main(){
  fs.mkdirSync(out,{recursive:true});
  const browser=await chromium.launch({headless:true,channel:'msedge'}),report=[];
  try{for(const spec of specs){
    const dir=path.join(scratch,spec.id);fs.mkdirSync(dir,{recursive:true});
    const context=await browser.newContext({viewport:{width:1920,height:1080},deviceScaleFactor:1});
    const page=await context.newPage(),errors=[],failed=[],outside=[];
    await page.route('**/tournament-effects/**',route=>{
      const pathname=new URL(route.request().url()).pathname.replace(/^\//,'');
      const asset=path.resolve(target,'public',pathname);
      if(!asset.startsWith(path.resolve(target,'public')+path.sep)||!fs.existsSync(asset))return route.abort();
      return route.fulfill({path:asset});
    });
    page.on('pageerror',e=>errors.push(e.message));
    page.on('requestfailed',r=>{if(!r.url().includes('/@vite/client'))failed.push(`${r.method()} ${r.url()}`);});
    page.on('request',r=>{if(!r.url().startsWith('http://127.0.0.1:5175/'))outside.push(r.url());});
    await page.goto(`${base}&scene=${spec.scene}${spec.fixture}`,{waitUntil:'networkidle'});
    const selector=spec.scene==='draw'||spec.scene==='champion'?'.ap-fixture':'.pm-stage';
    await page.waitForSelector(selector,{timeout:10000});
    await page.waitForFunction(sel=>[...document.querySelectorAll(sel)].some(e=>e.getBoundingClientRect().width>100),selector);
    await page.waitForTimeout(500);
    const imageCount=Math.round(spec.seconds*fps),start=Date.now();
    for(let i=0;i<imageCount;i++){
      const due=start+i*1000/fps,delay=due-Date.now();if(delay>0)await page.waitForTimeout(delay);
      await page.screenshot({path:path.join(dir,`frame-${String(i).padStart(5,'0')}.jpg`),type:'jpeg',quality:86});
    }
    const stageCount=await page.locator(selector).count();
    const sample=await page.locator(selector).screenshot({type:'png'});
    const samplePath=path.join(out,`${spec.id}-stage.png`);fs.writeFileSync(samplePath,sample);
    await context.close();
    const targetVideo=path.join(out,`${spec.id}.mp4`);
    const proc=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-framerate',String(fps),'-i',path.join(dir,'frame-%05d.jpg'),'-frames:v',String(imageCount),'-an','-c:v','libx264','-preset','veryfast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',targetVideo],{cwd:__dirname,windowsHide:true,encoding:'utf8',maxBuffer:4*1024*1024});
    if(proc.status!==0)throw Error(proc.stderr||proc.error||`ffmpeg failed: ${spec.id}`);
    const videoBytes=fs.statSync(targetVideo).size;
    const item={id:spec.id,scene:spec.scene,url:`${base}&scene=${spec.scene}${spec.fixture}`,seconds:spec.seconds,recordedFrames:imageCount,fps,width:1920,height:1080,bytes:videoBytes,stageCount,errors,failedRequests:failed,outsideRequests:outside,video:targetVideo,stageImage:samplePath};
    report.push(item);console.log(JSON.stringify({id:item.id,frames:imageCount,bytes:videoBytes,stageCount,errors,failed,outside}));
    fs.rmSync(dir,{recursive:true,force:true});
  }}finally{await browser.close();}
  fs.writeFileSync(path.join(root,'animation-video-captures.json'),JSON.stringify(report,null,2));
  for(const spec of specs)fs.cpSync(path.join(out,`${spec.id}.mp4`),path.resolve(__dirname,'../../../public/cinematic-pv-v02',`${spec.id}.mp4`));
  if(report.some(x=>!x.bytes||x.stageCount!==1||x.errors.length||x.failedRequests.length||x.outsideRequests.length))process.exitCode=1;
}
main().catch(e=>{console.error(e);process.exitCode=1;});
