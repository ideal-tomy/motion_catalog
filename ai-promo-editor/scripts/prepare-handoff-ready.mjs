import fs from 'node:fs';
import {ensureState,targetName} from '../src/handoff.ts';
const base='http://127.0.0.1:4319';
async function api(url,method='GET',body){const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json','X-Promo-Local':'1'},...(body?{body:JSON.stringify(body)}:{})});const j=await r.json();if(!r.ok)throw Error(j.error);return j;}
const source=JSON.parse(fs.readFileSync('docs/qa/presentation/ready-project.json')).projectId;
let p=await api('/api/projects/'+source+'/duplicate','POST',{});
async function save(){const baseRevision=p.revision;p.revision++;p=await api('/api/projects/'+p.projectId,'PUT',{project:p,baseRevision});}
p.title='DD 編集状態・Codex引き継ぎ 操作サンプル';p.brief='引き継ぎ機能の操作確認例です。メモはサンプルであり、ユーザーの新しい制作依頼ではありません。';await save();
p=await api('/api/projects/'+p.projectId+'/checkpoints','POST',{baseRevision:p.revision,label:'編集前（サンプル）'});
const l=p.scenes[0].layers[0];l.transform={x:.2,y:.2,width:.42,height:.62,rotateDeg:0};l.style={...l.style,presentation:'layer',mask:'ellipse',frame:'none'};l.zIndex=1;
p.meta.userEdits=[...(p.meta.userEdits??[]),`layer:${l.layerId}.transform`,`layer:${l.layerId}.style`];
const now=new Date().toISOString(),h=ensureState(p);
const targets=[{scope:'layer',sceneId:p.scenes[1].sceneId,layerId:p.scenes[1].layers[1].layerId},{scope:'project'},{scope:'project'}];
['【サンプル希望】このタイトルをタイプライター表示にし、後半にスキャンを重ねたい','【サンプル確認】余白と視線誘導が自然かレビューしてほしい','【サンプル出力注意】現在の確定状態を出力する際、文字切れ・音声・プレビューとの一致を確認する'].forEach((text,i)=>{const t=targets[i];h.notes.push({id:'note-'+crypto.randomUUID().slice(0,12),projectId:p.projectId,...t,targetName:targetName(p,t),text,kind:['wish','review','export'][i],status:'open',createdAt:now,updatedAt:now});});
await save();p=await api('/api/projects/'+p.projectId+'/checkpoints','POST',{baseRevision:p.revision,label:'手動編集済み（サンプル）'});
const result=await api('/api/projects/'+p.projectId+'/handoffs','POST',{baseRevision:p.revision,baselineId:ensureState(p).baselineId,purpose:'implement',selectedNoteIds:ensureState(p).notes.map(n=>n.id)});
fs.mkdirSync('docs/qa/handoff',{recursive:true});fs.writeFileSync('docs/qa/handoff/ready-project.json',JSON.stringify({projectId:p.projectId,url:base+'/?project='+p.projectId+'&panel=handoff',recordId:result.record.id,outputFolder:`workspace/projects/${p.projectId}/exports/${result.record.id}`},null,2));console.log(p.projectId);
