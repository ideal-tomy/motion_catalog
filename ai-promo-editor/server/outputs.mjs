import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';
export function outputRoutes(app,root){
 const folder=id=>{if(!/^[a-zA-Z0-9_-]{2,64}$/.test(id))throw Error('Invalid project ID');return path.join(root,'workspace/projects',id);};
 async function output(id){let m;try{m=JSON.parse(await fs.readFile(path.join(folder(id),'render-output.json'),'utf8'));}catch(e){if(e.code==='ENOENT')return {available:false};throw e;}
 if(!/^[a-zA-Z0-9_-]{2,90}$/.test(m.job)||!/^\d+$/.test(String(m.sourceRevision))||!/^[a-f0-9]{64}$/.test(m.sourceSHA256))throw Error('Invalid render manifest');
 const video=path.resolve(root,'../promo-studio/jobs',m.job,'output/promo_16x9.mp4'),project=await fs.readFile(path.join(folder(id),'project.json'));
 await fs.access(video);const stale=crypto.createHash('sha256').update(project).digest('hex')!==m.sourceSHA256;
 return {available:true,sourceRevision:m.sourceRevision,sourceSHA256:m.sourceSHA256,stale,url:`/api/projects/${id}/rendered-video`,video};}
 app.get('/api/projects/:id/output',async(req,res)=>{const {video,...meta}=await output(req.params.id);res.json(meta);});
 app.get('/api/projects/:id/rendered-video',async(req,res)=>{const meta=await output(req.params.id);if(!meta.available)return res.status(404).json({error:'検査済みの出力がありません'});res.sendFile(meta.video);});
}
