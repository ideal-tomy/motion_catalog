import fs from 'node:fs';
import {setPresentation} from '../src/presentation.ts';
const base='http://127.0.0.1:4319';
async function api(url,method='GET',body){const r=await fetch(base+url,{method,headers:{'Content-Type':'application/json','X-Promo-Local':'1'},...(body?{body:JSON.stringify(body)}:{})});const j=await r.json();if(!r.ok)throw Error(j.error);return j;}
const p=await api('/api/editable-sample','POST',{});
p.title='DD 枠なし・フレーム切替 編集サンプル';p.brief='枠なし全画面を基本に、文字・素材・背景を独立して編集する確認例。完成CMの復元ではありません。';
p.theme.palette.background='#12232d';p.theme.palette.text='#f3f0e9';p.theme.palette.accent='#bcaa85';
p.scenes.forEach((s,i)=>{
 s.motionStack=[];s.colorOverrides={};s.layers.forEach(l=>l.motionStack=[]);
 const media=s.layers[0],text=s.layers[1];
 if(i===0)media.assetId=p.assets[1].assetId;
 setPresentation(s,media.layerId,['fullbleed','plain','browser','fullbleed'][i]);
 media.style={...media.style,cropX:50,cropY:i===0?0:50,mediaZoom:1};
 text.text=['根拠から、次の判断へ。','差異を、見過ごさない。','その判断に、根拠がある。','確信をもって、次の一手へ。'][i];
 text.transform={x:.06,y:i===0||i===3?.82:.06,width:.88,height:.12,rotateDeg:0};
 text.style={fontSize:55,colorToken:'text',align:'left',...(i===0||i===3?{background:'#12232d'}:{})};
});
p.revision++;await api('/api/projects/'+p.projectId,'PUT',{project:p,baseRevision:1});
fs.mkdirSync('docs/qa/presentation',{recursive:true});fs.writeFileSync('docs/qa/presentation/ready-project.json',JSON.stringify({projectId:p.projectId,url:base+'/?project='+p.projectId},null,2));console.log(p.projectId);

