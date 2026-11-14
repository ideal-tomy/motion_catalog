const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'../../..');
const source='C:/Users/ryoji/00myapp/ai_demo_workspace/motion_catalog/docs/画面録画 2026-11-14 204055.mp4';
const ffmpeg=path.join(root,'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const target=path.join(root,'public/cinematic-pv-v03');
if(!fs.existsSync(source))throw Error(`Screen recording not found: ${source}`);
fs.mkdirSync(target,{recursive:true});
const clips=[
  ['dart-entry',0,6],['entrant-card',8,5],['pair-build-one',21,5],['pair-confirmed-one',22,2],
  ['draw-reset',28,7],['pair-confirmed-two',42,8],['teams-overview',48,8],
  ['bracket-advance',58,8],['versus',68,10],['winner',80,8],['second-place',88,8],['champion',100,2]
];
for(const [name,start,duration] of clips){
  const out=path.join(target,`${name}.mp4`);
  const result=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-ss',String(start),'-i',source,'-t',String(duration),'-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-r','30','-movflags','+faststart',out],{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});
  if(result.status!==0)throw Error(result.stderr||result.error||`FFmpeg failed: ${name}`);
  console.log(`${name}: ${start}s–${start+duration}s (${(fs.statSync(out).size/1024/1024).toFixed(1)} MiB)`);
}
