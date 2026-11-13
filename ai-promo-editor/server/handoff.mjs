import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import {validateProject} from '../src/core.ts';
import {stateOf,ensureState,snapshotOf,buildHandoff,targetExists,purposeNames} from '../src/handoff.ts';
import {zipStore} from './zip.mjs';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const safe=id=>{if(!/^[-a-zA-Z0-9_]{2,80}$/.test(id))throw Error('Invalid ID');return id;};
export function handoffRoutes(app,{workspace,atomic,serial}){
 const folder=id=>path.join(workspace,safe(id));
 const read=async file=>JSON.parse(await fs.readFile(file,'utf8'));
 async function saved(id,revision){const p=await read(path.join(folder(id),'project.json'));validateProject(p);if(p.revision!==revision){const e=Error('保存版が変わりました。最新の状態からやり直してください');e.status=409;throw e;}return p;}
 async function persist(old,next){validateProject(next);const root=folder(next.projectId);await fs.mkdir(path.join(root,'history'),{recursive:true});await atomic(path.join(root,'history',old.revision+'.json'),old);await atomic(path.join(root,'project.json'),next);}
 async function checkpoint(p,id){validateProject(p);const c=stateOf(p).checkpoints.find(c=>c.id===id);if(!c)throw Error('チェックポイントがありません');const file=path.join(folder(p.projectId),c.storedPath),stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink())throw Error('チェックポイントの実体が不正です');const bytes=await fs.readFile(file);if(sha(bytes)!==c.sha256)throw Error('チェックポイントのハッシュが一致しません');const snapshot=JSON.parse(bytes);validateProject(snapshot);if(snapshot.projectId!==p.projectId)throw Error('別作品のチェックポイントです');return snapshot;}
 app.get('/api/projects/:id/checkpoints/:checkpointId',async(req,res)=>{const p=await read(path.join(folder(req.params.id),'project.json')),snapshot=await checkpoint(p,safe(req.params.checkpointId));if(req.query.restore==='1')for(const a of snapshot.assets){try{const stat=await fs.lstat(path.join(folder(p.projectId),a.path));if(!stat.isFile()||stat.isSymbolicLink())throw Error('Invalid file');}catch{throw Error(`復元に必要な素材がありません：${a.assetId} / ${a.path}`);}}res.json(snapshot);});
 app.post('/api/projects/:id/checkpoints',async(req,res)=>{
  try{const p=await serial(async()=>{const old=await saved(req.params.id,req.body.baseRevision),p=structuredClone(old),h=ensureState(p);const label=String(req.body.label??'').trim();if(!label||label.length>120||h.checkpoints.length>=100)throw Error('名前を120文字以内で指定してください。チェックポイント上限は100件です');const id='cp-'+crypto.randomUUID().slice(0,12),bytes=Buffer.from(JSON.stringify(snapshotOf(old),null,2)),c={id,projectId:p.projectId,label,createdAt:new Date().toISOString(),projectVersion:old.revision,sha256:sha(bytes),storedPath:`checkpoints/${id}.json`};await fs.mkdir(path.join(folder(p.projectId),'checkpoints'),{recursive:true});await fs.writeFile(path.join(folder(p.projectId),c.storedPath),bytes,{flag:'wx'});h.checkpoints.push(c);h.baselineId??=id;p.revision++;await persist(old,p);return p;});res.json(p);}catch(e){res.status(e.status??400).json({error:e.message});}
 });
 app.post('/api/projects/:id/handoffs',async(req,res)=>{
  try{const result=await serial(async()=>{
   const old=await saved(req.params.id,req.body.baseRevision),p=structuredClone(old),h=ensureState(p),purpose=req.body.purpose;
   if(!Object.hasOwn(purposeNames,purpose)||h.records.length>=100)throw Error('引き継ぎの目的が不正、または100件の上限です');
   const selected=req.body.selectedNoteIds;if(!Array.isArray(selected)||new Set(selected).size!==selected.length||selected.some(id=>!h.notes.some(n=>n.id===id)))throw Error('選択メモがありません');
   const baselineId=req.body.baselineId||undefined,baseline=baselineId?await checkpoint(p,baselineId):null;
   const id='hf-'+crypto.randomUUID().slice(0,12),record={id,baselineCheckpointId:baselineId,targetRevision:old.revision+1,purpose,createdAt:new Date().toISOString(),selectedNoteIds:selected,allowedTargets:purpose==='implement'?h.notes.filter(n=>selected.includes(n.id)&&n.kind==='wish'&&['open','waiting'].includes(n.status)&&targetExists(p,n)).map(n=>({scope:n.scope,...(n.sceneId?{sceneId:n.sceneId}:{}),...(n.layerId?{layerId:n.layerId}:{})})):[],exportPaths:['handoff.md','project.json','diff.json','asset-manifest.json','handoff.json','bundle.zip'].map(n=>`exports/${id}/${n}`)};
   h.records.push(record);if(purpose==='implement')h.activeHandoffId=id;p.revision++;validateProject(p);
   const manifest=[],assetEntries=[],warnings=[];
   for(const a of p.assets){const m={assetId:a.assetId,originalName:a.originalName??a.path,mediaType:a.kind,storedPath:a.path,licenseOrSource:a.license??a.sourceUrl??'利用条件未記録',available:false};try{const file=path.join(folder(p.projectId),a.path),stat=await fs.lstat(file);if(!stat.isFile()||stat.isSymbolicLink())throw Error('ファイル種別が不正');const data=await fs.readFile(file);Object.assign(m,{available:true,sha256:sha(data),bytes:data.length});assetEntries.push({name:a.path,data});}catch{m.warning='素材ファイルが見つからないか安全に参照できません';warnings.push(`${a.assetId}: ${m.warning}`);}manifest.push(m);if(a.posterPath){try{const stat=await fs.lstat(path.join(folder(p.projectId),a.posterPath));if(!stat.isFile()||stat.isSymbolicLink())throw Error('Invalid poster');assetEntries.push({name:a.posterPath,data:await fs.readFile(path.join(folder(p.projectId),a.posterPath))});}catch{warnings.push(`${a.assetId}: サムネイルは一式に含まれません`);}}}
   const checkpointEntries=[];for(const c of h.checkpoints){try{const snapshot=await checkpoint(p,c.id);checkpointEntries.push({name:c.storedPath,data:await fs.readFile(path.join(folder(p.projectId),c.storedPath))});for(const a of snapshot.assets)for(const media of [a.path,...(a.posterPath?[a.posterPath]:[])])if(!assetEntries.some(e=>e.name===media)){try{const stat=await fs.lstat(path.join(folder(p.projectId),media));if(!stat.isFile()||stat.isSymbolicLink())throw Error('Invalid asset');assetEntries.push({name:media,data:await fs.readFile(path.join(folder(p.projectId),media))});}catch{warnings.push(`${c.id}: 復元素材が一式に含まれません：${media}`);}}}catch(e){warnings.push(`${c.id}: ${e.message}`);}}
   const {report,markdown}=buildHandoff(p,baseline,record,manifest,warnings),projectBytes=Buffer.from(JSON.stringify(p,null,2));report.projectSHA256=sha(projectBytes);
   const files={'handoff.md':Buffer.from(markdown),'project.json':projectBytes,'diff.json':Buffer.from(JSON.stringify(report.changes,null,2)),'asset-manifest.json':Buffer.from(JSON.stringify(manifest,null,2)),'handoff.json':Buffer.from(JSON.stringify(report,null,2))};
   const readme=Buffer.from('このフォルダのproject.jsonが正本です。assets/とcheckpoints/を同じ案件フォルダに保持してください。既存案件へ無断上書きせず、別フォルダで確認してください。レポートに記載した素材欠落に注意。過去の引き継ぎ出力と保存履歴はこのZIPに含まれません。動画ファイル自体は生成していません。\n');
   // ZIP failure must not discard the MD/JSON report. Its absence is explicit.
   let zipWarning=null;try{files['bundle.zip']=zipStore([...Object.entries(files).map(([name,data])=>({name,data})),{name:'README.txt',data:readme},...assetEntries,...checkpointEntries]);}catch(e){zipWarning=e.message;record.exportPaths=record.exportPaths.filter(x=>!x.endsWith('bundle.zip'));files['project.json']=Buffer.from(JSON.stringify(p,null,2));report.projectSHA256=sha(files['project.json']);report.warnings.push('ZIP未作成：'+zipWarning);files['handoff.md']=Buffer.from(markdown+'\n- ZIP未作成：'+zipWarning+'\n');files['handoff.json']=Buffer.from(JSON.stringify(report,null,2));}
   const dest=path.join(folder(p.projectId),'exports',id);await fs.mkdir(dest,{recursive:true});for(const [name,data]of Object.entries(files))await fs.writeFile(path.join(dest,name),data,{flag:'wx'});
   await persist(old,p);return {project:p,record,markdown:files['handoff.md'].toString('utf8'),report,zipWarning};
  });res.json(result);}catch(e){res.status(e.status??400).json({error:e.message});}
 });
 app.get('/api/projects/:id/handoffs/:handoffId/:file',async(req,res)=>{
  const p=await read(path.join(folder(req.params.id),'project.json')),r=stateOf(p).records.find(r=>r.id===safe(req.params.handoffId));
  if(!r||!['handoff.md','project.json','diff.json','asset-manifest.json','handoff.json','bundle.zip'].includes(req.params.file)||!r.exportPaths.includes(`exports/${r.id}/${req.params.file}`))return res.status(404).json({error:'出力ファイルがありません'});
  res.download(path.join(folder(p.projectId),'exports',r.id,req.params.file),`${r.id}-${req.params.file}`);
 });
}

