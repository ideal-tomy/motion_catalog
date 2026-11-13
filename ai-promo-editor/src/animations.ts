import type {Layer,Scene,Project} from './core';
import {layerBounds} from './geometry.ts';
export type Scope='scene'|'group'|'frame'|'imageContent'|'text'|'shape';
export type Animation={id:string;targetLayerId?:string;targetScope:Scope;presetId:string;startFrame:number;durationFrames:number;params:{direction?:string;exitBoundary?:string;easing?:string;overshootPx?:number;distancePx?:number;scale?:number;rotationDeg?:number;fromCurrentPosition?:boolean};afterEnd:'holdEnd'|'restoreBase'|'hide'};
const names=['左から登場','右から登場','上から登場','下から登場','左へ退出','右へ退出','上へ退出','下へ退出','フェードイン','フェードアウト','ズームイン','ズームアウト','回転登場','回転退出','ポップ','バウンス','左からワイプ','右からワイプ','中央から展開','スキャン','タイプライター','文字順次表示','グリッチ','ゆっくりパン'];
const directions=['left','right','up','down'];
export const scopeNames:Record<Scope,string>={scene:'コマ全体',group:'紐づくグループ',frame:'枠全体',imageContent:'枠を固定・内部画像',text:'文字だけ',shape:'図形だけ'};
export const animationCatalog=names.map((name,i)=>{
 const n=i+1,category=n<=8?'移動':n<=12?'基本':n<=16?'強調':n<=20?'表示':n<=23?'文字':'画像';
 const supportedTargets:Scope[]=n>=21&&n<=23?['text']:n===24?['imageContent']:['scene','group','frame','imageContent','text','shape'];
 const direction=n<=8?directions[i%4]:n===18?'right':'left';
 const description=n<=4?'画面外から元の配置へ登場':n<=8?'元の配置から境界の外へ完全に退出':n===9?'透明から不透明へ':n===10?'不透明から透明へ':n===11?'小さく始まり元のサイズへ':n===12?'元のサイズから縮小':n===13?'回転しながら表示':n===14?'回転して透明に退出':n===15?'一瞬拡大して元に戻る':n===16?'弾みながら登場':n===17?'左から表示領域を開く':n===18?'右から表示領域を開く':n===19?'中央から左右に展開':n===20?'発光線が対象を横断':n===21?'実際の文字列を順に表示':n===22?'文字ごとに時間差で登場':n===23?'一時的な文字乱れから元の文字へ復帰':'固定マスク内の素材をゆっくり移動';
 return {id:`A-${String(n).padStart(3,'0')}`,name,category,description,tags:[n<=8?'スピード':'高級',n<=4||[9,11,13,16,17,18,19,21,22].includes(n)?'登場':n<=8||[10,12,14].includes(n)?'退出':'強調',direction,n>=21&&n<=23?'文字':'素材'],supportedTargets,parameters:['startFrame','durationFrames','easing','afterEnd',...(n<=8?['direction','overshootPx','distancePx','exitBoundary']:n===24?['direction','distancePx']:n===11||n===12?['scale']:n===13||n===14?['rotationDeg']:[])],defaultParams:{direction,exitBoundary:'canvas',easing:'easeInOut',overshootPx:24,distancePx:0,scale:.65,rotationDeg:90,fromCurrentPosition:true},previewSample:{kind:n>=21&&n<=23?'text':'image',text:'MOTION ATLAS'},status:{preview:true,apply:true,mp4:false},properties:n<=8||n===24?['position']:n<=10?['opacity']:n<=12||n===15?['scale']:n<=14?['rotation','opacity']:n===16?['position','opacity']:n<=19?['clip']:n===20?['scan']:['text']};
});
export const presetOf=(id:string)=>animationCatalog.find(p=>p.id===id);
export function remapLayerAnimations(l:Layer){for(const a of l.animations??[]){a.id=`anim-${crypto.randomUUID().slice(0,8)}`;a.targetLayerId=l.layerId;}}
export function remapSceneAnimations(s:Scene,map:Map<string,string>){for(const a of s.animations??[])a.id=`anim-${crypto.randomUUID().slice(0,8)}`;for(const l of s.layers){remapLayerAnimations(l);if(l.style?.parentFrameId)l.style.parentFrameId=map.get(String(l.style.parentFrameId));}}
export function targetReason(presetId:string,scope:Scope,layer?:Layer,scene?:Scene){
 const p=presetOf(presetId);if(!p)return '登録されていません';
 if(!p.supportedTargets.includes(scope))return 'この動きはこの適用範囲に対応していません';
 if(scope==='scene')return '';
 if(!layer)return 'レイヤーを選択してください';
 if(scope==='imageContent'&&!['image','video'].includes(layer.kind))return '内部画像には画像・動画が必要です';
 if(scope==='text'&&layer.kind!=='text')return '文字レイヤー専用です';
 if(scope==='shape'&&!['shape','overlay'].includes(layer.kind))return '図形レイヤー専用です';
 if(scope==='group'&&!scene?.layers.some(l=>l.style?.parentFrameId===layer.layerId))return '紐づくレイヤーがありません。親フレームを設定してください';
 return '';
}
export function makeAnimation(presetId:string,scope:Scope,layerId?:string):Animation{const p=presetOf(presetId)!;return {id:`anim-${crypto.randomUUID().slice(0,8)}`,presetId,targetScope:scope,...(scope==='scene'?{}:{targetLayerId:layerId}),startFrame:0,durationFrames:24,params:{...p.defaultParams,exitBoundary:scope==='imageContent'?'parentFrame':'canvas'},afterEnd:'holdEnd'};}
export type Rect={x:number;y:number;w:number;h:number;rotation?:number};
export function logicalRect(scene:Scene,layer:Layer,p:Project):Rect{const b=layerBounds(scene,layer);return {x:b.x*p.video.width,y:b.y*p.video.height,w:b.width*p.video.width,h:b.height*p.video.height,rotation:b.rotateDeg};}
export function aabb(r:Rect){const q=(r.rotation??0)*Math.PI/180,w=Math.abs(r.w*Math.cos(q))+Math.abs(r.h*Math.sin(q)),h=Math.abs(r.w*Math.sin(q))+Math.abs(r.h*Math.cos(q));return {x:r.x+r.w/2-w/2,y:r.y+r.h/2-h/2,w,h};}
export function exitDelta(r:Rect,boundary:Rect,direction:string,overshoot:number){const b=aabb(r);return direction==='right'?{x:boundary.x+boundary.w-b.x+overshoot,y:0}:direction==='up'?{x:0,y:boundary.y-(b.y+b.h)-overshoot}:direction==='down'?{x:0,y:boundary.y+boundary.h-b.y+overshoot}:{x:boundary.x-(b.x+b.w)-overshoot,y:0};}
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
function ease(p:number,name?:string){return name==='linear'?p:name==='easeIn'?p*p*p:name==='easeOut'?1-(1-p)**3:p<.5?4*p*p*p:1-(-2*p+2)**3/2;}
export type Delta={x:number;y:number;scale:number;rotation:number;opacity:number;clip?:string;scan?:number;textProgress?:number;textMode?:number};
export const identity=():Delta=>({x:0,y:0,scale:1,rotation:0,opacity:1});
export function inverseBoundary(boundary:Rect,pivot:{x:number;y:number},d:Delta):Rect{const angle=-d.rotation*Math.PI/180,s=Math.max(.00001,d.scale),corners=[[boundary.x,boundary.y],[boundary.x+boundary.w,boundary.y],[boundary.x+boundary.w,boundary.y+boundary.h],[boundary.x,boundary.y+boundary.h]].map(([x,y])=>({x:pivot.x+((x-pivot.x-d.x)*Math.cos(angle)-(y-pivot.y-d.y)*Math.sin(angle))/s,y:pivot.y+((x-pivot.x-d.x)*Math.sin(angle)+(y-pivot.y-d.y)*Math.cos(angle))/s})),x=Math.min(...corners.map(c=>c.x)),y=Math.min(...corners.map(c=>c.y));return {x,y,w:Math.max(...corners.map(c=>c.x))-x,h:Math.max(...corners.map(c=>c.y))-y};}
export function evaluateAnimations(items:Animation[],frame:number,rect:Rect,canvas:Rect,parent?:Rect):Delta{
 const poseItems=items.filter(a=>Number(a.presetId.slice(2))>=11&&Number(a.presetId.slice(2))<=16);
 const pose=items.some(a=>Number(a.presetId.slice(2))<=8)&&poseItems.length?evaluateAnimations(poseItems,frame,rect,canvas,parent):identity();
 const posed={x:rect.x+rect.w*(1-pose.scale)/2+pose.x,y:rect.y+rect.h*(1-pose.scale)/2+pose.y,w:rect.w*pose.scale,h:rect.h*pose.scale,rotation:(rect.rotation??0)+pose.rotation};
 const d=identity();for(const a of items){
  if(frame<a.startFrame)continue;
  const raw=clamp((frame-a.startFrame)/a.durationFrames);if(raw>=1&&a.afterEnd==='restoreBase')continue;if(raw>=1&&a.afterEnd==='hide'){d.opacity=0;continue;}
  const t=ease(raw,a.params.easing),n=Number(a.presetId.slice(2)),dir=a.params.direction??'left',over=a.params.overshootPx??24;
  if(n<=8){const boundary=a.params.exitBoundary==='parentFrame'?(parent??{x:0,y:0,w:rect.w,h:rect.h}):canvas;
   const local=posed;
   let v=exitDelta(local,boundary,dir,over);const distance=a.params.distancePx??0;if(distance>0)v={x:v.x?Math.sign(v.x)*Math.max(Math.abs(v.x),distance):0,y:v.y?Math.sign(v.y)*Math.max(Math.abs(v.y),distance):0};
   const f=n<=4?1-t:t;d.x+=v.x*f;d.y+=v.y*f;
  }else if(n===9)d.opacity*=t;else if(n===10)d.opacity*=1-t;
  else if(n===11)d.scale*=(a.params.scale??.65)+(1-(a.params.scale??.65))*t;
  else if(n===12)d.scale*=1+((a.params.scale??.65)-1)*t;
  else if(n===13||n===14){d.rotation+=(a.params.rotationDeg??90)*(n===13?1-t:t);d.opacity*=n===13?t:1-t;}
  else if(n===15)d.scale*=1+.22*Math.sin(Math.PI*t);
  else if(n===16){const f=raw===1?0:Math.exp(-7*raw)*Math.cos(12*raw);d.y-=rect.h*.4*f;d.opacity*=Math.min(1,raw*5);}
  else if(n===17)d.clip=`inset(0 ${(1-t)*100}% 0 0)`;
  else if(n===18)d.clip=`inset(0 0 0 ${(1-t)*100}%)`;
  else if(n===19)d.clip=`inset(0 ${(1-t)*50}% 0 ${(1-t)*50}%)`;
  else if(n===20&&raw<1)d.scan=t;
  else if(n>=21&&n<=23){d.textProgress=t;d.textMode=n;}
  else if(n===24){const distance=a.params.distancePx||rect.w*.12;d.x+=(dir==='right'?1:dir==='left'?-1:0)*distance*t;d.y+=(dir==='down'?1:dir==='up'?-1:0)*distance*t;}
 }return d;
}
export const deltaTransform=(d:Delta)=>`translate(${d.x}px, ${d.y}px) rotate(${d.rotation}deg) scale(${d.scale})`;
export function conflicts(items:Animation[]){const out:string[]=[];items.forEach((a,i)=>items.slice(i+1).forEach(b=>{if((a.targetScope==='imageContent')===(b.targetScope==='imageContent')&&a.startFrame<b.startFrame+b.durationFrames&&b.startFrame<a.startFrame+a.durationFrames&&presetOf(a.presetId)?.properties.some(v=>presetOf(b.presetId)?.properties.includes(v)))out.push(`${a.presetId} と ${b.presetId}: 同じ範囲・プロパティが重複（移動/回転は加算、拡大/透明度は乗算、文字/クリップは一覧の後を優先）`);}));return out;}
export function validateAnimations(p:Project){const ids=new Set<string>();for(const s of p.scenes){for(const l of s.layers){const parent=l.style?.parentFrameId;if(parent!==undefined&&(typeof parent!=='string'||parent===l.layerId||!s.layers.some(v=>v.layerId===parent)||s.layers.find(v=>v.layerId===parent)?.style?.parentFrameId))throw Error('親フレームは同じコマ内の単一階層で指定してください');}
 for(const [owner,items]of [[undefined,s.animations??[]],...s.layers.map(l=>[l,l.animations??[]] as const)] as const){for(const a of items){if(!a||typeof a.id!=='string'||ids.has(a.id))throw Error('アニメーションIDが不正・重複しています');ids.add(a.id);if(!presetOf(a.presetId)||!['holdEnd','restoreBase','hide'].includes(a.afterEnd)||!Number.isInteger(a.startFrame)||a.startFrame<0||a.startFrame>=s.durationFrames||!Number.isInteger(a.durationFrames)||a.durationFrames<1||a.durationFrames>180000)throw Error('アニメーションの時間・種類が不正です');if(owner?a.targetLayerId!==owner.layerId||a.targetScope==='scene':a.targetScope!=='scene'||a.targetLayerId!==undefined)throw Error('アニメーション対象IDが一致しません');const reason=targetReason(a.presetId,a.targetScope,owner,s);if(reason)throw Error(reason);if(!a.params||typeof a.params!=='object'||Array.isArray(a.params))throw Error('パラメータが不正です');for(const [key,value]of Object.entries(a.params)){if(['overshootPx','distancePx','scale','rotationDeg'].includes(key)){if(typeof value!=='number'||!Number.isFinite(value)||Math.abs(value)>30000||(['overshootPx','distancePx'].includes(key)&&value<0)||key==='scale'&&(value<=0||value>10))throw Error('アニメーション数値が不正です');}else if(key==='direction'&&!directions.includes(String(value))||key==='exitBoundary'&&!['canvas','parentFrame'].includes(String(value))||key==='easing'&&!['linear','easeIn','easeOut','easeInOut'].includes(String(value))||key==='fromCurrentPosition'&&value!==true||!['overshootPx','distancePx','scale','rotationDeg','direction','exitBoundary','easing','fromCurrentPosition'].includes(key))throw Error('アニメーション設定が不正です');}
 if(a.targetScope!=='imageContent'&&a.params.exitBoundary==='parentFrame')throw Error('親枠境界は内部画像に指定してください');
 }}}}



