import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createServer as createViteServer} from 'vite';
import {validateProject,implemented} from '../src/core.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const workspace=path.join(root,'workspace/projects');await fs.mkdir(workspace,{recursive:true});
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const validId=id=>{if(!/^[a-zA-Z0-9_-]{2,64}$/.test(id))throw Error('Invalid project ID');return id;};
const dir=id=>path.join(workspace,validId(id));
async function atomic(file,data){const temp=file+'.'+crypto.randomUUID()+'.tmp';await fs.writeFile(temp,JSON.stringify(data,null,2));await fs.rename(temp,file);}
const example=await read(path.join(root,'examples/example-project.json'));
await fs.mkdir(dir(example.projectId),{recursive:true});
try{await fs.access(path.join(dir(example.projectId),'project.json'));}catch{await atomic(path.join(dir(example.projectId),'project.json'),example);}
let queue=Promise.resolve();const serial=fn=>{const p=queue.then(fn);queue=p.catch(()=>{});return p;};
const app=express();
app.use((req,res,next)=>{
 if(!['127.0.0.1:4319','localhost:4319'].includes(req.headers.host??''))return res.status(403).json({error:'Local host only'});
 if(req.headers.origin&&!['http://127.0.0.1:4319','http://localhost:4319'].includes(req.headers.origin))return res.status(403).json({error:'Origin rejected'});
 if(req.path.startsWith('/api/')&&!['GET','HEAD'].includes(req.method)&&req.headers['x-promo-local']!=='1')return res.status(403).json({error:'Missing local request header'});
 res.setHeader('X-Content-Type-Options','nosniff');next();
});
app.use('/api',express.json({limit:'2mb'}));
app.get('/api/health',(req,res)=>res.json({app:'AI_PROMO_STUDIO_EDITOR',version:'0.3.0',phase:'v3'}));
app.get('/api/projects',async(req,res)=>{const out=[];for(const d of await fs.readdir(workspace,{withFileTypes:true})){if(!d.isDirectory())continue;try{const p=await read(path.join(workspace,d.name,'project.json'));out.push({projectId:p.projectId,title:p.title,revision:p.revision});}catch{}}res.json(out);});
app.get('/api/projects/:id',async(req,res)=>res.json(await read(path.join(dir(req.params.id),'project.json'))));
app.post('/api/projects/:id/duplicate',async(req,res)=>{
 const result=await serial(async()=>{const old=await read(path.join(dir(req.params.id),'project.json'));const project=structuredClone(old);project.projectId='copy-'+crypto.randomUUID().slice(0,12);project.title=old.title.slice(0,150)+'（複製）';project.revision=1;validateProject(project);const folder=dir(project.projectId);await fs.mkdir(folder,{recursive:false});if(project.assets.length)await fs.mkdir(path.join(folder,'assets'));for(const a of project.assets)for(const media of [a.path,...(a.posterPath?[a.posterPath]:[])]){const source=path.join(dir(req.params.id),media),st=await fs.lstat(source);if(!st.isFile()||st.isSymbolicLink())throw Error('Invalid source asset');await fs.copyFile(source,path.join(folder,media));}await atomic(path.join(folder,'project.json'),project);return project;});res.json(result);
});
app.put('/api/projects/:id',async(req,res)=>{
 const {project,baseRevision}=req.body;validateProject(project);if(project.projectId!==validId(req.params.id))throw Error('Project ID mismatch');
 const result=await serial(async()=>{
  const folder=dir(project.projectId);await fs.mkdir(folder,{recursive:true});const file=path.join(folder,'project.json');let old=null;try{old=await read(file);}catch(e){if(e.code!=='ENOENT')throw e;}
  if(old&&(old.revision!==baseRevision||project.revision<=old.revision))return null;
  if(!old&&baseRevision!==null)throw Error('New project requires baseRevision=null');
  if(old){await fs.mkdir(path.join(folder,'history'),{recursive:true});await atomic(path.join(folder,'history',`${old.revision}.json`),old);}
  // Verify every local asset reference before committing a new revision.
 for(const a of project.assets)for(const media of [a.path,...(a.posterPath?[a.posterPath]:[])]){const st=await fs.lstat(path.join(folder,media));if(!st.isFile()||st.isSymbolicLink())throw Error('Invalid asset file');}
  await atomic(file,project);return project;
 });
 if(!result)return res.status(409).json({error:'別の保存が先に行われました。再読込して差分を確認してください。'});res.json(result);
});
app.get('/api/projects/:id/history',async(req,res)=>{let names=[];try{names=await fs.readdir(path.join(dir(req.params.id),'history'));}catch{}res.json(names.filter(n=>/^\d+\.json$/.test(n)).map(n=>Number(n.slice(0,-5))).sort((a,b)=>b-a));});
app.get('/api/projects/:id/history/:revision',async(req,res)=>{if(!/^\d+$/.test(req.params.revision))throw Error('Invalid revision');res.json(await read(path.join(dir(req.params.id),'history',req.params.revision+'.json')));});
app.post('/api/projects/:id/proposals',async(req,res)=>{
 const p=req.body.proposal;await fs.access(path.join(dir(req.params.id),'project.json'));
 const allowed=['setSceneDuration','setLayout','setLayerText','setLayerMotionStack','setSceneTheme','setPaceKeyframes','addLayer'];
 if(!p||!/^[-a-zA-Z0-9_]{2,80}$/.test(p.proposalId)||!/^[-a-zA-Z0-9_]{2,80}$/.test(p.targetSceneId)||!Number.isInteger(p.baseRevision)||!Array.isArray(p.operations)||!p.operations.length||p.operations.length>50||p.operations.some(o=>!allowed.includes(o.op)||o.sceneId!==p.targetSceneId))throw Error('部分修正の対象・操作が不正です');
 const folder=path.join(dir(req.params.id),'proposals');await fs.mkdir(folder,{recursive:true});const file=`${p.proposalId}-${crypto.randomUUID().slice(0,8)}.json`;await atomic(path.join(folder,file),p);res.json({file});
});
app.post('/api/projects/:id/assets',express.raw({type:()=>true,limit:'20mb'}),async(req,res)=>{
 const folder=dir(req.params.id);await fs.access(path.join(folder,'project.json'));
 const b=req.body;if(!Buffer.isBuffer(b)||b.length<12)throw Error('素材ファイルが不正です');
 let ext='',kind='';
 if(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))){ext='png';kind='image';}
 else if(b[0]===255&&b[1]===216&&b[2]===255){ext='jpg';kind='image';}
 else if(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP'){ext='webp';kind='image';}
 else if(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WAVE'){ext='wav';kind='audio';}
 else if(b.toString('ascii',4,8)==='ftyp'){ext='mp4';kind='video';}
 else if(b.toString('ascii',0,3)==='ID3'||b[0]===255&&(b[1]&224)===224){ext='mp3';kind='audio';}
 else throw Error('PNG/JPEG/WebP/MP4/WAV/MP3に対応しています');
 const declared=String(req.headers['content-type']??'').split(';')[0];
 const expected={png:'image/png',jpg:'image/jpeg',webp:'image/webp',mp4:'video/mp4',wav:'audio/wav',mp3:'audio/mpeg'}[ext];
 if(declared!==expected&&declared!=='application/octet-stream'&&!(ext==='wav'&&declared==='audio/x-wav'))throw Error('素材の種類とMIMEが一致しません');
 const assetId='asset-'+crypto.randomUUID().slice(0,12),assetPath=`assets/${assetId}.${ext}`;
 await fs.mkdir(path.join(folder,'assets'),{recursive:true});await fs.writeFile(path.join(folder,assetPath),b,{flag:'wx'});
 res.json({assetId,kind,path:assetPath,license:'アップロード素材。利用条件は要確認',verifiedForUse:false});
});
app.get('/media/:id/:name',async(req,res)=>{if(!/^[a-zA-Z0-9_.-]+$/.test(req.params.name)||req.params.name.includes('..'))throw Error('Invalid file');const file=path.join(dir(req.params.id),'assets',req.params.name);const st=await fs.lstat(file);if(st.isSymbolicLink()||!st.isFile())throw Error('Invalid media');res.sendFile(file);});
app.post('/api/projects/:id/assets/:assetId/thumbnail',express.raw({type:'image/jpeg',limit:'1mb'}),async(req,res)=>{if(!/^asset-[a-f0-9-]{12}$/.test(req.params.assetId))throw Error('Invalid asset ID');const folder=path.join(dir(req.params.id),'assets'),names=await fs.readdir(folder);if(!names.some(n=>n.startsWith(req.params.assetId+'.')&&!n.endsWith('.thumb.jpg')))throw Error('Missing original asset');const b=req.body;if(!Buffer.isBuffer(b)||b[0]!==255||b[1]!==216||b[2]!==255)throw Error('Invalid JPEG thumbnail');const posterPath=`assets/${req.params.assetId}.thumb.jpg`;await fs.writeFile(path.join(dir(req.params.id),posterPath),b);res.json({posterPath});});
app.use('/atlas-posters',express.static(path.join(root,'public/atlas-posters')));
const catalog=await read(path.join(root,'reference/catalog/MOTION_ATLAS_60/motions.json'));
if(catalog.motions.length!==60)throw Error('Expected 60 motions');
const styleTags=await read(path.join(root,'reference/style-tags.json'));
app.get('/api/catalog',(req,res)=>res.json(catalog.motions.map(m=>({...m,tags:styleTags[m.id]??[],previewAvailable:true,sceneApplicable:implemented.includes(m.id),mp4Exportable:false,implementationStatus:implemented.includes(m.id)?'implemented':'demo-only'}))));
app.get('/api/example',(req,res)=>res.json(example));
app.get('/api/example-patch',async(req,res)=>res.json(await read(path.join(root,'examples/example-patch.json'))));
app.use('/api',(req,res)=>res.status(404).json({error:'この段階では未実装です'}));
const vite=await createViteServer({root,server:{middlewareMode:true,host:'127.0.0.1',hmr:false},appType:'spa'});app.use(vite.middlewares);
app.use((error,req,res,next)=>{console.error(error.message);res.status(error.code==='ENOENT'?404:400).json({error:error.message||'処理に失敗しました'});});
const server=app.listen(4319,'127.0.0.1',()=>console.log('AI PROMO STUDIO http://127.0.0.1:4319'));
process.on('SIGINT',async()=>{server.close();await vite.close();process.exit(0);});

