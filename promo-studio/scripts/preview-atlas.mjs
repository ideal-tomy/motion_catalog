import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {bundle} from '@remotion/bundler';
import {openBrowser,selectComposition,renderMedia,renderStill} from '@remotion/renderer';
import {css,escape} from './library.mjs';
const job='jobs/atlas-reexport-tournament-20261113',plan=JSON.parse(fs.readFileSync(job+'/composition.json','utf8')),out=job+'/output/motions';fs.mkdirSync(out,{recursive:true});
const serveUrl=await bundle({entryPoint:path.resolve('src/index.tsx'),publicDir:path.resolve('public'),outDir:path.resolve('build-atlas-preview')});
const browserExecutable='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',browser=await openBrowser('chrome',{browserExecutable});
const results=[];
try{for(const scene of plan.scenes){
 const id=scene.id.replace('-',''),inputProps={scene,theme:plan.theme},composition=await selectComposition({serveUrl,id,inputProps,browserExecutable,puppeteerInstance:browser});
 await renderMedia({serveUrl,composition,inputProps,browserExecutable,puppeteerInstance:browser,codec:'h264',pixelFormat:'yuv420p',crf:18,concurrency:3,outputLocation:out+'/'+scene.id+'.mp4'});
 const frame=Math.min(36,composition.durationInFrames-1),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
 const still=async frame=>(await renderStill({serveUrl,composition,inputProps,frame,browserExecutable,puppeteerInstance:browser,imageFormat:'png'})).buffer;
 const a=await still(frame);await still(0);const b=await still(frame);assert.equal(sha(a),sha(b),'Non-deterministic seek '+id);assert.notEqual(sha(a),sha(await still(2)),'Static motion '+id);
 // Same local frame must be identical in the assembled composition.
 const assembled=await selectComposition({serveUrl,id:'AtlasTournament',inputProps:{plan},browserExecutable,puppeteerInstance:browser});
 const combined=await renderStill({serveUrl,composition:assembled,inputProps:{plan},frame:scene.startFrame+frame,browserExecutable,puppeteerInstance:browser,imageFormat:'png'});
 assert.equal(sha(a),sha(combined.buffer),'Single/combined mismatch '+id);
 fs.writeFileSync(out+'/'+scene.id+'.png',a);results.push({id:scene.id,durationInFrames:composition.durationInFrames,seekDeterministic:true,animated:true,singleMatchesCombined:true});console.log('Verified '+scene.id);
}}finally{await browser.close({silent:true});}
fs.writeFileSync(out+'/index.html',`<!doctype html><html lang="ja"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ATLAS 単体プレビュー</title><style>${css}</style><main><h1>6種類の単体プレビュー</h1><p>完成動画と同じRemotion部品。各動画は無音です。再生・停止・シークで確認できます。</p><div class="grid">${plan.scenes.map(s=>`<section><h2>${escape(s.id)}</h2><video controls playsinline preload="metadata" poster="${s.id}.png" src="${s.id}.mp4"></video><p>${escape(s.text)} / ${(s.endFrame-s.startFrame)/30}秒</p></section>`).join('')}</div></main></html>`);
fs.writeFileSync(job+'/qa/motion-tests.json',JSON.stringify(results,null,2));
