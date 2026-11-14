import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderStill,renderMedia} from '@remotion/renderer';
import {validateProject,totalFrames} from '../../ai-promo-editor/src/core.ts';
const job=path.resolve(process.argv[2]??'jobs/dd-editor-premium-20261113'),p=JSON.parse(fs.readFileSync(path.join(job,'project.json'),'utf8'));validateProject(p);
const root=path.resolve('../ai-promo-editor'),projectDir=path.join(root,'workspace/projects',p.projectId),publicDir=path.join(job,'render-public');
fs.mkdirSync(path.join(publicDir,'media',p.projectId),{recursive:true});
for(const a of p.assets){const source=path.join(projectDir,a.path);if(!fs.statSync(source).isFile())throw Error('Missing asset '+a.assetId);fs.copyFileSync(source,path.join(publicDir,'media',p.projectId,a.path.slice(7)));}
const same=JSON.parse(fs.readFileSync(path.join(projectDir,'project.json')));if(JSON.stringify(same)!==JSON.stringify(p))throw Error('Saved project differs from render snapshot');
const sourceSHA256=crypto.createHash('sha256').update(fs.readFileSync(path.join(job,'project.json'))).digest('hex');
const serveUrl=await bundle({entryPoint:path.join(root,'src/RenderEntry.tsx'),publicDir,outDir:path.join(job,'render-bundle'),webpackOverride:config=>({...config,resolve:{...config.resolve,alias:{...config.resolve?.alias,react:path.join(root,'node_modules/react'),'react-dom':path.join(root,'node_modules/react-dom'),remotion:path.join(root,'node_modules/remotion')}}})});
const browserExecutable='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',browser=await openBrowser('chrome',{browserExecutable}),inputProps={project:p};
try{const composition=await selectComposition({serveUrl,id:'SavedEditorProject',inputProps,browserExecutable,puppeteerInstance:browser});
const out=path.join(job,'output'),qa=path.join(job,'qa');fs.mkdirSync(path.join(out,'preview'),{recursive:true});fs.mkdirSync(qa,{recursive:true});
const starts=[];let cursor=0;for(const s of p.scenes){starts.push(cursor);cursor+=s.durationFrames;}
const frames=process.argv.includes('--probe')?[0,45]:[...new Set(starts.flatMap((f,i)=>[f,f+Math.min(35,p.scenes[i].durationFrames-1),f+Math.floor(p.scenes[i].durationFrames/2),f+p.scenes[i].durationFrames-1]))];
for(let i=0;i<frames.length;i+=3)await Promise.all(frames.slice(i,i+3).map(frame=>renderStill({serveUrl,composition,inputProps,frame,browserExecutable,puppeteerInstance:browser,output:path.join(qa,`frame-${String(frame).padStart(3,'0')}.png`)})));
if(!process.argv.includes('--probe')&&!process.argv.includes('--stills-only')){let progress=-1;await renderMedia({serveUrl,composition,inputProps,browserExecutable,puppeteerInstance:browser,codec:'h264',audioCodec:'aac',pixelFormat:'yuv420p',crf:18,concurrency:3,outputLocation:path.join(out,'promo_16x9.mp4'),onProgress:({progress:p})=>{const v=Math.floor(p*10);if(v!==progress){progress=v;console.log('Render '+v*10+'%');}}});}
fs.writeFileSync(path.join(qa,'render-source.json'),JSON.stringify({projectId:p.projectId,revision:p.revision,sourceSHA256,frames:totalFrames(p),sharedComponent:'ai-promo-editor/src/LiveComposition.tsx',renderFrames:frames,mediaBytesCopied:true},null,2));console.log('Saved project render complete: '+job);
}finally{await browser.close({silent:true});}
