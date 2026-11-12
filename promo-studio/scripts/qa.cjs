const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const {pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/ryoji/AppData/Local/npm-cache/_npx/c61c9351a0dbcfa7/node_modules/playwright');
const root=path.resolve(__dirname,'..'), job=path.resolve(process.argv[2]??path.join(root,'jobs/tournament-20261112')), output=path.join(job,'output'), qa=path.join(job,'qa');
const request=JSON.parse(fs.readFileSync(path.join(job,'request.json'),'utf8')),expectedDuration=request.durationSeconds,expectedFrames=expectedDuration*request.fps;
const native=path.join(root,'node_modules/@remotion/compositor-win32-x64-msvc');
function run(exe,args){const p=spawnSync(path.join(native,exe+'.exe'),args,{encoding:'utf8',windowsHide:true,maxBuffer:20*1024*1024});if(p.status!==0)throw Error(p.stderr||p.error||'native process failed');return p.stdout||p.stderr;}
(async()=>{
  const plan=JSON.parse(fs.readFileSync(path.join(job,'composition.json'),'utf8'));
  if(plan.compositionId==='TournamentRockEnglish'){
    assert.equal(plan.transitions.length,9);
    assert.equal(new Set(plan.transitions.map(t=>t.kind)).size,9);
    assert.equal(/[\u3040-\u30ff\u3400-\u9fff]/.test(JSON.stringify(plan.scenes.map(s=>[s.word,s.copy,s.cta]))),false);
    assert.equal(/[\u3040-\u30ff\u3400-\u9fff]/.test(fs.readFileSync(path.join(output,'preview/index.html'),'utf8')),false);
  }
  const video=path.join(output,'promo_16x9.mp4');
  const probe=JSON.parse(run('ffprobe',['-v','error','-show_streams','-show_format','-of','json',video]));
  const v=probe.streams.find(s=>s.codec_type==='video'),a=probe.streams.find(s=>s.codec_type==='audio');
  assert.equal(v.codec_name,'h264');assert.equal(v.width,1920);assert.equal(v.height,1080);assert.equal(v.r_frame_rate,'30/1');assert.equal(Number(v.nb_frames),expectedFrames);assert.equal(a.codec_name,'aac');assert.ok(Math.abs(Number(probe.format.duration)-expectedDuration)<.1);
  const decode=run('ffmpeg',['-hide_banner','-v','error','-i',video,'-c:v','libx264','-preset','ultrafast','-c:a','pcm_s16le','-f','null','-']);
  fs.writeFileSync(path.join(qa,'decode-report.txt'),decode);
  const wav=path.join(qa,'decoded-audio.wav');run('ffmpeg',['-hide_banner','-v','error','-y','-i',video,'-vn','-c:a','pcm_s16le',wav]);
  const audio=fs.readFileSync(wav);let offset=12,peakSample=0,samples=0,squareSum=0;
  while(offset+8<audio.length){const type=audio.toString('ascii',offset,offset+4),size=audio.readUInt32LE(offset+4);if(type==='data'){for(let j=offset+8;j<Math.min(audio.length,offset+8+size);j+=2){const v=audio.readInt16LE(j)/32768;peakSample=Math.max(peakSample,Math.abs(v));squareSum+=v*v;samples++;}break;}offset+=8+size+(size%2);}
  const peak=20*Math.log10(peakSample);assert.ok(samples>48000*expectedDuration&&peak<-.1&&peak>-40,'Audio peak invalid');
  const raw=spawnSync(path.join(native,'ffmpeg.exe'),['-hide_banner','-v','error','-i',video,'-an','-vf','scale=160:90','-pix_fmt','rgb24','-c:v','rawvideo','-f','image2pipe','pipe:1'],{windowsHide:true,maxBuffer:40*1024*1024});
  assert.equal(raw.status,0,String(raw.stderr));const frameBytes=160*90*3;assert.equal(raw.stdout.length/frameBytes,expectedFrames);
  const everyFrameQA={checked:expectedFrames,black:[],brightestPixelsMin:Infinity};
  for(let f=0;f<expectedFrames;f++){let bright=0;for(let i=f*frameBytes;i<(f+1)*frameBytes;i+=3)if(Math.max(raw.stdout[i],raw.stdout[i+1],raw.stdout[i+2])>55)bright++;everyFrameQA.brightestPixelsMin=Math.min(everyFrameQA.brightestPixelsMin,bright);if(bright<5)everyFrameQA.black.push(f);}
  assert.deepEqual(everyFrameQA.black,[]);
  const browser=await chromium.launch({headless:true,channel:'msedge'});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
    await page.goto(pathToFileURL(path.join(output,'preview/index.html')).href);
    const meta=await page.locator('video').evaluate(async el=>{
      if(el.readyState<1)await new Promise((resolve,reject)=>{el.onloadedmetadata=resolve;el.onerror=reject;});
      return {width:el.videoWidth,height:el.videoHeight,duration:el.duration};
    });assert.equal(meta.width,1920);assert.equal(meta.height,1080);assert.ok(Math.abs(meta.duration-expectedDuration)<.1);
    await page.locator('video').evaluate(el=>{el.currentTime=0;el.volume=.4;return el.play();});
    await page.waitForFunction(()=>document.querySelector('video').ended,{},{timeout:35000});
    const playback=await page.locator('video').evaluate(el=>({ended:el.ended,currentTime:el.currentTime,muted:el.muted,volume:el.volume,error:el.error?.message??null,quality:el.getVideoPlaybackQuality().totalVideoFrames}));
    assert.equal(playback.ended,true);assert.equal(playback.error,null);assert.equal(playback.muted,false);
    // Frame-by-frame inspection uses the fully decoded native output above.
    // Headless Edge can omit requestVideoFrameCallback notifications.
    await page.screenshot({path:path.join(qa,'html-desktop.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(qa,'html-mobile.png'),fullPage:true});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.deepEqual(errors,[]);
    const mediaSHA256=require('node:crypto').createHash('sha256').update(fs.readFileSync(video)).digest('hex');
    const report={mediaSHA256,format:{video:v.codec_name,audio:a.codec_name,width:v.width,height:v.height,fps:v.r_frame_rate,frames:Number(v.nb_frames),duration:Number(probe.format.duration)},audioPeakDB:peak,audioRmsDB:20*Math.log10(Math.sqrt(squareSum/samples)),fullDecode:true,everyFrameQA,localFileHTML:true,desktopAndMobile:true,playback,errors};
    fs.writeFileSync(path.join(qa,'result.json'),JSON.stringify(report,null,2));fs.writeFileSync(path.join(qa,'ffprobe.json'),JSON.stringify(probe,null,2));console.log(JSON.stringify(report));
    if(fs.existsSync(path.join(job,'delivery.json'))){const {exportJob}=await import('./library.mjs');exportJob(job);}
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