// Duplicates get independent notes/checkpoints; no cross-project pointers remain.
export async function copyHandoff(old,p,source,dest){
 if(!old.meta?.handoff)return;const h=ensureState(p);h.notes.forEach(n=>n.projectId=p.projectId);h.records=[];delete h.activeHandoffId;
 if(h.checkpoints.length)await fs.mkdir(path.join(dest,'checkpoints'),{recursive:true});
 for(const c of h.checkpoints){const bytes=await fs.readFile(path.join(source,c.storedPath));if(sha(bytes)!==c.sha256)throw Error('複製元チェックポイントが不正です');const snapshot=JSON.parse(bytes);snapshot.projectId=p.projectId;for(const a of snapshot.assets)for(const media of [a.path,...(a.posterPath?[a.posterPath]:[])]){const target=path.join(dest,media);try{await fs.access(target);}catch{const stat=await fs.lstat(path.join(source,media));if(!stat.isFile()||stat.isSymbolicLink())throw Error('復元用素材が不正です');await fs.mkdir(path.dirname(target),{recursive:true});await fs.copyFile(path.join(source,media),target);}}const updated=Buffer.from(JSON.stringify(snapshot,null,2));c.projectId=p.projectId;c.sha256=sha(updated);await fs.writeFile(path.join(dest,c.storedPath),updated,{flag:'wx'});}
}
