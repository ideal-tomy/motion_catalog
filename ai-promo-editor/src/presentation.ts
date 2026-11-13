import {markManual,protectedPath,type Project,type Scene,type Layer} from './core.ts';
import {layerBounds} from './geometry.ts';

export const presentations=[['fullbleed','枠なし・全画面'],['plain','枠なし・自由配置'],['rounded','角丸カード'],['browser','ブラウザ枠'],['ellipse','円・楕円'],['diagonal','斜めの切り抜き']] as const;
export type Presentation=typeof presentations[number][0];
export function presentationOf(l:Layer):Presentation{
 if(l.style?.presentation==='background')return 'fullbleed';
 if(l.style?.frame==='browser')return 'browser';
 if(l.style?.mask==='round-rect')return 'rounded';
 if(['circle','ellipse'].includes(String(l.style?.mask)))return 'ellipse';
 if(String(l.style?.mask).startsWith('diagonal'))return 'diagonal';
 return 'plain';
}
export function setPresentation(scene:Scene,layerId:string,mode:Presentation){
 const l=scene.layers.find(l=>l.layerId===layerId);
 if(!l||l.locked)throw Error('表示スタイルを変えるレイヤーの固定を解除してください');
 if(scene.layout.type!=='free'){
  if(scene.layers.some(l=>l.locked))throw Error('自由配置へ変更するため、固定レイヤーを解除してください');
  for(const item of scene.layers)item.transform=layerBounds(scene,item);
 }
 scene.layout={type:'free',direction:'horizontal',splitRatio:.5,cells:1};
 scene.unplacedLayerIds=scene.unplacedLayerIds.filter(id=>id!==layerId);
 l.style={...l.style,cellIndex:0,mask:'rect',frame:'none',presentation:'layer',fit:'cover'};
 delete l.style.layoutRegion;delete l.style.frameKind;delete l.style.templatePlaceholder;
 l.visible=true;
 if(mode==='fullbleed'){
  l.transform={x:0,y:0,width:1,height:1,rotateDeg:0};
  l.style.presentation='background';
  l.zIndex=Math.min(0,...scene.layers.filter(x=>x!==l).map(x=>x.zIndex))-1;
  l.inFrame=0;l.durationFrames=scene.durationFrames;
 }else{
  if(presentationOf({...l,style:{...l.style,presentation:undefined}})==='plain'&&(l.transform.width>=.98||l.transform.height>=.98))l.transform={x:.12,y:.22,width:.76,height:.64,rotateDeg:0};
  l.zIndex=Math.max(0,l.zIndex);
  if(mode==='rounded'){l.style.mask='round-rect';l.style.frame='card';}
  if(mode==='browser')l.style.frame='browser';
  if(mode==='ellipse'){l.style.mask='ellipse';l.transform={x:.28,y:.16,width:.44,height:.68,rotateDeg:0};}
  if(mode==='diagonal'){l.style.mask='diagonal-left';l.transform={x:.35,y:.04,width:.65,height:.92,rotateDeg:0};}
 }
}

export function applyPaletteToken(p:Project,token:string,value:string,includeSceneOverrides=true){
 if(protectedPath(p,'project',p.projectId,`theme.palette.${token}`,true))throw Error('全体色の固定を解除してください');
 const previous=p.theme.palette[token];
 for(const s of p.scenes){
  const resolved={...p.theme.palette,...s.colorOverrides};
  const sceneFixed=protectedPath(p,'scene',s.sceneId,'colorOverrides',true);
  if(sceneFixed){s.colorOverrides={...resolved};continue;}
  for(const l of s.layers){
   const fixed=protectedPath(p,'layer',l.layerId,'style.color',true)||protectedPath(p,'layer',l.layerId,'style.background',true)||protectedPath(p,'scene',s.sceneId,'layers',true);
   if(fixed){
    l.style={...l.style};
    if(l.kind==='text'&&!l.style.color)l.style.color=resolved[String(l.style.colorToken??'text')];
    if(['shape','overlay'].includes(l.kind)&&!l.style.background)l.style.background=resolved.primary;
    continue;
   }
   const old=resolved[token];
   if(token==='text'&&l.style?.color&&(l.style.color===old||l.style.color===previous)){delete l.style.color;l.style.colorToken='text';markManual(p,'layer',l.layerId,'style.color');}
   if(l.style?.background&&(l.style.background===old||l.style.background===previous)){l.style.background=value;markManual(p,'layer',l.layerId,'style.background');}
  }
  if(includeSceneOverrides&&Object.hasOwn(s.colorOverrides,token)){delete s.colorOverrides[token];markManual(p,'scene',s.sceneId,'colorOverrides');}
 }
 p.theme.palette[token]=value;markManual(p,'project',p.projectId,`theme.palette.${token}`);
}
