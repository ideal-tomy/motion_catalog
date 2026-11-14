const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const job=path.resolve(__dirname,'..');
const root=path.resolve(job,'../..');
const ffmpeg=path.join(root,'node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe');
const source='C:/Users/ryoji/00myapp/ai_demo_workspace/motion_catalog/docs/画面録画 2026-11-14 204055.mp4';
const dir=path.join(job,'research/source-keyframes');fs.mkdirSync(dir,{recursive:true});
for(const second of [0,2,4,6,8,10,12,18,20,22,24,28,32,36,40,44,46,48,50,52,54,58,60,62,64,68,70,72,74,78,80,82,84,86,88,90,92,94,96,98,100,102]){
 const out=path.join(dir,`source-${String(second).padStart(3,'0')}.png`);
 const p=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-ss',String(second),'-i',source,'-frames:v','1','-vf','scale=960:-1',out],{encoding:'utf8',windowsHide:true});
 if(p.status!==0)throw Error(p.stderr||p.error||`Failed at ${second}s`);
}
console.log(`Captured ${fs.readdirSync(dir).length} source timecodes to ${dir}`);
