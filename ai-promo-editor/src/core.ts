import Ajv2020 from 'ajv/dist/2020.js';
import schema from '../examples/project.schema.json' with {type:'json'};
export type Motion={motionId:string;startOffsetFrames:number;durationFrames:number;params:Record<string,unknown>};
export type Layer={layerId:string;kind:'text'|'image'|'video'|'shape'|'overlay';zIndex:number;inFrame:number;durationFrames:number;opacity:number;visible:boolean;locked:boolean;text?:string;assetId?:string;transform:{x:number;y:number;width:number;height:number;rotateDeg:number};style?:{fontSize?:number;colorToken?:string;color?:string;background?:string;align?:'left'|'center'|'right';cellIndex?:number;mask?:string;trimStartFrames?:number;playbackRate?:number;[key:string]:unknown};motionStack:Motion[]};
export type Scene={sceneId:string;role:string;durationFrames:number;layout:{type:'single'|'split2'|'grid4'|'free';direction:'horizontal'|'vertical';splitRatio:number;cells:number;presetId?:string};paceKeyframes:{position:number;intensity:number}[];colorOverrides:Record<string,string>;unplacedLayerIds:string[];layers:Layer[]};
export type Asset={assetId:string;kind:'image'|'video'|'audio'|'logo';path:string;license?:string;verifiedForUse?:boolean;sourceUrl?:string;originalName?:string;posterPath?:string;width?:number;height?:number;durationSeconds?:number};
export type Project={schemaVersion:string;projectId:string;revision:number;title:string;brief?:string;video:{fps:number;width:number;height:number;targetDurationFrames:number;durationPolicy:'ripple'|'fixed'};theme:{requestedColors:{primary:string;secondary:string|null};palette:Record<string,string>;suggestedUsage?:Record<string,number|string>};assets:Asset[];scenes:Scene[];audioTracks:{trackId:string;assetId:string;startFrame:number;durationFrames:number;volume?:number;fadeInFrames?:number;fadeOutFrames?:number}[];locks:{scope:'project'|'scene'|'layer';targetId:string;field:string}[];meta?:{userEdits?:string[];lastEdit?:string;[key:string]:unknown}};
export type Operation={op:string;sceneId:string;layerId?:string;durationFrames?:number;text?:string;layout?:Scene['layout'];motionStack?:Motion[];colorOverrides?:Record<string,string>;paceKeyframes?:Scene['paceKeyframes'];layer?:Layer};
export type Proposal={proposalId:string;baseRevision:number;targetSceneId:string;reason:string;operations:Operation[];expectedTotalFrames?:number};
export const implemented=['M-003','M-008','M-012','M-017'];
const adaptedSchema=structuredClone(schema);
Object.assign(adaptedSchema.$defs.scene.properties.layout.properties,{presetId:{type:'string',pattern:'^L-(0[1-9]|1[0-2])$'}});
Object.assign(adaptedSchema.properties.assets.items.properties,{originalName:{type:'string',maxLength:255},posterPath:{type:'string',pattern:'^assets/[a-zA-Z0-9_-]+\\.thumb\\.jpg$'},width:{type:'integer',minimum:1,maximum:30000},height:{type:'integer',minimum:1,maximum:30000},durationSeconds:{type:'number',minimum:0}});
const validator=new Ajv2020({allErrors:true,strict:false}).compile(adaptedSchema);
export const clone=<T,>(x:T):T=>structuredClone(x);
export const totalFrames=(p:Project)=>p.scenes.reduce((n,s)=>n+s.durationFrames,0);
export const sceneStarts=(p:Project)=>{let n=0;return p.scenes.map(s=>{const start=n;n+=s.durationFrames;return start;});};
export const id=(prefix:string)=>`${prefix}-${crypto.randomUUID().slice(0,8)}`;
export function validateProject(p:unknown):asserts p is Project{
 if(!validator(p))throw Error(validator.errors?.map(e=>`${e.instancePath||'/'} ${e.message}`).slice(0,5).join(' / '));
 const x=p as Project;
 if(x.meta?.userEdits!==undefined&&(!Array.isArray(x.meta.userEdits)||x.meta.userEdits.some(v=>typeof v!=='string')))throw Error('手動編集の保護情報が不正です');
 const unique=(ids:string[],what:string)=>{if(new Set(ids).size!==ids.length)throw Error(`${what}のIDが重複しています`);};
 unique(x.scenes.map(s=>s.sceneId),'コマ');unique(x.assets.map(a=>a.assetId),'素材');unique(x.scenes.flatMap(s=>s.layers.map(l=>l.layerId)),'レイヤー');
 if(x.scenes.length<1||totalFrames(x)>x.video.fps*600)throw Error('総尺は10分以内にしてください');
 for(const a of x.assets)if(!/^assets\/[a-zA-Z0-9_.-]+$/.test(a.path))throw Error('素材パスはプロジェクト内assets/の相対パスに限定します');
 for(const s of x.scenes){
  const cells=s.layout.type==='grid4'?4:s.layout.type==='split2'?2:1;
  if(s.layout.cells!==cells)throw Error('分割セル数が一致していません');
  if(s.unplacedLayerIds.some(v=>!s.layers.some(l=>l.layerId===v)))throw Error('未配置レイヤーの参照が不正です');
  if(s.paceKeyframes.some((k,i)=>i>0&&k.position<=s.paceKeyframes[i-1].position))throw Error('緩急の位置は昇順にしてください');
  for(const [key,color]of Object.entries(s.colorOverrides))if(!Object.hasOwn(x.theme.palette,key)||!/^#[0-9a-f]{6}$/i.test(color))throw Error('コマ色が不正です');
  for(const l of s.layers){
   if(l.assetId&&!x.assets.some(a=>a.assetId===l.assetId))throw Error('参照素材がありません');
   if(['image','video'].includes(l.kind)&&!l.assetId)throw Error('画像・動画の素材を指定してください');
   if(l.kind==='text'&&typeof l.text!=='string')throw Error('文字列がありません');
   if(l.style?.color&&!/^#[0-9a-f]{6}$/i.test(l.style.color))throw Error('文字色が不正です');
   if(l.style?.fontSize!==undefined&&(!Number.isFinite(l.style.fontSize)||l.style.fontSize<8||l.style.fontSize>400))throw Error('文字サイズは8〜400です');
   if(l.style?.cellIndex!==undefined&&(!Number.isInteger(l.style.cellIndex)||l.style.cellIndex<0||l.style.cellIndex>3))throw Error('セルは1〜4です');
   if(l.style?.playbackRate!==undefined&&(!Number.isFinite(l.style.playbackRate)||l.style.playbackRate<.25||l.style.playbackRate>4))throw Error('動画速度は0.25〜4です');
   if(l.style?.trimStartFrames!==undefined&&(!Number.isInteger(l.style.trimStartFrames)||l.style.trimStartFrames<0))throw Error('トリム開始が不正です');
   if(l.style?.mask&&!['rect','circle','ellipse','diamond','round-rect','diagonal-left','diagonal-right'].includes(l.style.mask))throw Error('不明なマスクです');
   if(l.style?.fit!==undefined&&!['cover','contain'].includes(String(l.style.fit)))throw Error('素材のフィット方法が不正です');
   for(const key of ['cropX','cropY'])if(l.style?.[key]!==undefined&&(!Number.isFinite(l.style[key])||Number(l.style[key])<0||Number(l.style[key])>100))throw Error('切り抜き位置は0〜100です');
   for(const m of l.motionStack){if(!implemented.includes(m.motionId))throw Error(`${m.motionId}はこの編集器では未実装です`);const speed=Number(m.params.speed??1),opacity=Number(m.params.opacity??1),cps=Number(m.params.charactersPerSecond??12);if(!Number.isFinite(speed)||speed<.1||speed>5||!Number.isFinite(opacity)||opacity<0||opacity>1||!Number.isFinite(cps)||cps<=0||cps>200)throw Error('演出の速度・透明度が不正です');}
  }
 }
 for(const t of x.audioTracks)if(!x.assets.some(a=>a.assetId===t.assetId&&a.kind==='audio'))throw Error('音声素材がありません');
 for(const l of x.locks)if(l.scope==='scene'&&!x.scenes.some(s=>s.sceneId===l.targetId)||l.scope==='layer'&&!x.scenes.some(s=>s.layers.some(a=>a.layerId===l.targetId)))throw Error('固定対象がありません');
}
export function warnings(p:Project){
 const out:string[]=[];
 if(totalFrames(p)!==p.video.targetDurationFrames)out.push(`目標${p.video.targetDurationFrames/p.video.fps}秒に対して現在${totalFrames(p)/p.video.fps}秒。自動で他のコマを短縮していません。`);
 for(const s of p.scenes){for(const l of s.layers){if(l.inFrame+l.durationFrames>s.durationFrames)out.push(`${s.sceneId}: ${l.layerId}の終端がコマを超えます（表示はコマ末尾まで）`);if(l.motionStack.some(m=>m.startOffsetFrames+m.durationFrames>l.durationFrames))out.push(`${l.layerId}: 演出が表示区間を超えます`);}if(s.layout.type!=='free'&&s.layout.cells>1){const used=new Set(s.layers.filter(l=>l.visible).map(l=>l.style?.cellIndex??0));if(used.size<s.layout.cells)out.push(`${s.sceneId}: 未割当のセルがあります`);}}
 if(p.audioTracks.length===0)out.push('音声なしのプレビューです。');
 for(const a of p.audioTracks)if(a.startFrame+a.durationFrames<totalFrames(p))out.push('BGMが総尺より短い状態です。速度やループは自動変更しません。');
 return out;
}
export const fieldPath=(scope:string,target:string,field:string)=>`${scope}:${target}.${field}`;
export function protectedPath(p:Project,scope:'project'|'scene'|'layer',target:string,field:string,manual=false){
 const path=fieldPath(scope,target,field);
 const lock=p.locks.some(l=>l.scope===scope&&(scope==='project'||l.targetId===target)&&(l.field==='*'||field===l.field||field.startsWith(l.field+'.')));
 const layer=scope==='layer'?p.scenes.flatMap(s=>s.layers).find(l=>l.layerId===target):null;
 return lock||!!layer?.locked||(!manual&&(p.meta?.userEdits??[]).some(v=>v===path||path.startsWith(v+'.')||v.startsWith(path+'.')));
}
export function markManual(p:Project,scope:'project'|'scene'|'layer',target:string,field:string){p.meta??={};p.meta.userEdits=[...new Set([...(p.meta.userEdits??[]),fieldPath(scope,target,field)])];}
export function setLayout(scene:Scene,type:Scene['layout']['type']){delete scene.layout.presetId;scene.layout.type=type;scene.layout.cells=type==='grid4'?4:type==='split2'?2:1;scene.unplacedLayerIds=scene.layers.filter(l=>type!=='free'&&(l.style?.cellIndex??0)>=scene.layout.cells).map(l=>l.layerId);}
export function redistribution(p:Project,sceneId:string,frames:number){
 const next=clone(p),scene=next.scenes.find(s=>s.sceneId===sceneId);if(!scene)throw Error('コマがありません');
 scene.durationFrames=frames;let delta=totalFrames(next)-p.video.targetDurationFrames;
 const donors=next.scenes.filter(s=>s.sceneId!==sceneId&&!protectedPath(p,'scene',s.sceneId,'durationFrames',true));
 if(delta>0){for(const s of [...donors].sort((a,b)=>b.durationFrames-a.durationFrames)){const take=Math.min(delta,Math.max(0,s.durationFrames-p.video.fps));s.durationFrames-=take;delta-=take;if(!delta)break;}}else if(delta<0&&donors[0]){donors[0].durationFrames-=delta;delta=0;}
 if(delta!==0)throw Error('固定尺に再配分できる時間が足りません');
 validateProject(next);return next;
}
const ops=['setSceneDuration','setLayout','setLayerText','setLayerMotionStack','setSceneTheme','setPaceKeyframes','addLayer'];
export function previewPatch(p:Project,proposal:Proposal,indices?:number[]){
 if(!proposal||typeof proposal.proposalId!=='string'||!/^[-a-zA-Z0-9_]{2,80}$/.test(proposal.proposalId)||typeof proposal.reason!=='string'||!Array.isArray(proposal.operations)||proposal.operations.length<1||proposal.operations.length>50)throw Error('部分修正の形式が不正です');
 if(proposal.baseRevision!==p.revision)throw Error('編集が進んでいるため競合しています。現在の版で提案を作り直してください。');
 if(!p.scenes.some(s=>s.sceneId===proposal.targetSceneId))throw Error('対象コマがありません');
 const next=clone(p),diff:{operation:number;label:string;before:unknown;after:unknown}[]=[];
 proposal.operations.forEach((o,i)=>{
  if(!ops.includes(o.op)||o.sceneId!==proposal.targetSceneId)throw Error('対象外のコマ・操作への変更は許可しません');
  if(indices&&!indices.includes(i))return;
  const s=next.scenes.find(s=>s.sceneId===o.sceneId)!;const l=s.layers.find(l=>l.layerId===o.layerId);
  let scope:'scene'|'layer'='scene',target=s.sceneId,field='',before:unknown,after:unknown;
  if(o.op==='setSceneDuration'){field='durationFrames';before=s.durationFrames;after=o.durationFrames;}
  if(o.op==='setLayout'){field='layout';before=s.layout;after=o.layout;}
  if(o.op==='setSceneTheme'){field='colorOverrides';before=s.colorOverrides;after=o.colorOverrides;}
  if(o.op==='setPaceKeyframes'){field='paceKeyframes';before=s.paceKeyframes;after=o.paceKeyframes;}
  if(o.op==='addLayer'){field='layers';before=null;after=o.layer;}
  if(['setLayerText','setLayerMotionStack'].includes(o.op)){if(!l)throw Error('対象レイヤーがありません');scope='layer';target=l.layerId;field=o.op==='setLayerText'?'text':'motionStack';before=o.op==='setLayerText'?l.text:l.motionStack;after=o.op==='setLayerText'?o.text:o.motionStack;}
  if(protectedPath(p,'scene',s.sceneId,'*')||protectedPath(p,scope,target,field))throw Error(`${target} / ${field} は手動編集済みまたは固定されています。`);
  if(after===undefined)throw Error('変更後の値がありません');
  if(o.op==='setSceneDuration')s.durationFrames=o.durationFrames!;
  if(o.op==='setLayout'){s.layout=clone(o.layout!);setLayout(s,s.layout.type);}
  if(o.op==='setSceneTheme')s.colorOverrides=clone(o.colorOverrides!);
  if(o.op==='setPaceKeyframes')s.paceKeyframes=clone(o.paceKeyframes!);
  if(o.op==='addLayer')s.layers.push(clone(o.layer!));
  if(o.op==='setLayerText')l!.text=o.text!;
  if(o.op==='setLayerMotionStack')l!.motionStack=clone(o.motionStack!);
  diff.push({operation:i,label:`${target} / ${field}`,before:clone(before),after:clone(after)});
 });
 validateProject(next);
 if((!indices||indices.length===proposal.operations.length)&&proposal.expectedTotalFrames!==undefined&&totalFrames(next)!==proposal.expectedTotalFrames)throw Error('提案の総尺と結果が一致しません');
 return {next,diff};
}
export function newLayer(scene:Scene,kind:Layer['kind']='text',assetId?:string):Layer{return {layerId:id('layer'),kind,zIndex:Math.max(0,...scene.layers.map(l=>l.zIndex))+1,inFrame:0,durationFrames:scene.durationFrames,opacity:1,visible:true,locked:false,...(kind==='text'?{text:'新しいテキスト'}:{}),...(assetId?{assetId}:{}),transform:{x:.1,y:.25,width:.8,height:.45,rotateDeg:0},style:{fontSize:78,colorToken:'text',align:'center',cellIndex:0,mask:'rect'},motionStack:[]};}
